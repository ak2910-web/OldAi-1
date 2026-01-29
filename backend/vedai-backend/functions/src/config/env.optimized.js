/**
 * ENVIRONMENT-AWARE CONFIGURATION
 * Separate settings for emulator vs production
 */

require('dotenv').config();

const ENV_TYPE = process.env.FUNCTIONS_EMULATOR === 'true' ? 'emulator' : 'production';

// Collect all available Gemini API keys (with safety checks)
const geminiApiKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean).filter(key => key.trim().length > 0);

// ========================================
// EMULATOR CONFIGURATION (Fast & Loose)
// ========================================
const EMULATOR_CONFIG = {
  // API Keys
  geminiApiKeys,
  geminiApiKey: geminiApiKeys[0],
  
  // Environment
  isEmulator: true,
  nodeEnv: 'development',
  
  // Rate Limiting (disabled for dev)
  rateLimit: {
    enabled: false,
    maxRequests: 1000,
    windowMs: 60 * 1000,
  },
  
  // API Settings (aggressive for speed)
  api: {
    maxRetries: 1,  // Fast fail
    retryDelays: [0],  // No delays
    timeout: 30000,  // 30s (shorter)
    throttle: {
      minInterval: 0,  // No throttling
    }
  },
  
  // Optimization Flags
  optimization: {
    useCompactPrompts: true,  // 60% token reduction
    useConceptBypass: true,   // Instant theory responses
    aggressiveCache: true,    // Cache everything
    verboseLogging: true,     // Debug info
  },
  
  // Model Configuration
  availableModels: [
    'gemini-2.5-flash-lite',  // Fastest first
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
  ],
  
  // Cooldowns (shorter for dev)
  cooldowns: {
    keyCooldown: 60000,    // 1 min
    modelCooldown: 30000,  // 30s
  }
};

// ========================================
// PRODUCTION CONFIGURATION (Safe & Reliable)
// ========================================
const PRODUCTION_CONFIG = {
  // API Keys
  geminiApiKeys,
  geminiApiKey: geminiApiKeys[0],
  
  // Environment
  isEmulator: false,
  nodeEnv: process.env.NODE_ENV || 'production',
  
  // Rate Limiting (enabled for safety)
  rateLimit: {
    enabled: true,
    maxRequests: 100,
    windowMs: 60 * 1000,  // 1 minute
  },
  
  // API Settings (conservative for reliability)
  api: {
    maxRetries: 3,  // More attempts
    retryDelays: [2000, 4000, 8000],  // Exponential backoff
    timeout: 90000,  // 90s (generous)
    throttle: {
      minInterval: 1500,  // 1.5s between calls
    }
  },
  
  // Optimization Flags
  optimization: {
    useCompactPrompts: true,   // Still use optimized templates
    useConceptBypass: true,    // Still bypass when possible
    aggressiveCache: true,     // Cache for performance
    verboseLogging: false,     // Minimal logging
  },
  
  // Model Configuration (same priority)
  availableModels: [
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
  ],
  
  // Cooldowns (longer for safety)
  cooldowns: {
    keyCooldown: 120000,   // 2 min
    modelCooldown: 60000,  // 1 min
  }
};

// ========================================
// SELECT CONFIGURATION BASED ON ENVIRONMENT
// ========================================
const config = ENV_TYPE === 'emulator' ? EMULATOR_CONFIG : PRODUCTION_CONFIG;

// Validation
if (config.geminiApiKeys.length === 0) {
  console.error('❌ ERROR: No GEMINI_API_KEY found!');
  console.error('Please create a .env file with GEMINI_API_KEY=your_api_key');
} else {
  console.log(`✅ GEMINI_API_KEY loaded successfully`);
  if (config.geminiApiKeys.length > 1) {
    console.log(`🔄 Multi-key rotation enabled: ${config.geminiApiKeys.length} keys available`);
  }
  console.log(`🌍 Environment: ${ENV_TYPE.toUpperCase()}`);
  
  if (ENV_TYPE === 'emulator') {
    console.log('⚡ EMULATOR MODE: Fast retries, no throttling, verbose logging');
  } else {
    console.log('🔒 PRODUCTION MODE: Safe retries, throttling enabled, optimized logging');
  }
}

module.exports = config;
