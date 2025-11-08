import React, { useRef } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import FooterNavigation from '../components/FooterNavigation';

const { width } = Dimensions.get('window');

// Sample data - replace with backend API later
const discoveries = [
  {
    id: 1,
    title: 'Concept of Zero – Shunya',
    category: 'Mathematics',
    categoryColor: '#FF9500',
    icon: 'circle',
    image: require('./zero.png'),
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
    ancientInsight: 'Indian mathematicians developed the decimal system and place-value notation, revolutionizing numerical calculations.',
    modernResonance: 'The decimal system is the global standard for mathematics, science, and commerce.',
    gradient: ['#FFF8E7', '#FFE4B5'],
  },
];

const Explore = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Hero section fade animation
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 100, 150],
    outputRange: [1, 0.5, 0],
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
      outputRange: [1, 1, 1, 0.95],
    });

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.7],
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
            {item.image ? (
              <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name={item.icon} size={48} color={item.categoryColor} opacity={0.5} />
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
              <Text style={[styles.sectionText, { color: colors.textSecondary }]} numberOfLines={2}>
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
              <Text style={[styles.sectionText, { color: colors.textSecondary }]} numberOfLines={2}>
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
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => console.log('Search')}
          activeOpacity={0.7}
        >
          <Icon name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

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
              From Vedic Discoveries to Modern Innovations
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              Explore the profound connections between ancient wisdom and contemporary science
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Discovery Cards */}
        {discoveries.map((item, index) => (
          <DiscoveryCard key={item.id} item={item} index={index} />
        ))}

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
