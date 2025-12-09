import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

/**
 * Firebase Firestore Service
 * Handles all database operations for OldAi app
 */

// Enable offline persistence for Firestore
let persistenceEnabled = false;

const enableOfflinePersistence = async () => {
  if (persistenceEnabled) return;
  
  try {
    await firestore().settings({
      persistence: true,
      cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
    });
    persistenceEnabled = true;
    console.log('✅ Firestore offline persistence enabled');
  } catch (error) {
    console.warn('⚠️ Failed to enable offline persistence:', error);
  }
};

// Enable persistence immediately
enableOfflinePersistence();

// Enable Firestore emulator for development
if (__DEV__) {
  firestore().useEmulator('10.0.2.2', 8080);
  console.log('🔧 Firestore emulator enabled at 10.0.2.2:8080');
}

// Collection names
const COLLECTIONS = {
  CONVERSATIONS: 'conversations',
  USERS: 'users',
};

/**
 * Save a conversation (question + answer) to Firestore
 * @param {string} question - The user's question
 * @param {Object|string} answer - The AI's answer (can be object with answer field or string)
 * @param {string} model - The AI model used
 * @param {string} type - Type of input ('text' or 'image')
 * @returns {Promise<string>} - Document ID
 */
export const saveConversation = async (question, answer, model = 'gemini-2.0-flash', type = 'text') => {
  try {
    const userId = auth().currentUser?.uid || 'anonymous';
    
    // Extract answer string from response object if needed
    const answerText = typeof answer === 'object' ? (answer.answer || JSON.stringify(answer)) : answer;
    
    const conversationData = {
      userId,
      question,
      answer: answerText,
      model,
      type,
      timestamp: firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString(),
      // Add metadata for offline access
      offline: !navigator.onLine,
      synced: navigator.onLine,
    };

    const docRef = await firestore()
      .collection(COLLECTIONS.CONVERSATIONS)
      .add(conversationData);

    console.log('✅ Conversation saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving conversation:', error);
    throw error;
  }
};

/**
 * Get all conversations for the current user
 * @param {number} limit - Maximum number of conversations to fetch
 * @returns {Promise<Array>} - Array of conversations
 */
export const getUserConversations = async (limit = 50) => {
  try {
    const userId = auth().currentUser?.uid || 'anonymous';
    console.log(`📚 Fetching conversations for user: ${userId}`);

    const snapshot = await firestore()
      .collection(COLLECTIONS.CONVERSATIONS)
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get({ source: 'default' }); // Use cache when offline

    const conversations = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        ...data,
        // Indicate if data is from cache (offline)
        fromCache: doc.metadata.fromCache,
      });
    });

    console.log(`✅ Fetched ${conversations.length} conversations (${snapshot.metadata.fromCache ? 'from cache' : 'from server'})`);
    return conversations;
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      name: error.name
    });
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
      console.error('💡 Tip: Make sure Firestore emulator is running on port 8080');
      console.error('   Run: cd C:\\OldAi\\OldAi\\vedai-backend && firebase emulators:start');
    }
    
    throw error;
  }
};

/**
 * Get a single conversation by ID
 * @param {string} conversationId - The conversation document ID
 * @returns {Promise<Object>} - Conversation data
 */
export const getConversationById = async (conversationId) => {
  try {
    const doc = await firestore()
      .collection(COLLECTIONS.CONVERSATIONS)
      .doc(conversationId)
      .get();

    if (!doc.exists) {
      throw new Error('Conversation not found');
    }

    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error('❌ Error fetching conversation:', error);
    throw error;
  }
};

/**
 * Delete a conversation
 * @param {string} conversationId - The conversation document ID
 * @returns {Promise<void>}
 */
export const deleteConversation = async (conversationId) => {
  try {
    await firestore()
      .collection(COLLECTIONS.CONVERSATIONS)
      .doc(conversationId)
      .delete();

    console.log('✅ Conversation deleted:', conversationId);
  } catch (error) {
    console.error('❌ Error deleting conversation:', error);
    throw error;
  }
};

/**
 * Search conversations by keyword
 * @param {string} keyword - Search term
 * @returns {Promise<Array>} - Array of matching conversations
 */
export const searchConversations = async (keyword) => {
  try {
    const userId = auth().currentUser?.uid || 'anonymous';

    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation - for production, consider using Algolia or similar
    const snapshot = await firestore()
      .collection(COLLECTIONS.CONVERSATIONS)
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get();

    const conversations = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const searchTerm = keyword.toLowerCase();
      
      if (
        data.question.toLowerCase().includes(searchTerm) ||
        data.answer.toLowerCase().includes(searchTerm)
      ) {
        conversations.push({
          id: doc.id,
          ...data,
        });
      }
    });

    console.log(`✅ Found ${conversations.length} matching conversations`);
    return conversations;
  } catch (error) {
    console.error('❌ Error searching conversations:', error);
    throw error;
  }
};

/**
 * Get conversation statistics for the user
 * @returns {Promise<Object>} - Statistics object
 */
export const getUserStats = async () => {
  try {
    const userId = auth().currentUser?.uid || 'anonymous';

    const snapshot = await firestore()
      .collection(COLLECTIONS.CONVERSATIONS)
      .where('userId', '==', userId)
      .get();

    const stats = {
      totalConversations: snapshot.size,
      textQuestions: 0,
      imageQuestions: 0,
    };

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.type === 'text') {
        stats.textQuestions++;
      } else if (data.type === 'image') {
        stats.imageQuestions++;
      }
    });

    console.log('✅ User stats:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    throw error;
  }
};

/**
 * Test Firestore connection
 * @returns {Promise<boolean>} - True if connection successful
 */
export const testFirestoreConnection = async () => {
  try {
    console.log('🔍 Testing Firestore connection...');
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout - Is Firebase emulator running?')), 10000)
    );
    
    const writePromise = firestore()
      .collection('_test')
      .add({
        message: 'Hello Firestore 👋',
        timestamp: firestore.FieldValue.serverTimestamp(),
        testDate: new Date().toISOString(),
      });

    await Promise.race([writePromise, timeoutPromise]);

    console.log('✅ Firestore connection test successful!');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection test failed:', error);
    throw error;
  }
};

export default {
  saveConversation,
  getUserConversations,
  getConversationById,
  deleteConversation,
  searchConversations,
  getUserStats,
  testFirestoreConnection,
};

// Alias for backwards compatibility
export const getConversations = getUserConversations;
