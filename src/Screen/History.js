import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import { useTheme } from '../context/ThemeContext';
import FooterNavigation from '../components/FooterNavigation';
import ProfileIcon from '../components/ProfileIcon';
import { getUserConversations, deleteConversation } from '../services/firebaseService';
import {
  getLocalConversations,
  deleteLocalConversation,
} from '../services/localStorageService';

const History = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isGuest, setIsGuest] = useState(true);

  useEffect(() => {
    const currentUser = auth().currentUser;
    setIsGuest(!currentUser);
  }, []);

  const loadConversations = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const currentUser = auth().currentUser;
      let data = [];

      if (currentUser) {
        // Load from Firestore for authenticated users
        try {
          data = await getUserConversations(50);
          if (data.length > 0 && data[0].fromCache) {
            console.log('[OFFLINE] Loaded conversations from offline cache');
          }
        } catch (error) {
          console.error('Failed to load from Firestore, falling back to local:', error);
          // Fallback to local storage if Firestore fails
          data = await getLocalConversations(50);
        }
      } else {
        // Load from local storage for guest users
        data = await getLocalConversations(50);
      }

      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      Alert.alert('Error', 'Failed to load conversation history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentUser = auth().currentUser;
              if (currentUser) {
                await deleteConversation(id);
              } else {
                await deleteLocalConversation(id);
              }
              setConversations(prev => prev.filter(c => c.id !== id));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete conversation');
            }
          },
        },
      ]
    );
  };

  const handleViewConversation = (conversation) => {
    navigation.navigate('Output', {
      result: conversation.answer,
      prompt: conversation.question,
      model: conversation.model || 'Gemini Pro',
      cached: true,
      fromHistory: true,
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      let date;
      
      // Handle Firestore Timestamp object (has toDate method)
      if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      }
      // Handle ISO string or number timestamp
      else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      }
      // Handle Date object
      else if (timestamp instanceof Date) {
        date = timestamp;
      }
      else {
        return 'Unknown date';
      }
      
      // Validate date
      if (isNaN(date.getTime())) {
        return 'Unknown date';
      }
      
      const now = new Date();
      const diff = now - date;
    
      // Less than 1 minute
      if (diff < 60000) return 'Just now';
      // Less than 1 hour
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      // Less than 1 day
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      // Less than 1 week
      if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <LinearGradient colors={colors.gradientBackground} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading history...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={colors.gradientBackground} style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isGuest ? 'Saved Chats' : 'History'}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
        >
          <ProfileIcon
            size={36}
            name={auth().currentUser?.displayName || 'Guest'}
            imageUri={auth().currentUser?.photoURL}
            isGuest={!auth().currentUser}
          />
        </TouchableOpacity>
      </View>

      {/* Guest Banner */}
      {isGuest && conversations.length > 0 && (
        <TouchableOpacity
          style={[styles.guestBanner, { backgroundColor: colors.primary + '15' }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Icon name="cloud-upload" size={24} color={colors.primary} />
          <View style={styles.guestBannerText}>
            <Text style={[styles.guestBannerTitle, { color: colors.text }]}>
              Sign in to sync your chats
            </Text>
            <Text style={[styles.guestBannerSubtitle, { color: colors.textSecondary }]}>
              Access your conversations across all devices
            </Text>
          </View>
          <Icon name="arrow-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      )}

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadConversations(true)}
            tintColor={colors.primary}
          />
        }
      >
        {conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="history" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No conversations yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Your search history will appear here
            </Text>
          </View>
        ) : (
          <>
            {conversations[0]?.fromCache && (
              <View style={[styles.offlineBanner, { backgroundColor: colors.primary + '20' }]}>
                <Icon name="offline-pin" size={20} color={colors.primary} />
                <Text style={[styles.offlineText, { color: colors.primary }]}>
                  Viewing offline data
                </Text>
              </View>
            )}

            {conversations.map((conversation) => (
              <TouchableOpacity
                key={conversation.id}
                style={[styles.conversationCard, { backgroundColor: colors.card }]}
                onPress={() => handleViewConversation(conversation)}
              >
                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <Icon
                      name={conversation.type === 'image' ? 'image' : 'chat'}
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.conversationDate, { color: colors.textSecondary }]}>
                      {formatDate(conversation.timestamp || conversation.createdAt || null)}
                    </Text>
                    {conversation.fromCache && (
                      <Icon name="offline-pin" size={16} color={colors.primary} />
                    )}
                  </View>

                  <Text style={[styles.conversationQuestion, { color: colors.text }]}>
                    {truncateText(conversation.question, 80)}
                  </Text>

                  <Text style={[styles.conversationAnswer, { color: colors.textSecondary }]}>
                    {truncateText(conversation.answer, 120)}
                  </Text>

                  <View style={styles.conversationFooter}>
                    <View style={[styles.modelBadge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.modelText, { color: colors.primary }]}>
                        {conversation.model || 'Gemini'}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(conversation.id)}
                >
                  <Icon name="delete-outline" size={24} color={colors.error || '#ef4444'} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <FooterNavigation navigation={navigation} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    gap: 12,
  },
  guestBannerText: {
    flex: 1,
  },
  guestBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  guestBannerSubtitle: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  offlineText: {
    fontSize: 14,
    fontWeight: '500',
  },
  conversationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  conversationDate: {
    fontSize: 12,
    flex: 1,
  },
  conversationQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  conversationAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  conversationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  modelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
  },
});

export default History;
