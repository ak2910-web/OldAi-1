/**
 * Gemini AI Service
 * Handles all Google Generative AI interactions
 */

const fetch = require('node-fetch');
const config = require('../config/env');

// Available Gemini models for rotation (to avoid 429 rate limits)
const AVAILABLE_MODELS = config.availableModels;

// API Key rotation state (MULTI-KEY SUPPORT)
const API_KEYS = config.geminiApiKeys;
let currentKeyIndex = 0;
let keyUsageCount = {};
let keySuccessCount = {};
let keyFailureCount = {};
let keyCooldowns = {}; // Track rate-limited keys
const KEY_COOLDOWN_DURATION = 120000; // 2 minutes cooldown for exhausted keys

// Model rotation state
let currentModelIndex = 0;
let modelUsageCount = {};
let modelSuccessCount = {};
let modelFailureCount = {};
let modelCooldowns = {}; // FIX 3: Track rate-limited models
let lastResetTime = Date.now();

const RESET_INTERVAL = 60000; // 1 minute
const COOLDOWN_DURATION = 60000; // 1 minute cooldown for 429 errors

// FIX 2: Emulator-aware configuration
const MAX_RETRIES = config.isEmulator ? 1 : 3;
const RETRY_DELAYS = config.isEmulator ? [0] : [2000, 4000, 8000];

// Global API call throttle (prevent overwhelming Gemini)
let lastApiCallTime = 0;

// Initialize key stats
API_KEYS.forEach(key => {
  const keyId = key.substring(0, 20) + '...';
  keyUsageCount[keyId] = 0;
  keySuccessCount[keyId] = 0;
  keyFailureCount[keyId] = 0;
});

/**
 * Get key identifier for logging
 */
function getKeyId(apiKey) {
  return apiKey.substring(0, 20) + '...';
}

/**
 * Check if any healthy keys are available (SAFETY CHECK)
 * Prevents quota spiral when all keys are exhausted
 */
function hasHealthyKeys() {
  const now = Date.now();
  return API_KEYS.some(key => {
    const keyId = getKeyId(key);
    const cooldownUntil = keyCooldowns[keyId] || 0;
    return now >= cooldownUntil; // At least one key not in cooldown
  });
}

/**
 * Get next available API key (with cooldown check)
 */
function getNextApiKey() {
  const now = Date.now();
  
  // Try to find a key that's not in cooldown
  for (let i = 0; i < API_KEYS.length; i++) {
    const key = API_KEYS[currentKeyIndex];
    const keyId = getKeyId(key);
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    
    // Check if key is in cooldown
    const cooldownUntil = keyCooldowns[keyId] || 0;
    if (now < cooldownUntil) {
      const remainingMs = cooldownUntil - now;
      console.log(`[KEY-SKIP] ${keyId} in cooldown for ${Math.ceil(remainingMs / 1000)}s more`);
      continue;
    }
    
    // Track usage
    keyUsageCount[keyId] = (keyUsageCount[keyId] || 0) + 1;
    console.log(`[KEY-SELECTED] Using API key ${keyId} (used ${keyUsageCount[keyId]} times)`);
    
    return key;
  }
  
  // All keys in cooldown - return first anyway
  console.warn('[KEY-WARN] All API keys in cooldown, using primary key anyway');
  return API_KEYS[0];
}

/**
 * Record API key success
 */
function recordKeySuccess(apiKey) {
  const keyId = getKeyId(apiKey);
  keySuccessCount[keyId] = (keySuccessCount[keyId] || 0) + 1;
  console.log(`[KEY-SUCCESS] ${keyId} (total: ${keySuccessCount[keyId]})`);
}

/**
 * Record API key failure and set cooldown if needed
 */
function recordKeyFailure(apiKey, isRateLimit = false) {
  const keyId = getKeyId(apiKey);
  keyFailureCount[keyId] = (keyFailureCount[keyId] || 0) + 1;
  
  if (isRateLimit && API_KEYS.length > 1) {
    // Put key in cooldown only if we have multiple keys
    keyCooldowns[keyId] = Date.now() + KEY_COOLDOWN_DURATION;
    console.log(`[KEY-COOLDOWN] ${keyId} exhausted, cooldown for ${KEY_COOLDOWN_DURATION / 1000}s`);
  }
  
  console.log(`[KEY-FAILURE] ${keyId} (total: ${keyFailureCount[keyId]})`);
}

/**
 * Get key statistics
 */
function getKeyStats() {
  return API_KEYS.map(key => {
    const keyId = getKeyId(key);
    return {
      keyId,
      usage: keyUsageCount[keyId] || 0,
      success: keySuccessCount[keyId] || 0,
      failure: keyFailureCount[keyId] || 0,
      inCooldown: Date.now() < (keyCooldowns[keyId] || 0),
      successRate: ((keySuccessCount[keyId] || 0) / ((keySuccessCount[keyId] || 0) + (keyFailureCount[keyId] || 0)) * 100) || 0
    };
  });
}

/**
 * Throttle API calls to respect rate limits
 */
async function throttleApiCall() {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCallTime;
  
  if (timeSinceLastCall < config.apiThrottle.minInterval) {
    const waitTime = config.apiThrottle.minInterval - timeSinceLastCall;
    console.log(`[THROTTLE] Waiting ${waitTime}ms to respect API rate limit`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastApiCallTime = Date.now();
}

/**
 * Get next available model using round-robin rotation
 */
function getNextModel() {
  const now = Date.now();
  
  // Reset counters if interval passed
  if (now - lastResetTime > RESET_INTERVAL) {
    console.log('[STATS] Model Performance Summary:');
    AVAILABLE_MODELS.forEach(model => {
      const success = modelSuccessCount[model] || 0;
      const failure = modelFailureCount[model] || 0;
      const total = success + failure;
      const successRate = total > 0 ? ((success / total) * 100).toFixed(1) : 'N/A';
      console.log(`  ${model}: ${success}/${total} (${successRate}% success)`);
    });
    
    modelUsageCount = {};
    modelSuccessCount = {};
    modelFailureCount = {};
    modelCooldowns = {}; // Clear cooldowns
    lastResetTime = now;
    console.log('[RESET] Reset model usage counters and cooldowns');
  }

  // FIX 3: Skip models in cooldown (short-circuit rate-limited models)
  for (let i = 0; i < AVAILABLE_MODELS.length; i++) {
    const selectedModel = AVAILABLE_MODELS[currentModelIndex];
    currentModelIndex = (currentModelIndex + 1) % AVAILABLE_MODELS.length;
    
    // Check if model is in cooldown
    const cooldownUntil = modelCooldowns[selectedModel] || 0;
    if (now < cooldownUntil) {
      const remainingMs = cooldownUntil - now;
      console.log(`[SKIP] ${selectedModel} in cooldown for ${Math.ceil(remainingMs / 1000)}s more`);
      continue; // Try next model immediately
    }
    
    // Track usage
    modelUsageCount[selectedModel] = (modelUsageCount[selectedModel] || 0) + 1;
    
    console.log(`[SELECTED] Selected model: ${selectedModel} (used ${modelUsageCount[selectedModel]} times)`);
    console.log(`[STATS] Model usage stats:`, modelUsageCount);
    
    return selectedModel;
  }
  
  // All models in cooldown - return first anyway
  console.warn('[WARN] All models in cooldown, using first model anyway');
  return AVAILABLE_MODELS[0];
}

/**
 * Record model success
 */
function recordSuccess(modelName) {
  modelSuccessCount[modelName] = (modelSuccessCount[modelName] || 0) + 1;
  console.log(`[SUCCESS] Success recorded for ${modelName} (total: ${modelSuccessCount[modelName]})`);
}

/**
 * Record model failure
 */
function recordFailure(modelName) {
  modelFailureCount[modelName] = (modelFailureCount[modelName] || 0) + 1;
  console.log(`[ERROR] Failure recorded for ${modelName} (total: ${modelFailureCount[modelName]})`);
}

/**
 * Get model statistics
 */
function getModelStats() {
  return {
    models: AVAILABLE_MODELS.map(model => ({
      name: model,
      usage: modelUsageCount[model] || 0,
      success: modelSuccessCount[model] || 0,
      failure: modelFailureCount[model] || 0,
      successRate: ((modelSuccessCount[model] || 0) / ((modelSuccessCount[model] || 0) + (modelFailureCount[model] || 0)) * 100) || 0
    }))
  };
}

/**
 * Make API call with automatic retry on 429 error and exponential backoff
 * @param {string} prompt - The prompt to send
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<string>} - Response text
 */
async function callGeminiWithRetry(prompt, maxRetries = MAX_RETRIES) {
  // SAFETY CHECK: Graceful degradation when all keys exhausted
  if (!hasHealthyKeys()) {
    console.error('[DEGRADED] All API keys in cooldown - graceful degradation');
    throw new Error('QUOTA_EXHAUSTED: All API keys temporarily exhausted. Please try again in 2 minutes or add more keys.');
  }
  
  let lastError;
  let currentApiKey = getNextApiKey(); // Get initial key with rotation
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const modelName = getNextModel();
      console.log(`[RETRY] Attempt ${attempt + 1}/${maxRetries} with model: ${modelName}`);
      
      await throttleApiCall();
      
      console.log('[API-CALL] Calling Google Generative AI');
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${currentApiKey}`,
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
      
      // FIX 3: Handle 429 (rate limit) - mark cooldown and try next immediately
      if (response.status === 429) {
        console.warn(`[RATE-LIMIT] 429 hit on ${modelName} with key ${getKeyId(currentApiKey)}`);
        recordFailure(modelName);
        recordKeyFailure(currentApiKey, true); // Mark key as rate-limited
        modelCooldowns[modelName] = Date.now() + COOLDOWN_DURATION;
        
        // Try switching to a different API key if available
        if (API_KEYS.length > 1) {
          const newKey = getNextApiKey();
          if (newKey !== currentApiKey) {
            console.log('[KEY-SWITCH] Switching to different API key due to rate limit');
            currentApiKey = newKey;
            // Don't wait if we switched keys - try immediately
            lastError = new Error(`Rate limit on ${modelName}, switched key`);
            continue;
          }
        }
        
        lastError = new Error(`Rate limit on ${modelName}`);
        
        // FIX 2: In emulator, skip delay; in production, short delay
        const backoffTime = config.isEmulator ? 0 : RETRY_DELAYS[attempt] || 2000;
        if (backoffTime > 0) {
          console.log(`[WAIT] Waiting ${backoffTime}ms before next model...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
        continue; // Try next model immediately
      }
      
      // Handle 503 (overload) - fail gracefully
      if (response.status === 503) {
        console.error(`[OVERLOAD] 503 Service Overloaded on ${modelName}`);
        recordFailure(modelName);
        throw new Error('Gemini API is currently overloaded. Please try again in a moment.');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ERROR] Model ${modelName} error (${response.status})`);
        recordFailure(modelName);
        lastError = new Error(`API error (${response.status}): ${errorText}`);
        
        // FIX 2: Emulator-aware backoff
        const backoffTime = config.isEmulator ? 0 : Math.pow(2, attempt) * 500;
        if (backoffTime > 0) {
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
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
      
      console.log(`[SUCCESS] Success with model: ${modelName} and key ${getKeyId(currentApiKey)}`);
      recordSuccess(modelName);
      recordKeySuccess(currentApiKey);
      return text;
      
    } catch (error) {
      console.error(`[ERROR] Attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
      
      // Don't retry on specific errors
      if (error.message.includes('overloaded')) {
        throw error;
      }
      
      if (attempt < maxRetries - 1) {
        // FIX 2: Emulator-aware backoff
        const backoffTime = config.isEmulator ? 0 : Math.pow(2, attempt) * 500;
        if (backoffTime > 0) {
          console.log(`[WAIT] Exponential backoff: ${backoffTime}ms`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
    }
  }
  
  console.error('[ERROR] All Gemini models failed.');
  throw lastError || new Error('All Gemini model attempts failed');
}

/**
 * Make image API call with automatic retry
 * @param {string} prompt - The prompt to send
 * @param {object} imageData - Image data object with inlineData
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<string>} - Response text
 */
async function callGeminiVisionWithRetry(prompt, imageData, maxRetries = 3) {
  // SAFETY CHECK: Graceful degradation when all keys exhausted
  if (!hasHealthyKeys()) {
    console.error('[DEGRADED] All API keys in cooldown for image - graceful degradation');
    throw new Error('QUOTA_EXHAUSTED: All API keys temporarily exhausted. Please try again in 2 minutes or add more keys.');
  }
  
  let lastError;
  let currentApiKey = getNextApiKey(); // Get initial key with rotation
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const modelName = getNextModel();
      console.log(`[RETRY] Image attempt ${attempt + 1}/${maxRetries} with model: ${modelName}`);
      
      await throttleApiCall();
      
      console.log('[API-CALL] Calling Google Generative AI for image');
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${currentApiKey}`,
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

      if (response.status === 429) {
        console.warn(`[RATE-LIMIT] 429 hit on ${modelName} for image with key ${getKeyId(currentApiKey)}`);
        recordFailure(modelName);
        recordKeyFailure(currentApiKey, true);
        
        // Try switching to a different API key if available
        if (API_KEYS.length > 1) {
          const newKey = getNextApiKey();
          if (newKey !== currentApiKey) {
            console.log('[KEY-SWITCH] Switching to different API key for image');
            currentApiKey = newKey;
            lastError = new Error(`Rate limit on ${modelName}, switched key`);
            continue;
          }
        }
        
        lastError = new Error(`Rate limit on ${modelName}`);
        const backoffTime = Math.pow(2, attempt) * 2000;
        console.log(`[WAIT] Waiting ${backoffTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        continue;
      }
      
      if (response.status === 503) {
        console.error(`[OVERLOAD] 503 Service Overloaded on ${modelName} for image`);
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
        console.warn("[WARNING] Image response truncated due to MAX_TOKENS");
      }

      const text = candidate.content?.parts?.[0]?.text || 
                   "No response generated from image analysis";

      console.log(`[SUCCESS] Image success with model: ${modelName} and key ${getKeyId(currentApiKey)}`);
      recordSuccess(modelName);
      recordKeySuccess(currentApiKey);
      return text;

    } catch (error) {
      console.error(`[ERROR] Image attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const backoffTime = Math.pow(2, attempt) * 500;
        console.log(`[WAIT] Exponential backoff: ${backoffTime}ms`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }

  console.error('[ERROR] All Gemini models failed for image');
  throw lastError || new Error('All image model attempts failed');
}

module.exports = {
  callGeminiWithRetry,
  callGeminiVisionWithRetry,
  getModelStats,
  getKeyStats, // Export key statistics for monitoring
};
