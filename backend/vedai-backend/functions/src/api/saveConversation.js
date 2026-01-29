/**
 * Save Conversation API Handler
 * Saves conversation to Firestore
 */

const { enableCORS } = require('../middlewares/cors');
const { db } = require('../config/firebase');

async function saveConversation(req, res) {
  // Enable CORS
  if (enableCORS(req, res)) {
    return;
  }

  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed. Use POST.' });
      return;
    }

    const { question, answer, model, type, userId, language } = req.body;

    if (!question || !answer) {
      res.status(400).json({ error: 'Missing required fields: question and answer' });
      return;
    }

    console.log("[SAVE] Saving conversation to Firestore...");

    // Prepare conversation data
    const conversationData = {
      userId: userId || 'anonymous',
      question: question,
      answer: typeof answer === 'object' ? JSON.stringify(answer) : answer,
      model: model || 'gemini-2.0-flash',
      type: type || 'text',
      language: language || 'English',
      createdAt: new Date(),
    };

    // Save to Firestore
    const docRef = await db.collection('conversations').add(conversationData);

    console.log(`[SUCCESS] Conversation saved with ID: ${docRef.id}`);
    
    res.json({ 
      success: true, 
      conversationId: docRef.id,
      message: 'Conversation saved successfully'
    });
    
  } catch (error) {
    console.error("[ERROR] Error saving conversation:", error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = saveConversation;
