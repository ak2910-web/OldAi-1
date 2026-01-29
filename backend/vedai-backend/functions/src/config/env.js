/**
 * Environment Configuration
 * Centralized environment variable management
 */

require('dotenv').config();

// Collect all available Gemini API keys (with safety check)
const geminiApiKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean).filter(key => key.trim().length > 0); // Remove undefined/empty keys

const config = {
  // Gemini API - Multi-key support for rotation
  geminiApiKey: geminiApiKeys[0], // Primary key (backward compatible)
  geminiApiKeys: geminiApiKeys,   // All available keys
  
  // Environment
  isEmulator: process.env.FUNCTIONS_EMULATOR === 'true',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Rate Limiting
  rateLimit: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  
  // API Throttling
  apiThrottle: {
    minInterval: 1500, // ms between API calls
  },
  
  // Model Configuration - Prioritized by success rate
  availableModels: [
    'gemini-2.5-flash-lite',  // Best: 100% success in testing
    'gemini-2.0-flash-lite',  // Fallback
    'gemini-2.0-flash',       // Last resort
  ],
  
  // Timeouts
  timeouts: {
    apiCall: 90000, // 90 seconds
  },
  
  // Feature Flags
  features: {
    useOptimizedPrompts: process.env.USE_OPTIMIZED_PROMPTS !== 'false', // Default: enabled
    conceptBypass: process.env.FEATURE_CONCEPT_BYPASS !== 'false', // Default: enabled
  },
};

// Validation
if (config.geminiApiKeys.length === 0) {
  console.error('❌ ERROR: No GEMINI_API_KEY found!');
  console.error('Please create a .env file with GEMINI_API_KEY=your_api_key');
} else {
  console.log(`✅ GEMINI_API_KEY loaded successfully`);
  if (config.geminiApiKeys.length > 1) {
    console.log(`🔄 Multi-key rotation enabled: ${config.geminiApiKeys.length} keys available`);
  }
}

module.exports = config;
