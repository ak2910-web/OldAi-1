// Utility: Clean and format AI response for React Native output (handles \n, \", math, etc.)
export function formatResponse(text = "") {
  if (!text) return "";
  return text
    .replace(/\\n/g, '\n')
    .replace(/\n{2,}/g, '\n\n')
    .replace(/\\"/g, '"')
    .replace(/\\t/g, ' ')
    .replace(/\*\*(\d+)/g, '^($1)')
    .replace(/sqrt\((.*?)\)/g, '√($1)')
    .replace(/\*(?=\d)/g, ' × ')
    .replace(/\/(?=\d)/g, ' ÷ ')
    .trim();
}
export const BASE_URL = "http://localhost:5005/demo-no-project/us-central1";
// Using localhost with ADB reverse instead of IP address

const MAX_RETRIES = 1;
const TIMEOUT = 90000; // 90 seconds - generous timeout for Gemini API

// Model success tracking
const modelStats = {
  'gemini-1.5-flash': { success: 0, failure: 0, lastUsed: 0 },
  'gemini-1.5-pro': { success: 0, failure: 0, lastUsed: 0 },
  'gemini-2.0-flash-exp': { success: 0, failure: 0, lastUsed: 0 },
};

// Calculate success rate for a model
const getSuccessRate = (modelName) => {
  const stats = modelStats[modelName];
  if (!stats) return 0;
  const total = stats.success + stats.failure;
  if (total === 0) return 0.5; // neutral for untested models
  return stats.success / total;
};

// Get models sorted by success rate (best first)
const getModelsBySuccessRate = () => {
  return Object.keys(modelStats).sort((a, b) => {
    const rateA = getSuccessRate(a);
    const rateB = getSuccessRate(b);
    // If rates are equal, prefer less recently used
    if (rateA === rateB) {
      return modelStats[a].lastUsed - modelStats[b].lastUsed;
    }
    return rateB - rateA; // descending order
  });
};

// Record success
const recordSuccess = (modelName) => {
  if (modelStats[modelName]) {
    modelStats[modelName].success++;
    modelStats[modelName].lastUsed = Date.now();
    console.log(`✅ ${modelName} success: ${modelStats[modelName].success}/${modelStats[modelName].success + modelStats[modelName].failure}`);
  }
};

// Record failure
const recordFailure = (modelName) => {
  if (modelStats[modelName]) {
    modelStats[modelName].failure++;
    modelStats[modelName].lastUsed = Date.now();
    console.log(`❌ ${modelName} failure: ${modelStats[modelName].failure}/${modelStats[modelName].success + modelStats[modelName].failure}`);
  }
};

// Simple connection test
const testConnection = async () => {
  try {
    const response = await fetch('https://www.google.com');
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const getResonance = async (text, language = 'English') => {
  const models = getModelsBySuccessRate();
  let lastError = null;

  // Try each model in order of success rate
  for (const preferredModel of models) {
    try {
      console.log(`🔄 Trying model: ${preferredModel} (success rate: ${(getSuccessRate(preferredModel) * 100).toFixed(0)}%)`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
      
      const res = await fetch(`${BASE_URL}/answerQuestion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Preferred-Model": preferredModel // Send preferred model to backend
        },
        body: JSON.stringify({
          question: text,
          language: language,
          preferredModel: preferredModel
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorText = await res.text();
        recordFailure(preferredModel);
        throw new Error(`Server error (${res.status}): ${errorText}`);
      }
      
      const data = await res.json();
      
      if (data.error) {
        recordFailure(preferredModel);
        throw new Error(data.error);
      }
      
      if (!data.answer) {
        recordFailure(preferredModel);
        throw new Error('No answer received from server');
      }
      
      // Success! Record it
      recordSuccess(preferredModel);
      console.log(`✅ Successfully got response from ${preferredModel}`);
      
      // Return full response object from Hybrid Dynamic Output Engine
      return {
        answer: data.answer,
        questionType: data.questionType || 'misc',
        sections: data.sections || {},
        tokenCount: data.tokenCount || 0,
        cached: data.cached || false,
        processingTime: data.processingTime || 0,
        modelUsed: preferredModel
      };
      
    } catch (error) {
      lastError = error;
      console.log(`⚠️ Model ${preferredModel} failed: ${error.message}`);
      
      if (error.name === 'AbortError') {
        recordFailure(preferredModel);
        // Don't retry on timeout, move to next model
        continue;
      }
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        // Network error - no point trying other models
        throw new Error('Cannot connect to server. Please make sure:\n1. Firebase emulator is running\n2. You have internet connection\n3. Try restarting the app');
      }
      
      // Try next model
      continue;
    }
  }
  
  // All models failed
  throw new Error(`All models failed. Last error: ${lastError?.message || 'Unknown error'}`);
};

export const extractText = async (base64Image, mimeType) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const res = await fetch(`${BASE_URL}/processImage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        base64Image,
        mimeType 
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Server responded with status ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }
    
    return { text: data.answer };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Image processing request timed out. Please try again.');
    }
    console.error('Error in extractText:', error);
    throw error;
  }
};

// Get recent searches
export const getRecentSearches = async (limit = 10) => {
  try {
    console.log('📜 Fetching recent searches...');
    
    const res = await fetch(`${BASE_URL}/getRecentSearches?limit=${limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Server error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    console.log(`✅ Fetched ${data.count} recent searches`);
    return data.searches || [];
    
  } catch (error) {
    console.error('❌ Error fetching recent searches:', error);
    return []; // Return empty array on error
  }
}

// Save conversation to Firestore via backend
export const saveConversationToFirestore = async (question, answer, model = 'gemini-2.0-flash', type = 'text', language = 'English') => {
  try {
    console.log('💾 Saving conversation to Firestore...');
    
    const res = await fetch(`${BASE_URL}/saveConversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        answer: typeof answer === 'object' ? (answer.answer || JSON.stringify(answer)) : answer,
        model,
        type,
        language,
        userId: 'anonymous' // You can replace this with actual user ID from auth
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Server error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    console.log(`✅ Conversation saved with ID: ${data.conversationId}`);
    return data.conversationId;
    
  } catch (error) {
    console.error('❌ Error saving conversation:', error);
    throw error;
  }
}

// Utility: Clean and format API response for React Native output
export function prepareOutput(raw) {
  if (!raw) return '';
  let text = raw;
  // Normalize all newline patterns: /n, /nn, \n, \n\n, \r\n, \r
  text = text.replace(/(\\n|\/n|\\n\\n|\/nn|\n\n|\r\n|\r)/g, '\n');
  // Collapse 3+ newlines to 2 (paragraph spacing)
  text = text.replace(/\n{3,}/g, '\n\n');
  // Math formatting: powers, roots, fractions
  text = text.replace(/\^2/g, '²')
             .replace(/\^3/g, '³')
             .replace(/\^4/g, '⁴')
             .replace(/\^5/g, '⁵')
             .replace(/sqrt\(([^)]+)\)/g, '√$1')
             .replace(/1\/2/g, '½')
             .replace(/1\/3/g, '⅓')
             .replace(/1\/4/g, '¼')
             .replace(/3\/4/g, '¾');
  // Bold headings (simple heuristic)
  text = text.replace(/(Vedic Method|Modern Method|Formula|Steps|Example|Explanation|Main Topic|Ancient Vedic Perspective|Modern Mathematical Perspective|The Connection|Applications|Comparison)/g, match => `**${match}**`);
  // Indent steps
  text = text.replace(/(Step \d+:)/g, '\n    $1');
  // Clean up extra spaces
  text = text.replace(/ +/g, ' ');

  // Format markdown-style tables as readable columns
  text = text.replace(/\n\|(.+?)\|\n\|([\-\| ]+)\|\n((\|.+\|\n)+)/g, (match, header, sep, rows) => {
    // Split header and rows
    const headers = header.split('|').map(h => h.trim());
    const rowLines = rows.trim().split('\n').map(r => r.split('|').map(c => c.trim()));
    // Build readable table
    let out = '\n';
    out += headers.map(h => h.padEnd(18)).join(' | ') + '\n';
    out += headers.map(() => '------------------').join(' | ') + '\n';
    rowLines.forEach(cols => {
      if (cols.length === headers.length) {
        out += cols.map(c => c.padEnd(18)).join(' | ') + '\n';
      }
    });
    return out;
  });

  return text.trim();
}
