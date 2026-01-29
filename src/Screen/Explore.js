import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  TextInput,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import FooterNavigation from '../components/FooterNavigation';
import StatusBarThemed from '../components/StatusBarThemed';
import ProfileIcon from '../components/ProfileIcon';
import QuizModal from '../components/QuizModal';
import auth from '@react-native-firebase/auth';

const { width } = Dimensions.get('window');

// Sample data - replace with backend API later
const discoveries = [
  {
    id: 1,
    title: 'Concept of Zero – Shunya',
    category: 'Mathematics',
    categoryColor: '#FF9500',
    icon: 'circle',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80',
    ancientInsight: 'Ancient Indian mathematicians introduced the concept of zero, a revolutionary idea that transformed mathematics and paved the way for modern computing.',
    modernResonance: 'Zero is the foundation of binary code, computer science, and digital technology.',
    gradient: ['#FFF8E7', '#FFE4B5'],
  },
  {
    id: 2,
    title: 'Atomic Theory – Anu',
    category: 'Science',
    categoryColor: '#3B82F6',
    icon: 'cpu',
    imageUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=80',
    ancientInsight: "The Vedic texts described the concept of 'Anu,' the smallest indivisible particle of matter, remarkably similar to the modern atomic theory.",
    modernResonance: 'Modern physics confirms atoms as the building blocks of all matter.',
    gradient: ['#E0F2FE', '#DBEAFE'],
  },
  {
    id: 3,
    title: 'Ayurveda – Holistic Healing',
    category: 'Medicine',
    categoryColor: '#10B981',
    icon: 'heart',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
    ancientInsight: 'Ayurveda, an ancient Indian system of medicine, emphasizes holistic healing, focusing on the balance of mind, body, and spirit, influencing modern integrative medicine.',
    modernResonance: 'Modern medicine increasingly adopts holistic and preventive care approaches.',
    gradient: ['#F0FDF4', '#DCFCE7'],
  },
  {
    id: 4,
    title: 'Cosmic Cycles – Yugas',
    category: 'Astronomy',
    categoryColor: '#8B5CF6',
    icon: 'moon',
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80',
    ancientInsight: 'Vedic astronomy described cosmic cycles and the movement of celestial bodies with remarkable accuracy, influencing our understanding of the universe.',
    modernResonance: 'Modern cosmology confirms cyclical patterns in the universe.',
    gradient: ['#F5F3FF', '#EDE9FE'],
  },
  {
    id: 5,
    title: 'Yoga – Mind-Body Connection',
    category: 'Wellness',
    categoryColor: '#EC4899',
    icon: 'activity',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
    ancientInsight: 'Ancient yogic practices unified physical, mental, and spiritual health through systematic exercises and meditation.',
    modernResonance: 'Yoga is now a globally recognized practice for mental health, stress relief, and physical fitness.',
    gradient: ['#FDF2F8', '#FCE7F3'],
  },
  {
    id: 6,
    title: 'Decimal System – Place Value',
    category: 'Mathematics',
    categoryColor: '#FF9500',
    icon: 'hash',
    imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80',
    ancientInsight: 'Indian mathematicians developed the decimal system and place-value notation, revolutionizing numerical calculations.',
    modernResonance: 'The decimal system is the global standard for mathematics, science, and commerce.',
    gradient: ['#FFF8E7', '#FFE4B5'],
  },
  {
    id: 7,
    title: 'Yoga Sutras – Patanjali',
    category: 'Philosophy',
    categoryColor: '#F43F5E',
    icon: 'book-open',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
    ancientInsight: "Patanjali's Yoga Sutras outline the eight limbs of yoga, providing a comprehensive framework for spiritual development and self-realization.",
    modernResonance: 'Modern psychology validates meditation practices from the Yoga Sutras, showing benefits for mental health and cognitive function.',
    gradient: ['#FDF2F8', '#FCE7F3'],
  },
  {
    id: 8,
    title: 'Vastu Shastra – Sacred Architecture',
    category: 'Architecture',
    categoryColor: '#14B8A6',
    icon: 'home',
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80',
    ancientInsight: 'Vastu Shastra harmonizes buildings with natural forces and cosmic energies, optimizing space for well-being.',
    modernResonance: 'Modern sustainable architecture incorporates Vastu principles like natural lighting, ventilation, and orientation.',
    gradient: ['#F0FDFA', '#CCFBF1'],
  },
  {
    id: 9,
    title: 'Sanskrit Epics – Mahabharata',
    category: 'Literature',
    categoryColor: '#A855F7',
    icon: 'feather',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80',
    ancientInsight: 'The Mahabharata contains profound philosophical teachings including the Bhagavad Gita, exploring dharma, ethics, and human nature.',
    modernResonance: 'These ancient texts inspire modern literature, cinema, and philosophy with timeless insights into human nature.',
    gradient: ['#FAF5FF', '#F3E8FF'],
  },
  {
    id: 10,
    title: "Panini's Grammar – Ashtadhyayi",
    category: 'Grammar',
    categoryColor: '#06B6D4',
    icon: 'type',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80',
    ancientInsight: "Panini's Ashtadhyayi is the world's first formal grammar system with 3,959 rules describing Sanskrit with mathematical precision.",
    modernResonance: "Panini's methodology influenced modern linguistics and computer science, inspiring formal language theory.",
    gradient: ['#ECFEFF', '#CFFAFE'],
  },
  {
    id: 11,
    title: 'Nyaya Logic – Reasoning',
    category: 'Logic',
    categoryColor: '#EF4444',
    icon: 'cpu',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
    ancientInsight: 'Nyaya school developed sophisticated systems of logic and epistemology, establishing rigorous methods for valid reasoning.',
    modernResonance: 'Nyaya logic shares similarities with modern formal logic and analytical philosophy.',
    gradient: ['#FEF2F2', '#FEE2E2'],
  },
  {
    id: 12,
    title: 'Plastic Surgery – Sushruta',
    category: 'Medicine',
    categoryColor: '#10B981',
    icon: 'scissors',
    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&q=80',
    ancientInsight: 'Sushruta Samhita describes over 300 surgical procedures including rhinoplasty and skin grafting techniques.',
    modernResonance: 'Sushruta is considered the father of plastic surgery, with techniques forming modern reconstructive surgery foundations.',
    gradient: ['#F0FDF4', '#DCFCE7'],
  },
  {
    id: 13,
    title: 'Fibonacci Sequence – Pingala',
    category: 'Mathematics',
    categoryColor: '#FF9500',
    icon: 'trending-up',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80',
    ancientInsight: 'Pingala described the Fibonacci sequence in prosody studies centuries before Fibonacci, exploring binary patterns.',
    modernResonance: 'The sequence appears throughout nature and is used in algorithms, financial modeling, and pattern recognition.',
    gradient: ['#FFF8E7', '#FFE4B5'],
  },
  {
    id: 14,
    title: 'Heliocentric Model – Aryabhata',
    category: 'Astronomy',
    categoryColor: '#8B5CF6',
    icon: 'sun',
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&q=80',
    ancientInsight: 'Aryabhata proposed that Earth rotates on its axis and orbits the Sun, calculating planetary positions with accuracy.',
    modernResonance: "Aryabhata's calculations predated Copernicus by over 1000 years with remarkable precision.",
    gradient: ['#F5F3FF', '#EDE9FE'],
  },
  {
    id: 15,
    title: 'Meditation & Mindfulness',
    category: 'Wellness',
    categoryColor: '#EC4899',
    icon: 'sunrise',
    imageUrl: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400&q=80',
    ancientInsight: 'Ancient meditation practices emphasize mindfulness and inner stillness to achieve mental clarity and spiritual growth.',
    modernResonance: 'Neuroscience confirms meditation benefits: reduced stress, improved focus, and neuroplasticity enhancement.',
    gradient: ['#FDF2F8', '#FCE7F3'],
  },
  {
    id: 16,
    title: 'Advaita Vedanta – Non-Duality',
    category: 'Philosophy',
    categoryColor: '#F43F5E',
    icon: 'circle',
    imageUrl: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=400&q=80',
    ancientInsight: 'Advaita Vedanta teaches non-duality - individual consciousness is not separate from universal consciousness.',
    modernResonance: 'Quantum physics explores similar concepts of interconnectedness and the observer-observed relationship.',
    gradient: ['#FDF2F8', '#FCE7F3'],
  },
  {
    id: 17,
    title: 'Gravitational Force – Bhaskaracharya',
    category: 'Science',
    categoryColor: '#3B82F6',
    icon: 'disc',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
    ancientInsight: 'Bhaskaracharya described gravitational attraction in the 12th century, stating objects fall due to inherent attraction.',
    modernResonance: "This predates Newton's law of gravitation by 500 years, showing advanced understanding of physics.",
    gradient: ['#E0F2FE', '#DBEAFE'],
  },
  {
    id: 18,
    title: 'Rasayana – Rejuvenation Science',
    category: 'Medicine',
    categoryColor: '#10B981',
    icon: 'zap',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&q=80',
    ancientInsight: 'Rasayana therapy focuses on rejuvenation and longevity through herbs and practices that enhance vitality.',
    modernResonance: 'Modern anti-aging research validates many Rasayana herbs, exploring telomeres and cellular regeneration.',
    gradient: ['#F0FDF4', '#DCFCE7'],
  },
  {
    id: 19,
    title: 'Binary System – Pingala',
    category: 'Mathematics',
    categoryColor: '#FF9500',
    icon: 'code',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
    ancientInsight: 'Pingala developed a binary system for Sanskrit prosody using light and heavy syllables as 0 and 1.',
    modernResonance: 'Binary code is the foundation of all digital computing, from smartphones to AI systems.',
    gradient: ['#FFF8E7', '#FFE4B5'],
  },
  {
    id: 20,
    title: 'Karma & Causality',
    category: 'Philosophy',
    categoryColor: '#F43F5E',
    icon: 'refresh-cw',
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&q=80',
    ancientInsight: 'The law of karma describes cause and effect - every action has consequences that shape future experiences.',
    modernResonance: 'Modern psychology recognizes behavioral patterns and consequences, while quantum physics explores causality.',
    gradient: ['#FDF2F8', '#FCE7F3'],
  },
];

const Explore = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState([]);
  const [viewedDiscoveries, setViewedDiscoveries] = useState([]);
  const [quizModalVisible, setQuizModalVisible] = useState(false);
  const [selectedQuizDiscovery, setSelectedQuizDiscovery] = useState(null);

  const categories = ['All', 'Favorites', 'Mathematics', 'Science', 'Medicine', 'Astronomy', 'Wellness', 'Philosophy', 'Architecture', 'Literature', 'Grammar', 'Logic'];

  // Load favorites from AsyncStorage
  useEffect(() => {
    loadFavorites();
    loadViewedDiscoveries();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('discoveryFavorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadViewedDiscoveries = async () => {
    try {
      const storedViews = await AsyncStorage.getItem('viewedDiscoveries');
      if (storedViews) {
        setViewedDiscoveries(JSON.parse(storedViews));
      }
    } catch (error) {
      console.error('Error loading viewed discoveries:', error);
    }
  };

  const trackView = async (discoveryId) => {
    try {
      const newViews = [...new Set([...viewedDiscoveries, discoveryId])];
      setViewedDiscoveries(newViews);
      await AsyncStorage.setItem('viewedDiscoveries', JSON.stringify(newViews));
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const toggleFavorite = async (discoveryId) => {
    try {
      let newFavorites;
      if (favorites.includes(discoveryId)) {
        newFavorites = favorites.filter(id => id !== discoveryId);
      } else {
        newFavorites = [...favorites, discoveryId];
      }
      setFavorites(newFavorites);
      await AsyncStorage.setItem('discoveryFavorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorite:', error);
    }
  };

  const handleShare = async (discovery) => {
    try {
      const message = `${discovery.title}\n\n📚 Ancient Insight:\n${discovery.ancientInsight}\n\n⚡ Modern Resonance:\n${discovery.modernResonance}\n\nDiscover more ancient wisdom with Ataravanavira!`;
      
      await Share.share({
        message: message,
        title: discovery.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleQuiz = (discovery) => {
    setSelectedQuizDiscovery(discovery);
    setQuizModalVisible(true);
  };

  // Get recommended discoveries based on favorites and views
  const getRecommendedDiscoveries = () => {
    if (favorites.length === 0 && viewedDiscoveries.length === 0) return [];
    
    // Count category preferences from favorites and views
    const categoryCount = {};
    [...favorites, ...viewedDiscoveries].forEach(id => {
      const item = discoveries.find(d => d.id === id);
      if (item) {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      }
    });

    // Get top 2 preferred categories
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([category]) => category);

    // Get unseen discoveries from preferred categories
    const unseenDiscoveries = discoveries.filter(
      d => topCategories.includes(d.category) && 
           !viewedDiscoveries.includes(d.id) && 
           !favorites.includes(d.id)
    );

    return unseenDiscoveries.slice(0, 3);
  };

  const recommendedDiscoveries = getRecommendedDiscoveries();

  // Filter discoveries based on search and category
  const filteredDiscoveries = discoveries.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.ancientInsight.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.modernResonance.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                           (selectedCategory === 'Favorites' && favorites.includes(item.id)) ||
                           item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Hero section fade animation
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 100, 150, 300],
    outputRange: [1, 0.7, 0.4, 0.2],
    extrapolate: 'clamp',
  });

  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const handleKnowMore = (discovery) => {
    trackView(discovery.id);
    navigation.navigate('DiscoveryDetail', { item: discovery });
  };

  const DiscoveryCard = ({ item, index }) => {
    const inputRange = [-1, 0, index * 250, (index + 2) * 250];
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.98], // less aggressive fade/scale
      extrapolate: 'clamp',
    });
    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.85], // less aggressive fade
      extrapolate: 'clamp',
    });
    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <View style={[styles.card, { backgroundColor: colors.surface }]}> 
          {/* Image */}
          <LinearGradient
            colors={isDarkMode ? ['#1F2937', '#374151'] : item.gradient}
            style={styles.imageContainer}
          >
            {item.imageUrl ? (
              <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.cardImage} 
                resizeMode="cover" 
                accessibilityLabel={item.title} 
                onError={e => { console.log('Image failed to load:', item.imageUrl, e.nativeEvent); }}
              />
            ) : (
              <View style={styles.imagePlaceholder}> 
                <Icon name={item.icon} size={48} color={item.categoryColor} style={{ opacity: 0.5 }} />
              </View>
            )}
          </LinearGradient>

          {/* Content */}
          <View style={styles.cardContent}>
            {/* Category Tag and Action Buttons */}
            <View style={styles.cardHeader}>
              <View style={[styles.categoryTag, { backgroundColor: item.categoryColor + '20' }]}>
                <Text style={[styles.categoryText, { color: item.categoryColor }]}>
                  {item.category}
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  onPress={() => handleShare(item)}
                  style={styles.actionButton}
                  activeOpacity={0.7}
                >
                  <Icon 
                    name="share-2" 
                    size={20} 
                    color={colors.textSecondary}
                    style={{ opacity: 0.6 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => toggleFavorite(item.id)}
                  style={styles.actionButton}
                  activeOpacity={0.7}
                >
                  <Icon 
                    name={favorites.includes(item.id) ? 'heart' : 'heart'} 
                    size={20} 
                    color={favorites.includes(item.id) ? '#EF4444' : colors.textSecondary}
                    fill={favorites.includes(item.id) ? '#EF4444' : 'none'}
                    style={{ 
                      opacity: favorites.includes(item.id) ? 1 : 0.6 
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Title */}
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>

            {/* Ancient Insight */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="book" size={14} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                  Ancient Insight
                </Text>
              </View>
              <Text style={[styles.sectionText, { color: colors.textSecondary }]} numberOfLines={3}>
                {item.ancientInsight}
              </Text>
            </View>

            {/* Modern Resonance */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="zap" size={14} color="#3B82F6" />
                <Text style={[styles.sectionTitle, { color: '#3B82F6' }]}>
                  Modern Resonance
                </Text>
              </View>
              <Text style={[styles.sectionText, { color: colors.textSecondary }]} numberOfLines={3}>
                {item.modernResonance}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.cardActionButtons}>
              <TouchableOpacity
                style={[styles.quizButton, { borderColor: item.categoryColor }]}
                onPress={() => handleQuiz(item)}
                activeOpacity={0.8}
              >
                <Icon name="help-circle" size={16} color={item.categoryColor} />
                <Text style={[styles.quizButtonText, { color: item.categoryColor }]}>
                  Test Knowledge
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.knowMoreButton, { backgroundColor: item.categoryColor }]}
                onPress={() => handleKnowMore(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.knowMoreText}>Know More</Text>
                <Icon name="arrow-right" size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Explore</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('History')}
            activeOpacity={0.7}
          >
            <Icon name="clock" size={24} color={colors.text} />
          </TouchableOpacity>
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
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Icon name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search discoveries..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="x" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === category ? colors.primary : colors.surface,
              },
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryChipText,
                {
                  color: selectedCategory === category ? '#fff' : colors.text,
                },
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Discovery Cards with Hero Section inside ScrollView */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section - Inside ScrollView so it scrolls away */}
        <Animated.View
          style={{
            opacity: heroOpacity,
            transform: [{ translateY: heroTranslateY }],
          }}
        >
          <LinearGradient
            colors={isDarkMode ? ['#1F2937', '#111827'] : ['#FFF8E7', '#FFE4B5']}
            style={styles.heroSection}
          >
            <Text style={[styles.heroTitle, { color: isDarkMode ? '#FFD700' : '#D35400' }]}>
              {filteredDiscoveries.length} Discoveries Found
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              {selectedCategory !== 'All' ? `Exploring ${selectedCategory}` : 'Explore the profound connections between ancient wisdom and contemporary science'}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Recommended For You */}
        {recommendedDiscoveries.length > 0 && selectedCategory === 'All' && (
          <View style={styles.recommendedSection}>
            <View style={styles.recommendedHeader}>
              <Icon name="star" size={20} color={colors.primary} />
              <Text style={[styles.recommendedTitle, { color: colors.text }]}>
                Recommended For You
              </Text>
            </View>
            <Text style={[styles.recommendedSubtitle, { color: colors.textSecondary }]}>
              Based on your interests and favorites
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recommendedScroll}
              contentContainerStyle={styles.recommendedContainer}
            >
              {recommendedDiscoveries.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.recommendedCard, { backgroundColor: colors.surface }]}
                  onPress={() => handleKnowMore(item)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={isDarkMode ? ['#1F2937', '#374151'] : item.gradient}
                    style={styles.recommendedImage}
                  >
                    <Icon name={item.icon} size={32} color={item.categoryColor} opacity={0.8} />
                  </LinearGradient>
                  <View style={styles.recommendedContent}>
                    <View style={[styles.miniCategoryTag, { backgroundColor: item.categoryColor + '20' }]}>
                      <Text style={[styles.miniCategoryText, { color: item.categoryColor }]}>
                        {item.category}
                      </Text>
                    </View>
                    <Text style={[styles.recommendedCardTitle, { color: colors.text }]} numberOfLines={2}>
                      {item.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Discovery Cards */}
        {filteredDiscoveries.length > 0 ? (
          filteredDiscoveries.map((item, index) => (
            <DiscoveryCard key={item.id} item={item} index={index} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="search" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No discoveries found</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Icon name="info" size={20} color={colors.textTertiary} />
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            More discoveries coming soon...
          </Text>
        </View>
      </Animated.ScrollView>

      {/* Footer Navigation */}
      <FooterNavigation />

      {/* Quiz Modal */}
      {selectedQuizDiscovery && (
        <QuizModal
          visible={quizModalVisible}
          onClose={() => setQuizModalVisible(false)}
          discoveryId={selectedQuizDiscovery.id}
          discoveryTitle={selectedQuizDiscovery.title}
          categoryColor={selectedQuizDiscovery.categoryColor}
        />
      )}
    </SafeAreaView>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  categoryScroll: {
    marginTop: 12,
    maxHeight: 50,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 28,
    fontFamily: 'System',
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'System',
  },
  recommendedSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  recommendedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'System',
  },
  recommendedSubtitle: {
    fontSize: 13,
    marginBottom: 12,
    fontFamily: 'System',
  },
  recommendedScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  recommendedContainer: {
    paddingRight: 16,
    gap: 12,
  },
  recommendedCard: {
    width: 200,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  recommendedImage: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendedContent: {
    padding: 12,
  },
  miniCategoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  miniCategoryText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'System',
  },
  recommendedCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    fontFamily: 'System',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  cardContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  favoriteButton: {
    padding: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'System',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    lineHeight: 24,
    fontFamily: 'System',
  },
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: 'System',
  },
  sectionText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'System',
  },
  cardActionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  quizButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  quizButtonText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'System',
  },
  knowMoreButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  knowMoreText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
    fontFamily: 'System',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    gap: 8,
    marginHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'System',
  },
});

export default Explore;
