/**
 * Get User Stats API Handler
 * Returns user usage statistics and remaining quota
 */

const { enableCORS } = require('../middlewares/cors');
const { getUserUsageStats } = require('../utils/validators');
const { db } = require('../config/firebase');

async function getUserStats(req, res) {
  // Enable CORS
  if (enableCORS(req, res)) {
    return;
  }

  try {
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
}

module.exports = getUserStats;
