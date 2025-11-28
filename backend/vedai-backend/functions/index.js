// Load environment variables from .env file
require('dotenv').config();


const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require('node-fetch');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Simple in-memory rate limiter (per IP, per endpoint)
const RATE_LIMIT = 10; // requests
const RATE_WINDOW = 60 * 1000; // 1 minute
const rateLimitMap = {};

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.ip ||
    req.connection?.remoteAddress ||
    'unknown'
  );
}

function checkRateLimit(endpoint, req, res) {
  const ip = getClientIp(req);
  const key = `${endpoint}:${ip}`;
  const now = Date.now();
  if (!rateLimitMap[key]) {
    rateLimitMap[key] = [];
  }
  // Remove old timestamps
  rateLimitMap[key] = rateLimitMap[key].filter(ts => now - ts < RATE_WINDOW);
  if (rateLimitMap[key].length >= RATE_LIMIT) {
    res.status(429).json({ error: `Rate limit exceeded: ${RATE_LIMIT} requests per minute.` });
    return false;
  }
  rateLimitMap[key].push(now);
  return true;
}

admin.initializeApp();

// Initialize Firestore for caching and stats
const db = admin.firestore();


// Gemini API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is not set in environment variables!");
  console.error("Please create a .env file with GEMINI_API_KEY=your_api_key");
} else {
  console.log("✅ GEMINI_API_KEY loaded successfully");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Available Gemini models for rotation (to avoid 429 rate limits)
const AVAILABLE_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash-native-audio-dialog',
];

// Model rotation state
let currentModelIndex = 0;
let modelUsageCount = {};
let modelSuccessCount = {};
let modelFailureCount = {};
let lastResetTime = Date.now();

// Reset usage counter every 60 seconds
const RESET_INTERVAL = 60000; // 1 minute

/**
 * Get next available model using round-robin rotation
 * @returns {string} - Model name
 */
const getNextModel = () => {
  // Reset counters if interval passed
  if (Date.now() - lastResetTime > RESET_INTERVAL) {
    console.log('📊 Model Performance Summary:');
    AVAILABLE_MODELS.forEach(model => {
      const success = modelSuccessCount[model] || 0;
      const failure = modelFailureCount[model] || 0;
      const total = success + failure;
      const successRate = total > 0 ? ((success / total) * 100).toFixed(1) : 'N/A';
      console.log(`  ${model}: ${success}/${total} (${successRate}% success)`);
    });
    
    // Save stats to Firestore before reset
    saveModelStats().catch(err => console.error('Failed to save stats:', err));
    
    modelUsageCount = {};
    modelSuccessCount = {};
    modelFailureCount = {};
    lastResetTime = Date.now();
    console.log('🔄 Reset model usage counters');
  }

  // Round-robin selection
  const selectedModel = AVAILABLE_MODELS[currentModelIndex];
  currentModelIndex = (currentModelIndex + 1) % AVAILABLE_MODELS.length;
  
  // Track usage
  modelUsageCount[selectedModel] = (modelUsageCount[selectedModel] || 0) + 1;
  
  console.log(`🎯 Selected model: ${selectedModel} (used ${modelUsageCount[selectedModel]} times)`);
  console.log(`📊 Model usage stats:`, modelUsageCount);
  
  return selectedModel;
};

/**
 * Record model success
 */
const recordSuccess = (modelName) => {
  modelSuccessCount[modelName] = (modelSuccessCount[modelName] || 0) + 1;
  console.log(`✅ Success recorded for ${modelName} (total: ${modelSuccessCount[modelName]})`);
};

/**
 * Record model failure
 */
const recordFailure = (modelName) => {
  modelFailureCount[modelName] = (modelFailureCount[modelName] || 0) + 1;
  console.log(`❌ Failure recorded for ${modelName} (total: ${modelFailureCount[modelName]})`);
};

/**
 * Save model statistics to Firestore
 */
const saveModelStats = async () => {
  try {
    const statsData = {
      
  
      models: AVAILABLE_MODELS.map(model => ({
        name: model,
        usage: modelUsageCount[model] || 0,
        success: modelSuccessCount[model] || 0,
        failure: modelFailureCount[model] || 0,
        successRate: ((modelSuccessCount[model] || 0) / ((modelSuccessCount[model] || 0) + (modelFailureCount[model] || 0)) * 100) || 0
      }))
    };
    
    await db.collection('modelStats').add(statsData);
    console.log('💾 Model statistics saved to Firestore');
  } catch (error) {
    console.error('❌ Error saving stats:', error.message);
  }
};

/**
 * Generate cache key from question and language
 */
const generateCacheKey = (question, language) => {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(`${question}:${language}`).digest('hex');
  return hash;
};

/**
 * Get cached response
 */
const getCachedResponse = async (question, language) => {
  try {
    const cacheKey = generateCacheKey(question, language);
    const cacheDoc = await db.collection('responseCache').doc(cacheKey).get();
    
    if (cacheDoc.exists) {
      const data = cacheDoc.data();
      // Cache expires after 24 hours
      const cacheAge = Date.now() - data.timestamp.toMillis();
      if (cacheAge < 24 * 60 * 60 * 1000) {
        console.log('💾 Cache hit! Returning cached response');
        return data.response;
      } else {
        console.log('🕐 Cache expired, will fetch new response');
        // Delete expired cache
        await db.collection('responseCache').doc(cacheKey).delete();
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Error reading cache:', error.message);
    return null;
  }
};

/**
 * Save response to cache
 */
const saveToCache = async (question, language, response) => {
  try {
    const cacheKey = generateCacheKey(question, language);
    await db.collection('responseCache').doc(cacheKey).set({
      question,
      language,
      response,
      timestamp: admin.firestore.Timestamp.fromDate(new Date()),
    });
    console.log('💾 Response cached successfully');
  } catch (error) {
    console.error('❌ Error saving to cache:', error.message);
  }
};

/**
 * Save search to history
 */
const saveToSearchHistory = async (question, language, preview) => {
  try {
    await db.collection('searchHistory').add({
      question,
      language,
      preview, // First 200 chars of response
      timestamp: admin.firestore.Timestamp.fromDate(new Date()),
    });
    console.log('📝 Search saved to history');
  } catch (error) {
    console.error('❌ Error saving search history:', error.message);
  }
};

// System instruction for OldAi




// Auto-fix malformed JSON (basic)
const tryParseJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    // Attempt to fix common issues
    let fixed = text
      .replace(/\n/g, '')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');
    try {
      return JSON.parse(fixed);
    } catch (e2) {
      return null;
    }
  }
};

// Token counting (rough estimate)
const countTokens = (text) => {
  // 1 token ≈ 4 chars (very rough)
  return Math.ceil((text || '').length / 4);
};

/**
 * Make API call with automatic retry on 429 error and exponential backoff, fallback to OpenAI
 * @param {string} prompt - The prompt to send
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<string>} - Response text
 */
const callGeminiWithRetry = async (prompt, maxRetries = 3) => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const modelName = getNextModel();
      console.log(`🔄 Attempt ${attempt + 1}/${maxRetries} with model: ${modelName}`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 4096,
              temperature: 0.7,
              topP: 0.95,
              topK: 40,
            },
          }),
        }
      );
      if (response.status === 429) {
        console.warn(`⚠️ Rate limit (429) hit on ${modelName}, trying next model...`);
        recordFailure(modelName);
        lastError = new Error(`Rate limit on ${modelName}`);
        const backoffTime = Math.pow(2, attempt) * 500;
        console.log(`⏳ Waiting ${backoffTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        continue;
      }
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Model ${modelName} error (${response.status}):`, errorText);
        recordFailure(modelName);
        lastError = new Error(`API error (${response.status}): ${errorText}`);
        const backoffTime = Math.pow(2, attempt) * 500;
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        continue;
      }
      const data = await response.json();
      if (!data.candidates || data.candidates.length === 0) {
        recordFailure(modelName);
        throw new Error("No candidates in response");
      }
      const candidate = data.candidates[0];
      if (candidate.finishReason === "MAX_TOKENS") {
        console.warn("⚠️ Response truncated due to MAX_TOKENS");
      }
      const text = candidate.content?.parts?.[0]?.text || 
                   "No response generated (check finishReason: " + candidate?.finishReason + ")";
      console.log(`✅ Success with model: ${modelName}`);
      recordSuccess(modelName);
      return text;
    } catch (error) {
      console.error(`❌ Attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
      if (attempt < maxRetries - 1) {
        const backoffTime = Math.pow(2, attempt) * 500;
        console.log(`⏳ Exponential backoff: ${backoffTime}ms`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }
  // All attempts failed
  console.error('❌ All Gemini models failed.');
  throw lastError || new Error('All Gemini model attempts failed');
};

/**
 * Make image API call with automatic retry on 429 error and exponential backoff
 * @param {string} prompt - The prompt to send
 * @param {object} imageData - Image data object with inlineData
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<string>} - Response text
 */
const callGeminiVisionWithRetry = async (prompt, imageData, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const modelName = getNextModel();
      console.log(`🔄 Image attempt ${attempt + 1}/${maxRetries} with model: ${modelName}`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                imageData
              ]
            }],
            generationConfig: {
              maxOutputTokens: 4096,
              temperature: 0.7,
              topP: 0.95,
              topK: 40,
            },
          }),
        }
      );

      // Check for rate limit error
      if (response.status === 429) {
        console.warn(`⚠️ Rate limit (429) hit on ${modelName} for image, trying next model...`);
        recordFailure(modelName);
        lastError = new Error(`Rate limit on ${modelName}`);
        
        // Exponential backoff: 0.5s → 1s → 2s
        const backoffTime = Math.pow(2, attempt) * 500;
        console.log(`⏳ Waiting ${backoffTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Model ${modelName} error (${response.status}):`, errorText);
        recordFailure(modelName);
        lastError = new Error(`API error (${response.status}): ${errorText}`);
        
        // Exponential backoff for other errors
        const backoffTime = Math.pow(2, attempt) * 500;
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        continue;
      }

      const data = await response.json();
      
      // Check for valid response
      if (!data.candidates || data.candidates.length === 0) {
        recordFailure(modelName);
        throw new Error("No candidates in response");
      }

      const candidate = data.candidates[0];
      
      if (candidate.finishReason === "MAX_TOKENS") {
        console.warn("⚠️ Image response truncated due to MAX_TOKENS");
      }

      const text = candidate.content?.parts?.[0]?.text || 
                   "No response generated from image analysis";

      console.log(`✅ Image success with model: ${modelName}`);
      recordSuccess(modelName);
      return text;

    } catch (error) {
      console.error(`❌ Image attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 0.5s → 1s → 2s
        const backoffTime = Math.pow(2, attempt) * 500;
        console.log(`⏳ Exponential backoff: ${backoffTime}ms`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }

  // All attempts failed
  console.error('❌ All Gemini models failed for image. Consider implementing OpenAI Vision fallback.');
  throw lastError || new Error('All image model attempts failed');
};

// System instruction for OldAi
const OLDAI_SYSTEM_INSTRUCTION = `
You are OldAi — an expert in ancient Indian wisdom, Vedic mathematics, and Sanskrit philosophy.
When given a query, provide a clear structured explanation in JSON format.
Include Sanskrit terms, transliteration, explanation, formula (if any), deeper insight, and modern equivalent.
`;

const responseSchema = {
  type: "object",
  properties: {
    sanskrit_term: { type: "string" },
    transliteration: { type: "string" },
    explanation: { type: "string" },
    formula: { type: "string" },
    deeper_insight: { type: "string" },
    modern_equivalent: { type: "string" },
  },
  required: ["transliteration", "explanation", "modern_equivalent"],
};

/**
 * List available models
 */
exports.listModels = functions.https.onRequest(async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
    }

    console.log("📋 Listing available models...");
    
    const models = await genAI.listModels();
    const modelList = models.map(m => ({
      name: m.name,
      displayName: m.displayName,
      supportedMethods: m.supportedGenerationMethods
    }));
    
    console.log("✅ Found models:", modelList.length);
    res.json({ models: modelList });
  } catch (error) {
    console.error("❌ Error listing models:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * HTTP endpoint to process questions and return answers
 * Using direct REST API for better reliability
 */
exports.answerQuestion = functions.https.onRequest(async (req, res) => {
  if (!checkRateLimit('answerQuestion', req, res)) return;
  try {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
    }

    console.log("📝 Request body:", req.body);
    console.log("📝 Request method:", req.method);

    const question = req.body?.question;
    const language = req.body?.language || 'English';
    
    if (!question) {
      return res.status(400).json({ error: "No question provided in request body" });
    }

    console.log(`🤖 Processing question: ${question}`);
    console.log(`🌐 Language: ${language}`);

    const startTime = Date.now();

    // Check cache first
    const cachedResponse = await getCachedResponse(question, language);
    if (cachedResponse) {
      console.log(`⚡ Returning cached response (saved ${Date.now() - startTime}ms)`);
      return res.json({ answer: cachedResponse, cached: true });
    }

    console.log("🤖 Generating content...");

    // Language-specific instructions
    let languageInstruction = '';
    let sectionHeaders = {};
    
    if (language === 'Hindi') {
      languageInstruction = '\n\nCRITICAL: Write ENTIRE response in Hindi (Devanagari script). ALL headings, explanations, examples, and descriptions MUST be in Hindi. Only keep mathematical formulas and numbers in their standard form. Sanskrit terms should be in Devanagari. Do NOT use English words except for formulas.';
      sectionHeaders = {
        title: 'विषय',
        ancient: 'प्राचीन वैदिक दृष्टिकोण',
        sanskritName: 'संस्कृत नाम',
        history: 'ऐतिहासिक संदर्भ',
        vedicExplanation: 'वैदिक व्याख्या',
        formula: 'मूल सूत्र/विधि',
        example: 'वैदिक विधि का उदाहरण',
        modern: 'आधुनिक गणितीय दृष्टिकोण',
        modernName: 'आधुनिक नाम',
        discovery: 'पश्चिमी खोज',
        modernExplanation: 'आधुनिक व्याख्या',
        modernFormula: 'आधुनिक सूत्र/विधि',
        modernExample: 'आधुनिक विधि का उदाहरण',
        connection: 'संबंध',
        relate: 'वे कैसे संबंधित हैं',
        advantage: 'प्राचीन विधि क्यों जीतती है',
        cultural: 'सांस्कृतिक संदर्भ',
        comparison: 'दृश्य तुलना',
        steps: 'चरण',
        timeSaved: 'समय बचाया',
        applications: 'वास्तविक दुनिया के अनुप्रयोग'
      };
    } else if (language === 'Sanskrit') {
      languageInstruction = '\n\nCRITICAL: Write ENTIRE response in Sanskrit (Devanagari script). ALL headings, explanations, examples, and descriptions MUST be in Sanskrit. Only keep mathematical formulas in standard notation. Use pure Sanskrit terminology throughout. Do NOT use English or Hindi words except for formulas.';
      sectionHeaders = {
        title: 'विषयः',
        ancient: 'प्राचीन वैदिक दृष्टिः',
        sanskritName: 'संस्कृत नाम',
        history: 'ऐतिहासिक सन्दर्भः',
        vedicExplanation: 'वैदिक व्याख्या',
        formula: 'मूल सूत्रम्/विधिः',
        example: 'वैदिक विधि उदाहरणम्',
        modern: 'आधुनिक गणितीय दृष्टिः',
        modernName: 'आधुनिक नाम',
        discovery: 'पश्चिमी आविष्कारः',
        modernExplanation: 'आधुनिक व्याख्या',
        modernFormula: 'आधुनिक सूत्रम्/विधिः',
        modernExample: 'आधुनिक विधि उदाहरणम्',
        connection: 'सम्बन्धः',
        relate: 'ते कथं सम्बद्धाः',
        advantage: 'प्राचीन विधिः कथं विजयी',
        cultural: 'सांस्कृतिक सन्दर्भः',
        comparison: 'दृश्य तुलना',
        steps: 'चरणाः',
        timeSaved: 'समय बचितम्',
        applications: 'वास्तविक जगत् अनुप्रयोगाः'
      };
    } else {
      languageInstruction = '\n\nWrite in English with Devanagari for Sanskrit terms (with transliteration in parentheses).';
      sectionHeaders = {
        title: 'Main Topic',
        ancient: 'Ancient Vedic Perspective',
        sanskritName: 'Sanskrit Name',
        history: 'Historical Context',
        vedicExplanation: 'Vedic Explanation',
        formula: 'Original Formula/Method',
        example: 'Example Using Vedic Method',
        modern: 'Modern Mathematical Perspective',
        modernName: 'Modern Name',
        discovery: 'Western Discovery',
        modernExplanation: 'Modern Explanation',
        modernFormula: 'Modern Formula/Method',
        modernExample: 'Example Using Modern Method',
        connection: 'The Connection',
        relate: 'How They Relate',
        advantage: 'Why Ancient Method Often Wins',
        cultural: 'Cultural Context',
        comparison: 'Visual Comparison',
        steps: 'Steps',
        timeSaved: 'Time Saved',
        applications: 'Real-World Applications'
      };
    }

    // Enhanced prompt for ancient vs modern comparison with mixed format (descriptive + bullet points)
    const enhancedPrompt = `You are an expert in Vedic and Modern Mathematics. Provide a balanced mix of flowing descriptions and clear bullet points.

Structure your response EXACTLY as follows:

**[Write only the topic name here without any label]**

## ${sectionHeaders.ancient}

### ${sectionHeaders.sanskritName}: [Sanskrit term in Devanagari] ([Transliteration])

### ${sectionHeaders.history}:
Write a flowing paragraph (2-3 sentences) about when and where this concept originated. Include dates, ancient texts, and key scholars.

### ${sectionHeaders.vedicExplanation}:
Write a descriptive paragraph (3-4 sentences) explaining the ancient Vedic understanding and approach to this concept.

### ${sectionHeaders.formula}:
[Write the formula using _{} for subscripts and ^{} for superscripts]

### ${sectionHeaders.example}:
Present as clear steps:
• Step 1: [First step with calculation]
• Step 2: [Second step with calculation]
• Step 3: [Final result]
Then add 1-2 sentences explaining why this method works.

## ${sectionHeaders.modern}

### ${sectionHeaders.modernName}: [Modern term]

### ${sectionHeaders.discovery}:
Write a paragraph (2-3 sentences) about who discovered this in Western mathematics and when.

### ${sectionHeaders.modernExplanation}:
Write a descriptive paragraph (3-4 sentences) explaining the modern mathematical understanding and approach.

### ${sectionHeaders.modernFormula}:
[Write the formula using _{} for subscripts and ^{} for superscripts]

### ${sectionHeaders.modernExample}:
Present as clear steps:
• Step 1: [First step with calculation]
• Step 2: [Second step with calculation]
• Step 3: [Final result]
Then add 1-2 sentences comparing to the Vedic method.

## ${sectionHeaders.connection}

### ${sectionHeaders.relate}:
Write a paragraph (2-3 sentences) explaining how ancient and modern approaches connect.

### ${sectionHeaders.advantage}:
Write as bullet points:
• Speed: [Why Vedic method is faster]
• Mental Math: [Why easier to do mentally]
• Efficiency: [Why fewer steps needed]

### ${sectionHeaders.cultural}:
Write a brief paragraph (2 sentences) about the cultural and philosophical significance.

## ${sectionHeaders.comparison}

Write as a structured comparison table:

| Feature | Traditional Method | Vedic Method |
|---------|-------------------|--------------|
| Steps | [X] steps | [Y] steps |
| Complexity | [Describe traditional complexity] | [Describe Vedic simplicity] |
| Time Saved | Baseline | Approximately [Z]% faster |
| Mental Calculation | [Harder/Easier - brief reason] | [Easier/Harder - brief reason] |

## ${sectionHeaders.applications}

Present as bullet points with brief descriptions:
• [Field 1]: [How it's used - 1 sentence]
• [Field 2]: [How it's used - 1 sentence]
• [Field 3]: [How it's used - 1 sentence]

Question: ${question}

IMPORTANT: Mix descriptive paragraphs for concepts with clear bullet points for steps, advantages, and applications. Use proper mathematical notation (_{} for subscripts, ^{} for superscripts).${languageInstruction}`;

    // Call Gemini API with fallback and get response
    const text = await callGeminiWithRetry(enhancedPrompt);
    // Token counting
    const tokenCount = countTokens(text);
    // Try to parse as JSON (for structured responses)
    const parsed = tryParseJSON(text);
    // Save to cache for future requests
    saveToCache(question, language, text).catch(err => 
      console.error('Failed to cache response:', err)
    );
    // Save to search history
    saveToSearchHistory(question, language, text.substring(0, 200)).catch(err =>
      console.error('Failed to save search history:', err)
    );
    // Log usage for dashboard
    await db.collection('apiUsage').add({
      endpoint: 'answerQuestion',
      question,
      language,
      tokenCount,
      usedFallback: text.startsWith('Gemini failed')
    });
    res.json({ answer: text, parsed, tokenCount, cached: false });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * HTTP endpoint to process images with text/math formulas
 * Uses Gemini Vision API
 */
exports.processImage = functions.https.onRequest(async (req, res) => {
  if (!checkRateLimit('processImage', req, res)) return;
  try {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
    }

    console.log("📸 Processing image request...");

    const { base64Image, mimeType } = req.body;
    
    if (!base64Image) {
      return res.status(400).json({ error: "No image provided in request body" });
    }

    console.log(`🖼️ Image type: ${mimeType || 'image/jpeg'}`);
    console.log("🤖 Analyzing image with Gemini Vision...");

    const startTime = Date.now();
    
    const language = req.body?.language || 'English';
    console.log(`🌐 Language: ${language}`);

    // Language-specific instructions for image processing
    let languageInstruction = '';
    let sectionHeaders = {};
    
    if (language === 'Hindi') {
      languageInstruction = '\n\nCRITICAL: Write ENTIRE response in Hindi (Devanagari script). ALL headings, explanations, examples, and descriptions MUST be in Hindi. Only keep mathematical formulas and numbers in their standard form. Sanskrit terms should be in Devanagari. Do NOT use English words except for formulas.';
      sectionHeaders = {
        title: 'छवि से विषय',
        ancient: 'प्राचीन वैदिक दृष्टिकोण',
        sanskritName: 'संस्कृत नाम',
        history: 'ऐतिहासिक संदर्भ',
        vedicExplanation: 'वैदिक व्याख्या',
        formula: 'मूल सूत्र/विधि',
        example: 'वैदिक विधि का उदाहरण',
        modern: 'आधुनिक गणितीय दृष्टिकोण',
        modernName: 'आधुनिक नाम',
        discovery: 'पश्चिमी खोज',
        modernExplanation: 'आधुनिक व्याख्या',
        modernFormula: 'आधुनिक सूत्र/विधि',
        modernExample: 'आधुनिक विधि का उदाहरण',
        connection: 'संबंध',
        relate: 'वे कैसे संबंधित हैं',
        advantage: 'प्राचीन विधि क्यों जीतती है',
        cultural: 'सांस्कृतिक संदर्भ',
        comparison: 'दृश्य तुलना',
        applications: 'वास्तविक दुनिया के अनुप्रयोग'
      };
    } else if (language === 'Sanskrit') {
      languageInstruction = '\n\nCRITICAL: Write ENTIRE response in Sanskrit (Devanagari script). ALL headings, explanations, examples, and descriptions MUST be in Sanskrit. Only keep mathematical formulas in standard notation. Use pure Sanskrit terminology throughout. Do NOT use English or Hindi words except for formulas.';
      sectionHeaders = {
        title: 'चित्रात् विषयः',
        ancient: 'प्राचीन वैदिक दृष्टिः',
        sanskritName: 'संस्कृत नाम',
        history: 'ऐतिहासिक सन्दर्भः',
        vedicExplanation: 'वैदिक व्याख्या',
        formula: 'मूल सूत्रम्/विधिः',
        example: 'वैदिक विधि उदाहरणम्',
        modern: 'आधुनिक गणितीय दृष्टिः',
        modernName: 'आधुनिक नाम',
        discovery: 'पश्चिमी आविष्कारः',
        modernExplanation: 'आधुनिक व्याख्या',
        modernFormula: 'आधुनिक सूत्रम्/विधिः',
        modernExample: 'आधुनिक विधि उदाहरणम्',
        connection: 'सम्बन्धः',
        relate: 'ते कथं सम्बद्धाः',
        advantage: 'प्राचीन विधिः कथं विजयी',
        cultural: 'सांस्कृतिक सन्दर्भः',
        comparison: 'दृश्य तुलना',
        applications: 'वास्तविक जगत् अनुप्रयोगाः'
      };
    } else {
      languageInstruction = '\n\nWrite in English with Devanagari for Sanskrit terms (with transliteration in parentheses).';
      sectionHeaders = {
        title: 'Main Topic from Image',
        ancient: 'Ancient Vedic Perspective',
        sanskritName: 'Sanskrit Name',
        history: 'Historical Context',
        vedicExplanation: 'Vedic Explanation',
        formula: 'Original Formula/Method',
        example: 'Example Using Vedic Method',
        modern: 'Modern Mathematical Perspective',
        modernName: 'Modern Name',
        discovery: 'Western Discovery',
        modernExplanation: 'Modern Explanation',
        modernFormula: 'Modern Formula/Method',
        modernExample: 'Example Using Modern Method',
        connection: 'The Connection',
        relate: 'How They Relate',
        advantage: 'Why Ancient Method Often Wins',
        cultural: 'Cultural Context',
        comparison: 'Visual Comparison',
        applications: 'Real-World Applications'
      };
    }

    // Prepare the prompt for Vedic mathematics image analysis with mixed format
    const imagePrompt = `Analyze this image and provide a balanced mix of flowing descriptions and clear bullet points.

Structure your response EXACTLY as follows:

**[Identify and write only the topic name from the image without any label]**

## ${sectionHeaders.ancient}

### ${sectionHeaders.sanskritName}: [Sanskrit term in Devanagari] ([Transliteration])

### ${sectionHeaders.history}:
Write a flowing paragraph (2-3 sentences) about the historical origins of what you see in the image. Include dates and ancient texts.

### ${sectionHeaders.vedicExplanation}:
Write a descriptive paragraph (3-4 sentences) explaining the Vedic approach to this concept shown in the image.

### ${sectionHeaders.formula}:
[Write the formula using _{} for subscripts and ^{} for superscripts]

### ${sectionHeaders.example}:
Present as clear steps:
• Step 1: [First step with calculation]
• Step 2: [Second step with calculation]
• Step 3: [Final result]
Then add 1-2 sentences explaining the method.

## ${sectionHeaders.modern}

### ${sectionHeaders.modernName}: [Modern term]

### ${sectionHeaders.discovery}:
Write a paragraph (2-3 sentences) about the Western discovery or formalization.

### ${sectionHeaders.modernExplanation}:
Write a descriptive paragraph (3-4 sentences) explaining the modern understanding of what's shown in the image.

### ${sectionHeaders.modernFormula}:
[Write the formula using _{} for subscripts and ^{} for superscripts]

### ${sectionHeaders.modernExample}:
Present as clear steps:
• Step 1: [First step with calculation]
• Step 2: [Second step with calculation]
• Step 3: [Final result]
Then add 1-2 sentences comparing approaches.

## ${sectionHeaders.connection}

### ${sectionHeaders.relate}:
Write a paragraph (2-3 sentences) explaining how ancient and modern approaches connect.

### ${sectionHeaders.advantage}:
Write as bullet points:
• Speed: [Why Vedic method is faster]
• Mental Math: [Why easier to do mentally]
• Efficiency: [Why fewer steps needed]

### ${sectionHeaders.cultural}:
Write a brief paragraph (2 sentences) about cultural significance.

## ${sectionHeaders.comparison}

Write as a structured comparison table:

| Feature | Traditional Method | Vedic Method |
|---------|-------------------|--------------|
| Steps | [X] steps | [Y] steps |
| Complexity | [Describe traditional complexity] | [Describe Vedic simplicity] |
| Time Saved | Baseline | Approximately [Z]% faster |
| Mental Calculation | [Harder/Easier - brief reason] | [Easier/Harder - brief reason] |

## ${sectionHeaders.applications}

Present as bullet points:
• [Field 1]: [How it's used - 1 sentence]
• [Field 2]: [How it's used - 1 sentence]
• [Field 3]: [How it's used - 1 sentence]

IMPORTANT: Mix descriptive paragraphs for concepts with clear bullet points for steps, advantages, and applications. Use proper mathematical notation (_{} for subscripts, ^{} for superscripts).${languageInstruction}`;

    // Prepare image data for Gemini Vision API
    const imageData = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType || 'image/jpeg'
      }
    };

    // Call Gemini Vision API with automatic model rotation and retry
    const text = await callGeminiVisionWithRetry(imagePrompt, imageData);
    
    console.log(`⏱️ Total image processing took ${Date.now() - startTime}ms`);
    console.log("✅ Image processed successfully");
    console.log("📝 Extracted analysis:", text.substring(0, 100) + "...");

    // Save to search history
    saveToSearchHistory('Image Analysis', language, text.substring(0, 200)).catch(err =>
      console.error('Failed to save search history:', err)
    );

    res.json({ answer: text });
  } catch (error) {
    console.error("❌ Image processing error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * HTTP endpoint to get recent search history
 */
exports.getRecentSearches = functions.https.onRequest(async (req, res) => {
  try {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
    }

    console.log("📜 Fetching recent searches...");

    // Get limit from query params (default 10, max 50)
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    
    // Fetch recent searches ordered by timestamp
    const snapshot = await db.collection('searchHistory')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const searches = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      searches.push({
        id: doc.id,
        question: data.question,
        language: data.language,
        preview: data.preview,
        timestamp: data.timestamp?.toDate().toISOString() || null,
      });
    });

    console.log(`✅ Found ${searches.length} recent searches`);
    res.json({ searches, count: searches.length });
  } catch (error) {
    console.error("❌ Error fetching search history:", error);
    res.status(500).json({ error: error.message });
  }
});