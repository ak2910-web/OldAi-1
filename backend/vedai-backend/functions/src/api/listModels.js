/**
 * List Models API Handler
 * Returns available Gemini models and API key health status
 */

const { enableCORS } = require('../middlewares/cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');
const { getModelStats, getKeyStats } = require('../services/geminiService');

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

async function listModels(req, res) {
  // Enable CORS
  if (enableCORS(req, res)) {
    return;
  }

  try {
    console.log("[LIST] Listing available models...");
    
    const models = await genAI.listModels();
    const modelList = models.map(m => ({
      name: m.name,
      displayName: m.displayName,
      supportedMethods: m.supportedGenerationMethods
    }));
    
    // Get model and key statistics
    const modelStats = getModelStats();
    const keyStats = getKeyStats();
    
    console.log("[SUCCESS] Found models:", modelList.length);
    res.json({ 
      models: modelList,
      statistics: {
        modelPerformance: modelStats,
        apiKeyHealth: keyStats,
        totalKeysAvailable: config.geminiApiKeys.length
      }
    });
    
  } catch (error) {
    console.error("[ERROR] Error listing models:", error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = listModels;
