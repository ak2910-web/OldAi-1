/**
 * Analytics Service
 * Handles user statistics and model performance tracking
 */

const { db, FieldValue } = require('../config/firebase');
const { getModelStats } = require('./geminiService');

/**
 * Safe timestamp normalization for mixed data formats
 */
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

/**
 * Save search to history
 */
async function saveToSearchHistory(question, language, preview) {
  try {
    await db.collection('searchHistory').add({
      question,
      language,
      preview,
      timestamp: Date.now(),
    });
    console.log('[HISTORY] Search saved to history');
  } catch (error) {
    console.error('[ERROR] Error saving search history:', error.message);
  }
}

/**
 * Save model statistics to Firestore
 */
async function saveModelStats() {
  try {
    const statsData = getModelStats();
    
    await db.collection('modelStats').add({
      ...statsData,
      timestamp: FieldValue.serverTimestamp(),
    });
    
    console.log('[SAVE] Model statistics saved to Firestore');
  } catch (error) {
    console.error('[ERROR] Error saving stats:', error.message);
  }
}

/**
 * Track user query
 */
async function trackUserQuery(userId, question, language) {
  try {
    if (!userId) return;
    
    const userRef = db.collection('users').doc(userId);
    
    await userRef.set({
      lastQuery: question,
      lastQueryLanguage: language,
      lastQueryTimestamp: FieldValue.serverTimestamp(),
      totalQueries: FieldValue.increment(1),
    }, { merge: true });
    
    console.log('[TRACK] User query tracked');
  } catch (error) {
    console.error('[ERROR] Error tracking user query:', error.message);
  }
}

/**
 * Get user statistics
 */
async function getUserStats(userId) {
  try {
    if (!userId) {
      return { totalQueries: 0, lastQuery: null };
    }
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return { totalQueries: 0, lastQuery: null };
    }
    
    const data = userDoc.data();
    
    return {
      totalQueries: data.totalQueries || 0,
      lastQuery: data.lastQuery || null,
      lastQueryTimestamp: normalizeTimestamp(data.lastQueryTimestamp),
    };
  } catch (error) {
    console.error('[ERROR] Error getting user stats:', error.message);
    return { totalQueries: 0, lastQuery: null };
  }
}

module.exports = {
  normalizeTimestamp,
  saveToSearchHistory,
  saveModelStats,
  trackUserQuery,
  getUserStats,
};
