/**
 * Get Recent Searches API Handler
 * Returns recent search history
 */

const { enableCORS } = require('../middlewares/cors');
const { normalizeTimestamp } = require('../services/analyticsService');
const { db } = require('../config/firebase');

async function getRecentSearches(req, res) {
  // Enable CORS
  if (enableCORS(req, res)) {
    return;
  }

  try {
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
}

module.exports = getRecentSearches;
