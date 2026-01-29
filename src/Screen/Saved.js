import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import { useTheme } from '../context/ThemeContext';
import StatusBarThemed from '../components/StatusBarThemed';
import FooterNavigation from '../components/FooterNavigation';
import ProfileIcon from '../components/ProfileIcon';
import { getUserConversations } from '../services/firebaseService';
import { getLocalConversations } from '../services/localStorageService';

const { width } = Dimensions.get('window');

const Saved = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('discoveries'); // 'discoveries' | 'conversations'
  const [favoriteDiscoveries, setFavoriteDiscoveries] = useState([]);
  const [savedConversations, setSavedConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // All discoveries data (same as Explore.js)
  const discoveries = [
    {
      id: 1,
      title: 'The Concept of Zero',
      category: 'Mathematics',
      ancientInsight: 'Aryabhata and Brahmagupta formalized zero as both a number and placeholder in the 5th-7th centuries CE.',
      modernResonance: 'Foundation of binary systems, computing, and modern mathematics.',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
    },
    {
      id: 2,
      title: 'Atomic Theory',
      category: 'Science',
      ancientInsight: 'Kanada\'s Vaisheshika philosophy (6th century BCE) described "Paramanu" - indivisible particles.',
      modernResonance: 'Parallels modern atomic theory and quantum mechanics.',
      image: 'https://images.unsplash.com/photo-1530685932526-48ec92998eaa?w=800',
    },
    {
      id: 3,
      title: 'Ayurvedic Medicine',
      category: 'Medicine',
      ancientInsight: 'Holistic health system focusing on balance of doshas (Vata, Pitta, Kapha).',
      modernResonance: 'Integrative medicine, personalized healthcare, gut-brain connection.',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    },
    {
      id: 4,
      title: 'Pythagorean Theorem',
      category: 'Mathematics',
      ancientInsight: 'Baudhayana Sulba Sutra (800 BCE) stated: "The diagonal of a square produces double the area."',
      modernResonance: 'Fundamental to geometry, engineering, physics, and navigation.',
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800',
    },
    {
      id: 5,
      title: 'Yoga & Meditation',
      category: 'Wellness',
      ancientInsight: 'Patanjali\'s Yoga Sutras (400 CE) outlined eight limbs for mental and physical harmony.',
      modernResonance: 'Neuroscience validates benefits for stress, focus, and mental health.',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    },
    {
      id: 6,
      title: 'Plastic Surgery',
      category: 'Medicine',
      ancientInsight: 'Sushruta Samhita (6th century BCE) detailed rhinoplasty and reconstructive techniques.',
      modernResonance: 'Foundation of modern plastic and reconstructive surgery.',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
    },
    {
      id: 7,
      title: 'Astronomical Calculations',
      category: 'Astronomy',
      ancientInsight: 'Aryabhata calculated Earth\'s circumference (24,835 miles) and rotation.',
      modernResonance: 'Accurate to within 0.2% of modern measurements.',
      image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800',
    },
    {
      id: 8,
      title: 'Fibonacci Sequence',
      category: 'Mathematics',
      ancientInsight: 'Pingala\'s Chandas Shastra (200 BCE) described binary patterns in Sanskrit prosody.',
      modernResonance: 'Appears in nature, computer science, and financial markets.',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    },
    {
      id: 9,
      title: 'Heliocentric Model',
      category: 'Astronomy',
      ancientInsight: 'Aryabhata proposed Earth rotates on its axis and orbits the Sun (499 CE).',
      modernResonance: 'Predated Copernicus by 1000+ years.',
      image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800',
    },
    {
      id: 10,
      title: 'Panini\'s Grammar',
      category: 'Grammar',
      ancientInsight: 'Ashtadhyayi (5th century BCE) - formal grammar system with 4,000 rules.',
      modernResonance: 'Influenced computer science, formal languages, and AI linguistics.',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
    },
    {
      id: 11,
      title: 'Metallurgy',
      category: 'Science',
      ancientInsight: 'Iron pillar of Delhi (400 CE) - rust-resistant due to high phosphorus content.',
      modernResonance: 'Advanced corrosion-resistant alloy techniques.',
      image: 'https://images.unsplash.com/photo-1581092918484-8313e1b6e1d7?w=800',
    },
    {
      id: 12,
      title: 'Cataract Surgery',
      category: 'Medicine',
      ancientInsight: 'Sushruta performed "couching" procedure to treat cataracts.',
      modernResonance: 'Pioneered ophthalmology and modern eye surgery.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800',
    },
    {
      id: 13,
      title: 'Mind-Body Connection',
      category: 'Wellness',
      ancientInsight: 'Upanishads explored consciousness and its effect on physical health.',
      modernResonance: 'Psychoneuroimmunology validates mind\'s impact on immunity.',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    },
    {
      id: 14,
      title: 'Vedic Philosophy',
      category: 'Philosophy',
      ancientInsight: 'Advaita Vedanta - non-dualism, unity of consciousness and reality.',
      modernResonance: 'Quantum physics explores observer effect and consciousness.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    },
    {
      id: 15,
      title: 'Sankhya Philosophy',
      category: 'Philosophy',
      ancientInsight: 'Dualistic system distinguishing consciousness (Purusha) from matter (Prakriti).',
      modernResonance: 'Mind-body problem in cognitive science and philosophy of mind.',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    },
    {
      id: 16,
      title: 'Vastu Shastra',
      category: 'Architecture',
      ancientInsight: 'Ancient architectural principles for harmonious living spaces.',
      modernResonance: 'Influences sustainable architecture and biophilic design.',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    },
    {
      id: 17,
      title: 'Ramayana & Mahabharata',
      category: 'Literature',
      ancientInsight: 'Epic narratives exploring dharma, ethics, and human nature.',
      modernResonance: 'Influences storytelling, ethics, and cross-cultural narratives.',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
    },
    {
      id: 18,
      title: 'Nyaya Logic',
      category: 'Logic',
      ancientInsight: 'Systematic epistemology with 16 categories of logical reasoning.',
      modernResonance: 'Foundation for formal logic, debate, and analytical philosophy.',
      image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800',
    },
    {
      id: 19,
      title: 'Binary Number System',
      category: 'Mathematics',
      ancientInsight: 'Pingala\'s Chandas Shastra used binary patterns for Sanskrit prosody.',
      modernResonance: 'Basis of all digital computing and information theory.',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    },
    {
      id: 20,
      title: 'Karma & Ethics',
      category: 'Philosophy',
      ancientInsight: 'Law of cause and effect governing actions and consequences.',
      modernResonance: 'Influences ethics, behavioral psychology, and decision theory.',
      image: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=800',
    },
  ];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'discoveries') {
        await loadFavoriteDiscoveries();
      } else {
        await loadSavedConversations();
      }
    } catch (error) {
      console.error('Error loading saved items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteDiscoveries = async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem('favoriteDiscoveries');
      const favoriteIds = favoritesJson ? JSON.parse(favoritesJson) : [];
      const favorited = discoveries.filter(d => favoriteIds.includes(d.id));
      setFavoriteDiscoveries(favorited);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadSavedConversations = async () => {
    try {
      const currentUser = auth().currentUser;
      let conversations = [];

      if (currentUser) {
        // Load from Firestore for authenticated users
        const result = await getUserConversations(50);
        conversations = result.conversations || [];
      } else {
        // Load from local storage for guests
        const result = await getLocalConversations(50, 0);
        conversations = result.conversations || [];
      }

      // Filter for conversations with saved flag (you can add this feature later)
      // For now, show all recent conversations
      setSavedConversations(conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setSavedConversations([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const removeFavorite = async (discoveryId) => {
    try {
      const favoritesJson = await AsyncStorage.getItem('favoriteDiscoveries');
      const favoriteIds = favoritesJson ? JSON.parse(favoritesJson) : [];
      const updated = favoriteIds.filter(id => id !== discoveryId);
      await AsyncStorage.setItem('favoriteDiscoveries', JSON.stringify(updated));
      await loadFavoriteDiscoveries();
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const renderDiscoveryCard = (discovery) => (
    <TouchableOpacity
      key={discovery.id}
      style={[styles.discoveryCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('DiscoveryDetail', { discovery })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: discovery.image }} style={styles.discoveryImage} />
      <View style={styles.discoveryContent}>
        <View style={styles.discoveryHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{discovery.category}</Text>
          </View>
          <TouchableOpacity
            onPress={() => removeFavorite(discovery.id)}
            style={styles.favoriteButton}
          >
            <Icon name="heart" size={20} color="#FF6B6B" fill="#FF6B6B" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.discoveryTitle, { color: colors.text }]}>
          {discovery.title}
        </Text>
        <Text
          style={[styles.discoveryInsight, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {discovery.ancientInsight}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderConversationCard = (conversation, index) => (
    <TouchableOpacity
      key={conversation.id || index}
      style={[styles.conversationCard, { backgroundColor: colors.card }]}
      onPress={() => {
        // Navigate to output with conversation data
        navigation.navigate('Output', {
          result: conversation.response,
          query: conversation.query,
        });
      }}
      activeOpacity={0.8}
    >
      <View style={styles.conversationHeader}>
        <View style={[styles.typeIcon, { backgroundColor: conversation.type === 'text' ? '#3B82F6' : '#10B981' }]}>
          <Icon name={conversation.type === 'text' ? 'type' : 'image'} size={16} color="#fff" />
        </View>
        <Text style={[styles.conversationDate, { color: colors.textSecondary }]}>
          {formatDate(conversation.timestamp || conversation.createdAt)}
        </Text>
      </View>
      <Text
        style={[styles.conversationQuery, { color: colors.text }]}
        numberOfLines={2}
      >
        {conversation.query}
      </Text>
      {conversation.response && (
        <Text
          style={[styles.conversationPreview, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {typeof conversation.response === 'string' 
            ? conversation.response.substring(0, 100)
            : conversation.response.ancientInsight?.substring(0, 100) || 'View response'}
        </Text>
      )}
    </TouchableOpacity>
  );

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    let date;
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return 'Recently';
    }

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon
        name={activeTab === 'discoveries' ? 'heart' : 'bookmark'}
        size={64}
        color={colors.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {activeTab === 'discoveries' ? 'No Saved Discoveries' : 'No Saved Conversations'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {activeTab === 'discoveries'
          ? 'Explore ancient wisdom and save your favorites'
          : 'Your conversation history will appear here'}
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={() =>
          navigation.navigate(activeTab === 'discoveries' ? 'Explore' : 'Home')
        }
      >
        <Text style={styles.emptyButtonText}>
          {activeTab === 'discoveries' ? 'Explore Now' : 'Start Conversation'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBarThemed />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Saved</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <ProfileIcon size={36} />
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'discoveries' && [
              styles.tabActive,
              { borderBottomColor: colors.primary },
            ],
          ]}
          onPress={() => setActiveTab('discoveries')}
        >
          <Icon
            name="compass"
            size={20}
            color={activeTab === 'discoveries' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'discoveries' ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            Discoveries
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'conversations' && [
              styles.tabActive,
              { borderBottomColor: colors.primary },
            ],
          ]}
          onPress={() => setActiveTab('conversations')}
        >
          <Icon
            name="message-circle"
            size={20}
            color={
              activeTab === 'conversations' ? colors.primary : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'conversations'
                    ? colors.primary
                    : colors.textSecondary,
              },
            ]}
          >
            Conversations
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {activeTab === 'discoveries' ? (
          favoriteDiscoveries.length > 0 ? (
            favoriteDiscoveries.map(renderDiscoveryCard)
          ) : (
            renderEmptyState()
          )
        ) : savedConversations.length > 0 ? (
          savedConversations.map(renderConversationCard)
        ) : (
          renderEmptyState()
        )}
      </ScrollView>

      <FooterNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    elevation: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  discoveryCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  discoveryImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  discoveryContent: {
    padding: 16,
  },
  discoveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 4,
  },
  discoveryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  discoveryInsight: {
    fontSize: 14,
    lineHeight: 20,
  },
  conversationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  typeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationDate: {
    fontSize: 12,
  },
  conversationQuery: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  conversationPreview: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  emptyButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Saved;
