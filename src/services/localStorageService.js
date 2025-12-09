import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  GUEST_CONVERSATIONS: '@vedai:guestConversations',
  GUEST_STATS: '@vedai:guestStats',
};

/**
 * Save conversation to local storage for guest users
 */
export const saveConversationLocal = async (question, answer, model = 'gemini-2.0-flash', type = 'text') => {
  try {
    const conversationData = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question,
      answer: typeof answer === 'object' ? (answer.answer || JSON.stringify(answer)) : answer,
      model,
      type,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Get existing conversations
    const existing = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_CONVERSATIONS);
    const conversations = existing ? JSON.parse(existing) : [];

    // Add new conversation at the beginning
    conversations.unshift(conversationData);

    // Keep only last 100 conversations to avoid storage issues
    const limited = conversations.slice(0, 100);

    await AsyncStorage.setItem(STORAGE_KEYS.GUEST_CONVERSATIONS, JSON.stringify(limited));
    console.log('✅ Conversation saved locally');
    return conversationData.id;
  } catch (error) {
    console.error('❌ Error saving conversation locally:', error);
    throw error;
  }
};

/**
 * Get all local conversations
 */
export const getLocalConversations = async (limit = 50) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_CONVERSATIONS);
    if (!data) return [];

    const conversations = JSON.parse(data);
    return conversations.slice(0, limit);
  } catch (error) {
    console.error('❌ Error fetching local conversations:', error);
    return [];
  }
};

/**
 * Delete a local conversation
 */
export const deleteLocalConversation = async (conversationId) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_CONVERSATIONS);
    if (!data) return;

    const conversations = JSON.parse(data);
    const filtered = conversations.filter(c => c.id !== conversationId);

    await AsyncStorage.setItem(STORAGE_KEYS.GUEST_CONVERSATIONS, JSON.stringify(filtered));
    console.log('✅ Local conversation deleted');
  } catch (error) {
    console.error('❌ Error deleting local conversation:', error);
    throw error;
  }
};

/**
 * Search local conversations
 */
export const searchLocalConversations = async (keyword) => {
  try {
    const conversations = await getLocalConversations(100);
    const searchTerm = keyword.toLowerCase();

    return conversations.filter(conv =>
      conv.question.toLowerCase().includes(searchTerm) ||
      conv.answer.toLowerCase().includes(searchTerm)
    );
  } catch (error) {
    console.error('❌ Error searching local conversations:', error);
    return [];
  }
};

/**
 * Update guest statistics
 */
export const updateGuestStats = async (action) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_STATS);
    const stats = data ? JSON.parse(data) : {
      totalQuestions: 0,
      totalTextQuestions: 0,
      totalImageQuestions: 0,
      lastUsed: null,
      firstUsed: new Date().toISOString(),
    };

    stats.totalQuestions += 1;
    if (action === 'text') stats.totalTextQuestions += 1;
    if (action === 'image') stats.totalImageQuestions += 1;
    stats.lastUsed = new Date().toISOString();

    await AsyncStorage.setItem(STORAGE_KEYS.GUEST_STATS, JSON.stringify(stats));
    return stats;
  } catch (error) {
    console.error('❌ Error updating guest stats:', error);
    return null;
  }
};

/**
 * Get guest statistics
 */
export const getGuestStats = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_STATS);
    return data ? JSON.parse(data) : {
      totalQuestions: 0,
      totalTextQuestions: 0,
      totalImageQuestions: 0,
      lastUsed: null,
      firstUsed: null,
    };
  } catch (error) {
    console.error('❌ Error fetching guest stats:', error);
    return null;
  }
};

/**
 * Clear all local data (for when user logs out)
 */
export const clearLocalData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.GUEST_CONVERSATIONS,
      STORAGE_KEYS.GUEST_STATS,
    ]);
    console.log('✅ Local data cleared');
  } catch (error) {
    console.error('❌ Error clearing local data:', error);
  }
};

/**
 * Migrate guest data to user account (when guest logs in)
 */
export const migrateGuestDataToUser = async (saveToFirestore) => {
  try {
    const conversations = await getLocalConversations(100);
    
    if (conversations.length === 0) {
      console.log('No guest data to migrate');
      return { success: true, migrated: 0 };
    }

    let migratedCount = 0;
    for (const conv of conversations) {
      try {
        await saveToFirestore(conv.question, conv.answer, conv.model, conv.type);
        migratedCount++;
      } catch (error) {
        console.error('Error migrating conversation:', error);
      }
    }

    console.log(`✅ Migrated ${migratedCount} conversations to Firestore`);
    
    // Clear local data after successful migration
    await clearLocalData();
    
    return { success: true, migrated: migratedCount };
  } catch (error) {
    console.error('❌ Error migrating guest data:', error);
    return { success: false, migrated: 0, error };
  }
};
