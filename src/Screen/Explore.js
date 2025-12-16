import React, { useRef, useState } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import FooterNavigation from '../components/FooterNavigation';
import ProfileIcon from '../components/ProfileIcon';
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
];

const Explore = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Mathematics', 'Science', 'Medicine', 'Astronomy', 'Wellness'];

  // Filter discoveries based on search and category
  const filteredDiscoveries = discoveries.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.ancientInsight.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.modernResonance.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
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
    // Navigate to detail page
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
                resizeMode="contain" 
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
            {/* Category Tag */}
            <View style={[styles.categoryTag, { backgroundColor: item.categoryColor + '20' }]}>
              <Text style={[styles.categoryText, { color: item.categoryColor }]}>
                {item.category}
              </Text>
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

            {/* Know More Button */}
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
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
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
  knowMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 6,
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
