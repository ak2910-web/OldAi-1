/**
 * Cache Service
 * Handles response caching with Firestore
 */

const crypto = require('crypto');
const { db } = require('../config/firebase');

/**
 * Generate cache key from question and language
 */
function generateCacheKey(question, language) {
  const hash = crypto.createHash('sha256').update(`${question}:${language}`).digest('hex');
  return hash;
}

/**
 * Get cached response
 */
async function getCachedResponse(question, language) {
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
}

/**
 * Save response to cache
 */
async function saveToCache(question, language, response) {
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
}

module.exports = {
  getCachedResponse,
  saveToCache,
};
