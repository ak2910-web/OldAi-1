// Load environment variables from .env file
require('dotenv').config();


const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require('node-fetch');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Import our Hybrid Dynamic Output Engine (Solution 3)
const { classifyQuestion, classifyQuestionEnhanced, identifyVedicSutra } = require('./questionClassifier'); // NEW: Rule-based
const { getTemplatePrompt } = require('./templateEngine');
const { formatResponse, extractSections, getPreview } = require('./responseFormatter');
const { mapVedicToModern, identifyVedicConcept } = require('./vedicMappingEngine'); // NEW: Vedic mapping engine
const { validateQuestion, validateLanguage, validateImage, checkUserRateLimit, getUserUsageStats } = require('./validators'); // NEW: Security

// Import Mathematical Intelligence Engine
const mathEngine = require('./mathEngine');

// Simple in-memory rate limiter (per IP, per endpoint)
const RATE_LIMIT = 100; // requests (increased for development)
const RATE_WINDOW = 60 * 1000; // 1 minute
const rateLimitMap = {};
const EMULATOR_MODE = process.env.FUNCTIONS_EMULATOR === 'true';

// Safe timestamp normalization for mixed data formats
function normalizeTimestamp(ts) {
  if (!ts) return null;

  // Firestore Timestamp object
  if (typeof ts.toDate === 'function') {
    return ts.toDate();
  }

  // Already a JS Date
  if (ts instanceof Date) {
    return ts;
  }

  // number (milliseconds) or string (ISO)
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
}

// Global API call throttle (prevent overwhelming Gemini)
let lastApiCallTime = 0;
const MIN_API_CALL_INTERVAL = 1500; // 1500ms between API calls to avoid 429 errors

async function throttleApiCall() {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCallTime;
  
  if (timeSinceLastCall < MIN_API_CALL_INTERVAL) {
    const waitTime = MIN_API_CALL_INTERVAL - timeSinceLastCall;
    console.log(`[THROTTLE] Waiting ${waitTime}ms to respect API rate limit`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastApiCallTime = Date.now();
}

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
  // Disable rate limiting in emulator mode
  if (EMULATOR_MODE) {
    console.log('[RATE-LIMIT] Disabled in emulator mode');
    return true;
  }
  
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

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Initialize Firestore for caching and stats
const db = admin.firestore();

// Get Firestore types for timestamps (must be after initializeApp)
const FieldValue = admin.firestore.FieldValue;
const Timestamp = admin.firestore.Timestamp;


// Gemini API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is not set in environment variables!");
  console.error("Please create a .env file with GEMINI_API_KEY=your_api_key");
} else {
  console.log("[SUCCESS] GEMINI_API_KEY loaded successfully");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Available Gemini models for rotation (to avoid 429 rate limits)
// Removed non-working models: gemini-2.5-flash-native-audio-dialog (0% success rate)
const AVAILABLE_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-lite',
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
    console.log('[STATS] Model Performance Summary:');
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
    console.log('[RESET] Reset model usage counters');
  }

  // Round-robin selection
  const selectedModel = AVAILABLE_MODELS[currentModelIndex];
  currentModelIndex = (currentModelIndex + 1) % AVAILABLE_MODELS.length;
  
  // Track usage
  modelUsageCount[selectedModel] = (modelUsageCount[selectedModel] || 0) + 1;
  
  console.log(`[SELECTED] Selected model: ${selectedModel} (used ${modelUsageCount[selectedModel]} times)`);
  console.log(`[STATS] Model usage stats:`, modelUsageCount);
  
  return selectedModel;
};

/**
 * Record model success
 */
const recordSuccess = (modelName) => {
  modelSuccessCount[modelName] = (modelSuccessCount[modelName] || 0) + 1;
  console.log(`[SUCCESS] Success recorded for ${modelName} (total: ${modelSuccessCount[modelName]})`);
};

/**
 * Record model failure
 */
const recordFailure = (modelName) => {
  modelFailureCount[modelName] = (modelFailureCount[modelName] || 0) + 1;
  console.log(`[ERROR] Failure recorded for ${modelName} (total: ${modelFailureCount[modelName]})`);
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
    console.log('[SAVE] Model statistics saved to Firestore');
  } catch (error) {
    console.error('[ERROR] Error saving stats:', error.message);
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
      if (data.timestamp) {
        let timestampMillis;
        // Handle both Firestore Timestamp objects and numeric timestamps
        if (typeof data.timestamp === 'number') {
          timestampMillis = data.timestamp;
        } else if (data.timestamp.toMillis && typeof data.timestamp.toMillis === 'function') {
          timestampMillis = data.timestamp.toMillis();
        } else {
          // Unknown format, return cached response anyway
          console.log('[CACHE] Cache hit! Returning cached response (unknown timestamp format)');
          return data.response;
        }
        
        const cacheAge = Date.now() - timestampMillis;
        if (cacheAge < 24 * 60 * 60 * 1000) {
          console.log('[CACHE] Cache hit! Returning cached response');
          return data.response;
        } else {
          console.log('[EXPIRED] Cache expired, will fetch new response');
          // Delete expired cache
          await db.collection('responseCache').doc(cacheKey).delete();
        }
      } else {
        // If timestamp is missing or invalid, return cached response anyway
        console.log('[CACHE] Cache hit! Returning cached response (no valid timestamp)');
        return data.response;
      }
    }
    return null;
  } catch (error) {
    console.error('[ERROR] Error reading cache:', error.message);
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
      timestamp: Date.now(),
    });
    console.log('[SAVE] Response cached successfully');
  } catch (error) {
    console.error('[ERROR] Error saving to cache:', error.message);
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
      timestamp: Date.now(),
    });
    console.log('[HISTORY] Search saved to history');
  } catch (error) {
    console.error('[ERROR] Error saving search history:', error.message);
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
      console.log(`[RETRY] Attempt ${attempt + 1}/${maxRetries} with model: ${modelName}`);
      
      // Throttle to prevent overwhelming API
      await throttleApiCall();
      
      console.log('[API-CALL] Calling Google Generative AI (key hidden for security)');
      
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
      
      // Handle 429 (rate limit) - retry with exponential backoff
      if (response.status === 429) {
        console.warn(`[RATE-LIMIT] 429 hit on ${modelName}, trying next model...`);
        recordFailure(modelName);
        lastError = new Error(`Rate limit on ${modelName}`);
        const backoffTime = Math.pow(2, attempt) * 2000; // Increased from 500ms to 2000ms
        console.log(`[WAIT] Waiting ${backoffTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        continue;
      }
      
      // Handle 503 (overload) - DO NOT RETRY, fail gracefully
      if (response.status === 503) {
        console.error(`[OVERLOAD] 503 Service Overloaded on ${modelName} - system busy`);
        recordFailure(modelName);
        throw new Error('Gemini API is currently overloaded. Please try again in a moment.');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ERROR] Model ${modelName} error (${response.status})`);
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
        console.warn("[WARNING] Response truncated due to MAX_TOKENS");
      }
      const text = candidate.content?.parts?.[0]?.text || 
                   "No response generated (check finishReason: " + candidate?.finishReason + ")";
      console.log(`[SUCCESS] Success with model: ${modelName}`);
      recordSuccess(modelName);
      return text;
    } catch (error) {
      console.error(`[ERROR] Attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
      
      // Don't retry on specific errors
      if (error.message.includes('overloaded')) {
        throw error; // Fail fast on overload
      }
      
      if (attempt < maxRetries - 1) {
        const backoffTime = Math.pow(2, attempt) * 500;
        console.log(`[WAIT] Exponential backoff: ${backoffTime}ms`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }
  // All attempts failed
  console.error('[ERROR] All Gemini models failed.');
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
      console.log(`[RETRY] Image attempt ${attempt + 1}/${maxRetries} with model: ${modelName}`);
      
      // Throttle to prevent overwhelming API
      await throttleApiCall();
      
      console.log('[API-CALL] Calling Google Generative AI for image (key hidden for security)');
      
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
        console.warn(`[RATE-LIMIT] 429 hit on ${modelName} for image, trying next model...`);
        recordFailure(modelName);
        lastError = new Error(`Rate limit on ${modelName}`);
        
        // Exponential backoff: 2s → 4s → 8s (increased from 0.5s → 1s → 2s)
        const backoffTime = Math.pow(2, attempt) * 2000;
        console.log(`[WAIT] Waiting ${backoffTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        continue;
      }
      
      // Handle 503 (overload) - DO NOT RETRY for images either
      if (response.status === 503) {
        console.error(`[OVERLOAD] 503 Service Overloaded on ${modelName} for image - system busy`);
        recordFailure(modelName);
        throw new Error('Gemini API is currently overloaded. Please try again in a moment.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ERROR] Model ${modelName} error (${response.status})`);
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
        console.warn("[WARNING] Image response truncated due to MAX_TOKENS");
      }

      const text = candidate.content?.parts?.[0]?.text || 
                   "No response generated from image analysis";

      console.log(`[SUCCESS] Image success with model: ${modelName}`);
      recordSuccess(modelName);
      return text;

    } catch (error) {
      console.error(`[ERROR] Image attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 0.5s → 1s → 2s
        const backoffTime = Math.pow(2, attempt) * 500;
        console.log(`[WAIT] Exponential backoff: ${backoffTime}ms`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }

  // All attempts failed
  console.error('[ERROR] All Gemini models failed for image. Consider implementing OpenAI Vision fallback.');
  throw lastError || new Error('All image model attempts failed');
};

// System instruction for OldAi - Production-ready, hallucination-resistant
const OLDAI_SYSTEM_INSTRUCTION = `
You are OldAi, an AI system specialized in ancient Indian knowledge, Vedic mathematics, and Sanskrit-based reasoning.

Your task is to analyze the user query and respond ONLY in valid JSON following the exact schema described below.

GENERAL RULES:
- Do NOT include any text outside the JSON object.
- Do NOT invent Sanskrit terms, sutras, or references.
- If a concept is unknown or unclear, explicitly state that in the "confidence_note" field.
- Keep explanations clear, structured, and educational.
- Use simple English for explanations.
- Preserve cultural and semantic accuracy.
- Be concise but complete.

OUTPUT JSON SCHEMA:
{
  "topic": "string",
  "category": "vedic | concept | formula | history | arithmetic | misc",
  "sanskrit_term": "string | null",
  "transliteration": "string | null",
  "meaning": "string | null",
  "vedic_explanation": "string",
  "steps_or_method": ["string"] | null,
  "formula": "string | null",
  "modern_equivalent": "string",
  "example": "string | null",
  "deeper_insight": "string | null",
  "confidence_note": "string"
}

BEHAVIORAL GUIDELINES:
- If the question relates to Vedic mathematics, prioritize sutra-based reasoning.
- If no direct Vedic reference exists, clearly say so.
- If the query is general knowledge, respond without forcing Vedic mapping.
- Avoid unnecessary verbosity.
- Ensure the JSON is syntactically valid.

EXAMPLES:
- If no formula exists, set "formula": null
- If Sanskrit term is unknown, set both "sanskrit_term" and "transliteration" to null
`;

const responseSchema = {
  type: "object",
  properties: {
    topic: { type: "string" },
    category: { type: "string", enum: ["vedic", "concept", "formula", "history", "arithmetic", "misc"] },
    sanskrit_term: { type: ["string", "null"] },
    transliteration: { type: ["string", "null"] },
    meaning: { type: ["string", "null"] },
    vedic_explanation: { type: "string" },
    steps_or_method: { type: ["array", "null"], items: { type: "string" } },
    formula: { type: ["string", "null"] },
    modern_equivalent: { type: "string" },
    example: { type: ["string", "null"] },
    deeper_insight: { type: ["string", "null"] },
    confidence_note: { type: "string" }
  },
  required: ["topic", "category", "vedic_explanation", "modern_equivalent", "confidence_note"],
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

    console.log("[LIST] Listing available models...");
    
    const models = await genAI.listModels();
    const modelList = models.map(m => ({
      name: m.name,
      displayName: m.displayName,
      supportedMethods: m.supportedGenerationMethods
    }));
    
    console.log("[SUCCESS] Found models:", modelList.length);
    res.json({ models: modelList });
  } catch (error) {
    console.error("[ERROR] Error listing models:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * HTTP endpoint to process questions and return answers
 * Using HYBRID DYNAMIC OUTPUT ENGINE (Solution 3)
 * 
 * Process: Classification → Template Selection → AI Generation → Formatting
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

    console.log("[LOG] Request body:", req.body);
    console.log("[LOG] Request method:", req.method);

    const question = req.body?.question;
    const language = req.body?.language || 'English';
    const userId = req.body?.userId || req.headers['x-user-id']; // Get from auth context
    
    // STEP 1: VALIDATE INPUT
    const questionValidation = validateQuestion(question);
    if (!questionValidation.valid) {
      console.log(`[VALIDATION] Question rejected: ${questionValidation.error}`);
      return res.status(400).json({ 
        error: questionValidation.error,
        errorCode: 'INVALID_INPUT'
      });
    }

    const languageValidation = validateLanguage(language);
    const sanitizedQuestion = questionValidation.sanitized;
    const sanitizedLanguage = languageValidation.sanitized;

    // STEP 2: CHECK RATE LIMIT
    const rateLimit = await checkUserRateLimit(userId, db);
    if (!rateLimit.allowed) {
      console.log(`[RATE LIMIT] User ${userId} exceeded daily limit`);
      return res.status(429).json({ 
        error: rateLimit.error,
        errorCode: 'RATE_LIMIT_EXCEEDED',
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime
      });
    }

    console.log(`[PROCESSING] Processing question: ${sanitizedQuestion}`);
    console.log(`[LANGUAGE] Language: ${sanitizedLanguage}`);
    console.log(`[RATE LIMIT] Queries remaining today: ${rateLimit.remaining}`);

    const startTime = Date.now();

    // Check cache first
    const cachedResponse = await getCachedResponse(sanitizedQuestion, sanitizedLanguage);
    if (cachedResponse) {
      console.log(`[CACHED] Returning cached response (saved ${Date.now() - startTime}ms)`);
      
      // Parse cached response if it's structured
      let parsedCache;
      try {
        parsedCache = JSON.parse(cachedResponse);
      } catch {
        parsedCache = { answer: cachedResponse };
      }
      
      return res.json({ 
        ...parsedCache,
        cached: true 
      });
    }

    console.log("[AI-LAYER1] LAYER 1: Classifying question type...");

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
    const ancientModernPrompt = `You are an expert in Vedic and Modern Mathematics. Provide a balanced mix of flowing descriptions and clear bullet points.

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

    console.log("[AI-LAYER1] LAYER 1: Classifying question type (rule-based, instant)...");
    
    // LAYER 0: MATHEMATICAL INTELLIGENCE ENGINE (NEW - Before AI)
    // Try to solve mathematically first for deterministic accuracy
    let mathSolution = null;
    try {
      console.log("[MATH-ENGINE] Attempting mathematical solution...");
      mathSolution = await mathEngine.solveMathProblem(sanitizedQuestion);
      
      if (mathSolution && mathSolution.solution && mathSolution.solution.success) {
        console.log(`[MATH-ENGINE] ✓ Solved using ${mathSolution.method}`);
        console.log(`[MATH-ENGINE] Result: ${mathSolution.solution.result || mathSolution.solution.solutions}`);
      } else {
        console.log("[MATH-ENGINE] No direct mathematical solution, proceeding to AI");
      }
    } catch (error) {
      console.error("[MATH-ENGINE] Error:", error.message);
      // Continue without math solution
    }
    
    // LAYER 1: ENHANCED CLASSIFICATION WITH VEDIC SUTRA IDENTIFICATION
    const classification = classifyQuestionEnhanced(sanitizedQuestion);
    const questionType = classification.category;
    const vedicSutra = classification.vedicSutra;
    const isVedic = classification.isVedic;
    
    console.log(`[SUCCESS] Question classified as: ${questionType} (0ms, deterministic)`);
    if (vedicSutra) {
      console.log(`[VEDIC] Identified Vedic Sutra: ${vedicSutra}`);
    }
    
    // LAYER 1.5: VEDIC MAPPING ENGINE (NEW - PATENT-WORTHY)
    let vedicMapping = null;
    if (isVedic) {
      console.log(`[VEDIC MAPPING] Attempting to map Vedic concept to modern framework...`);
      try {
        // Try to identify and map the Vedic concept
        vedicMapping = await mapVedicToModern(vedicSutra || sanitizedQuestion, genAI);
        if (vedicMapping) {
          console.log(`[VEDIC MAPPING] ✓ Successfully mapped to: ${vedicMapping.modern_equivalent}`);
          console.log(`[VEDIC MAPPING] Confidence: ${(vedicMapping.confidence_score * 100).toFixed(0)}%`);
        } else {
          console.log(`[VEDIC MAPPING] No mapping found in knowledge base`);
        }
      } catch (error) {
        console.error(`[VEDIC MAPPING] Mapping failed:`, error.message);
        // Continue without mapping - don't fail the request
      }
    }
    
    console.log(`[AI-LAYER2] LAYER 2: Selecting template for "${questionType}"...`);
    
    // LAYER 2: TEMPLATE SELECTION (Enhanced with Vedic mapping + Math solution if available)
    let enhancedPrompt = getTemplatePrompt(questionType, sanitizedQuestion, sanitizedLanguage, vedicMapping);
    
    // If we have a mathematical solution, add it to the prompt for verification and explanation
    if (mathSolution && mathSolution.solution && mathSolution.solution.success) {
      const mathExplanation = mathEngine.generateExplanation(mathSolution.solution, mathSolution.classification);
      enhancedPrompt += `\n\n[VERIFIED MATHEMATICAL SOLUTION - Use this as the accurate answer and explain it clearly]:
${mathExplanation}

Your task: Explain this solution in a clear, educational way. Add context, examples, and teaching points. DO NOT recalculate - this solution is already verified.`;
    }
    
    const templatePrompt = enhancedPrompt;
    
    console.log(`[AI-LAYER3] LAYER 3: Generating AI response (single call)...`);
    
    // Call Gemini API with templated prompt
    const rawResponse = await callGeminiWithRetry(templatePrompt);
    
    console.log(`[AI-LAYER4] LAYER 4: Formatting response...`);
    
    // LAYER 3: FORMATTING
    const formattedAnswer = formatResponse(rawResponse);
    const sections = extractSections(formattedAnswer);
    const preview = getPreview(formattedAnswer);
    
    // Token counting
    const tokenCount = countTokens(rawResponse);
    
    console.log(`[SUCCESS] Response generated successfully in ${Date.now() - startTime}ms`);
    console.log(`[STATS] Question Type: ${questionType}`);
    console.log(`[STATS] Token Count: ${tokenCount}`);
    console.log(`[STATS] Sections Extracted: ${Object.keys(sections).length}`);
    console.log(`[DEBUG] Section names found:`, Object.keys(sections).join(', '));
    console.log(`[DEBUG] Raw response preview (first 500 chars):`, rawResponse.substring(0, 500));
    
    // Prepare response object (Enhanced with Vedic mapping + Math solution data)
    const responseData = {
      answer: formattedAnswer,
      questionType,
      sections,
      tokenCount,
      cached: false,
      processingTime: Date.now() - startTime,
      // NEW: Include mathematical solution if computed
      mathematicalSolution: mathSolution ? {
        method: mathSolution.method,
        result: mathSolution.solution?.result || mathSolution.solution?.solutions,
        domain: mathSolution.classification?.primaryDomain,
        confidence: mathSolution.confidence,
        verified: mathSolution.solution?.verified,
        processingTime: mathSolution.processingTime
      } : null,
      // NEW: Include Vedic mapping data if available
      vedicMapping: vedicMapping ? {
        sutraName: vedicMapping.short_name,
        modernEquivalent: vedicMapping.modern_equivalent,
        mathematicalField: vedicMapping.mathematical_field,
        confidenceScore: vedicMapping.confidence_score,
        applications: vedicMapping.practical_applications,
        crossDomainConnections: vedicMapping.cross_domain_connections
      } : null,
      vedicSutra: vedicSutra
    };
    
    // Save to cache for future requests (save stringified version)
    saveToCache(sanitizedQuestion, sanitizedLanguage, JSON.stringify(responseData)).catch(err => 
      console.error('Failed to cache response:', err)
    );
    
    // Save to search history
    saveToSearchHistory(sanitizedQuestion, sanitizedLanguage, preview).catch(err =>
      console.error('Failed to save search history:', err)
    );
    
    // Log usage for dashboard with question type (anonymized)
    try {
      await db.collection('apiUsage').add({
        endpoint: 'answerQuestion',
        questionLength: sanitizedQuestion.length, // Don't log full question for privacy
        language: sanitizedLanguage,
        questionType,
        tokenCount,
        processingTime: Date.now() - startTime,
        userId: userId || 'anonymous',
        timestamp: FieldValue.serverTimestamp()
      });
    } catch (logError) {
      console.error('[WARN] Failed to log API usage:', logError.message);
    }
    
    res.json(responseData);
  } catch (error) {
    console.error("[ERROR] Error in answerQuestion:", error);
    
    // Enhanced error handling with specific error types
    let errorResponse = {
      error: true,
      message: "An unexpected error occurred",
      errorCode: "UNKNOWN_ERROR",
      retryable: false
    };
    
    // Handle specific error types
    if (error.message && error.message.includes('Rate limit')) {
      errorResponse = {
        error: true,
        message: "AI service rate limit reached. Please try again in a moment.",
        errorCode: "RATE_LIMIT_EXCEEDED",
        retryable: true,
        retryAfter: 60 // seconds
      };
    } else if (error.message && error.message.includes('overloaded')) {
      errorResponse = {
        error: true,
        message: "AI service is currently busy. Please try again shortly.",
        errorCode: "SERVICE_OVERLOADED",
        retryable: true,
        retryAfter: 30
      };
    } else if (error.message && error.message.includes('RESOURCE_EXHAUSTED')) {
      errorResponse = {
        error: true,
        message: "Daily AI quota exceeded. Try again tomorrow or upgrade your plan.",
        errorCode: "QUOTA_EXCEEDED",
        retryable: false
      };
    } else if (error.message && error.message.includes('UNAUTHENTICATED')) {
      errorResponse = {
        error: true,
        message: "Authentication failed. Please log in again.",
        errorCode: "AUTH_FAILED",
        retryable: false
      };
    } else if (error.message && error.message.includes('Network')) {
      errorResponse = {
        error: true,
        message: "Network error. Please check your internet connection.",
        errorCode: "NETWORK_ERROR",
        retryable: true,
        retryAfter: 10
      };
    } else {
      errorResponse.message = error.message || "Something went wrong. Please try again.";
    }
    
    // Log error to Firestore for monitoring
    try {
      await db.collection('errorLogs').add({
        endpoint: 'answerQuestion',
        error: error.message,
        errorCode: errorResponse.errorCode,
        question: req.body?.question?.substring(0, 100), // Don't log full question for privacy
        timestamp: FieldValue.serverTimestamp(),
        stack: error.stack
      });
    } catch (logError) {
      console.error('[WARN] Failed to log error:', logError.message);
    }
    
    res.status(errorResponse.errorCode === 'RATE_LIMIT_EXCEEDED' ? 429 : 500).json(errorResponse);
  }
});

/**
 * HTTP endpoint to get user usage statistics
 * Returns daily query/image limits and remaining quota
 */
exports.getUserStats = functions.https.onRequest(async (req, res) => {
  try {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET, POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
    }

    const userId = req.body?.userId || req.query?.userId || req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const stats = await getUserUsageStats(userId, db);
    
    res.json({
      success: true,
      stats: {
        queries: {
          used: stats.queriesUsed,
          remaining: stats.queriesRemaining,
          limit: 100
        },
        images: {
          used: stats.imagesUsed,
          remaining: stats.imagesRemaining,
          limit: 20
        },
        resetTime: new Date().setHours(24, 0, 0, 0) // Midnight tonight
      }
    });
  } catch (error) {
    console.error('[ERROR] getUserStats failed:', error);
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

    console.log("[IMAGE] Processing image request...");

    const { base64Image, mimeType } = req.body;
    
    if (!base64Image) {
      return res.status(400).json({ error: "No image provided in request body" });
    }

    console.log(`[IMAGE] Image type: ${mimeType || 'image/jpeg'}`);
    console.log("[ANALYSIS] Analyzing image with Gemini Vision...");

    const startTime = Date.now();
    
    const language = req.body?.language || 'English';
    console.log(`[LANGUAGE] Language: ${language}`);

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
    
    console.log(`[TIME] Total image processing took ${Date.now() - startTime}ms`);
    console.log("[SUCCESS] Image processed successfully");
    console.log("[LOG] Extracted analysis:", text.substring(0, 100) + "...");

    // Save to search history
    saveToSearchHistory('Image Analysis', language, text.substring(0, 200)).catch(err =>
      console.error('Failed to save search history:', err)
    );

    res.json({ answer: text });
  } catch (error) {
    console.error("[ERROR] Image processing error:", error);
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

    console.log("[HISTORY] Fetching recent searches...");

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
      const timestamp = normalizeTimestamp(data.timestamp || data.createdAt);
      searches.push({
        id: doc.id,
        question: data.question,
        language: data.language,
        preview: data.preview,
        timestamp: timestamp ? timestamp.toISOString() : null,
      });
    });

    console.log(`[SUCCESS] Found ${searches.length} recent searches`);
    res.json({ searches, count: searches.length });
  } catch (error) {
    console.error("[ERROR] Error fetching search history:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * HTTP endpoint to save a conversation to Firestore
 */
exports.saveConversation = functions.https.onRequest(async (req, res) => {
  try {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed. Use POST.' });
      return;
    }

    const { question, answer, model, type, userId, language } = req.body;

    if (!question || !answer) {
      res.status(400).json({ error: 'Missing required fields: question and answer' });
      return;
    }

    console.log("[SAVE] Saving conversation to Firestore...");

    // Prepare conversation data
    const conversationData = {
      userId: userId || 'anonymous',
      question: question,
      answer: typeof answer === 'object' ? JSON.stringify(answer) : answer,
      model: model || 'gemini-2.0-flash',
      type: type || 'text',
      language: language || 'English',
      createdAt: new Date(), // Using regular Date object for emulator compatibility
    };

    // Save to Firestore
    const docRef = await db.collection('conversations').add(conversationData);

    console.log(`[SUCCESS] Conversation saved with ID: ${docRef.id}`);
    
    res.json({ 
      success: true, 
      conversationId: docRef.id,
      message: 'Conversation saved successfully'
    });
  } catch (error) {
    console.error("[ERROR] Error saving conversation:", error);
    res.status(500).json({ error: error.message });
  }
});