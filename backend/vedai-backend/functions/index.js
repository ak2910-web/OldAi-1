/**
 * Firebase Cloud Functions - Main Entry Point
 * Refactored modular architecture for VedAI backend
 * 
 * Structure:
 * - /src/config - Configuration and Firebase init
 * - /src/middlewares - CORS, rate limiting, auth
 * - /src/services - Business logic (Gemini, caching, analytics)
 * - /src/engines - Math, Vedic, classification, templating
 * - /src/utils - Validators, formatters, helpers
 * - /src/api - Focused route handlers
 */

const functions = require('firebase-functions');

// Import API handlers
const answerQuestion = require('./src/api/answerQuestion');
const processImage = require('./src/api/processImage');
const getUserStats = require('./src/api/getUserStats');
const getRecentSearches = require('./src/api/getRecentSearches');
const saveConversation = require('./src/api/saveConversation');
const listModels = require('./src/api/listModels');

// Export Cloud Functions
exports.answerQuestion = functions.https.onRequest(answerQuestion);
exports.processImage = functions.https.onRequest(processImage);
exports.getUserStats = functions.https.onRequest(getUserStats);
exports.getRecentSearches = functions.https.onRequest(getRecentSearches);
exports.saveConversation = functions.https.onRequest(saveConversation);
exports.listModels = functions.https.onRequest(listModels);

console.log('✅ VedAI Cloud Functions initialized with modular architecture');
console.log('📁 Structure: config | middlewares | services | engines | utils | api');
console.log('🚀 6 endpoints registered');
