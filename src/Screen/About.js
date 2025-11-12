import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import FooterNavigation from '../components/FooterNavigation';

const { width } = Dimensions.get('window');

const About = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Stagger animations on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const features = [
    {
      icon: 'zap',
      title: 'Lightning Fast',
      description: 'Powered by Google\'s Gemini AI for instant, accurate responses',
      color: '#F59E0B',
    },
    {
      icon: 'book-open',
      title: 'Ancient Wisdom',
      description: 'Learn authentic Vedic mathematics techniques and sutras',
      color: '#8B5CF6',
    },
    {
      icon: 'image',
      title: 'Image Recognition',
      description: 'Upload photos of formulas and get detailed explanations',
      color: '#3B82F6',
    },
    {
      icon: 'moon',
      title: 'Dark Mode',
      description: 'Comfortable learning experience in any lighting condition',
      color: '#6366F1',
    },
  ];

  const stats = [
    { number: '12+', label: 'Vedic Sutras' },
    { number: '1000+', label: 'Questions Answered' },
    { number: '24/7', label: 'Available' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Back Button */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>About VedAI</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={isDarkMode ? ['#1F2937', '#111827'] : ['#FFF8E7', '#FFE4B5']}
            style={styles.heroGradient}
          >
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#FFD700', '#FF9500']}
                style={styles.logoGradient}
              >
                <MaterialIcons name="calculate" size={48} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={[styles.heroTitle, { color: colors.text }]}>VedAI</Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              Your AI-Powered Vedic Mathematics Companion
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Mission Statement */}
        <Animated.View 
          style={[
            styles.section,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Icon name="target" size={24} color="#FF9500" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Mission</Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            VedAI bridges ancient Vedic mathematical wisdom with cutting-edge AI technology. 
            We make powerful mental calculation techniques accessible to everyone, helping students 
            and enthusiasts master mathematics through time-tested methods.
          </Text>
        </Animated.View>

        {/* Stats */}
        <Animated.View 
          style={[
            styles.statsContainer,
            { opacity: fadeAnim }
          ]}
        >
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Text style={styles.statNumber}>{stat.number}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Features */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="star" size={24} color="#FF9500" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Features</Text>
          </View>
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              feature={feature}
              index={index}
              colors={colors}
              isDarkMode={isDarkMode}
            />
          ))}
        </View>

        {/* Technology Stack */}
        <Animated.View 
          style={[
            styles.section,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Icon name="code" size={24} color="#FF9500" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Built With</Text>
          </View>
          <View style={[styles.techStack, { backgroundColor: colors.surface }]}>
            <TechItem icon="smartphone" text="React Native" colors={colors} />
            <TechItem icon="cpu" text="Google Gemini AI" colors={colors} />
            <TechItem icon="database" text="Firebase" colors={colors} />
            <TechItem icon="zap" text="Cloud Functions" colors={colors} />
          </View>
        </Animated.View>

        {/* How It Works */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="help-circle" size={24} color="#FF9500" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>How It Works</Text>
          </View>
          <StepCard 
            step={1} 
            title="Ask a Question" 
            description="Type or upload an image of a mathematical problem"
            colors={colors}
          />
          <StepCard 
            step={2} 
            title="AI Analysis" 
            description="Gemini AI analyzes using Vedic mathematics principles"
            colors={colors}
          />
          <StepCard 
            step={3} 
            title="Learn & Practice" 
            description="Get detailed explanations with Sanskrit terms and formulas"
            colors={colors}
          />
        </View>

        {/* Contact/Support */}
        <Animated.View 
          style={[
            styles.section,
            { opacity: fadeAnim }
          ]}
        >
          <View style={[styles.contactCard, { backgroundColor: colors.surface }]}>
            <LinearGradient
              colors={['#FFD700', '#FF9500']}
              style={styles.contactGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="mail" size={32} color="#fff" />
              <Text style={styles.contactTitle}>Need Help?</Text>
              <Text style={styles.contactSubtitle}>We're here to assist you</Text>
              <TouchableOpacity style={styles.contactButton}>
                <Text style={styles.contactButtonText}>Contact Support</Text>
                <Icon name="arrow-right" size={16} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Version Info */}
        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            VedAI Version 1.0.0
          </Text>
          <Text style={[styles.copyrightText, { color: colors.textSecondary }]}>
            © 2024 VedAI. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <FooterNavigation />
    </SafeAreaView>
  );
};

// Feature Card Component
const FeatureCard = ({ feature, index, colors, isDarkMode }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 600,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.featureCard,
        { 
          backgroundColor: colors.surface,
          opacity: animValue,
          transform: [{
            translateX: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        },
      ]}
    >
      <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '20' }]}>
        <Icon name={feature.icon} size={28} color={feature.color} />
      </View>
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
        <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
          {feature.description}
        </Text>
      </View>
    </Animated.View>
  );
};

// Tech Item Component
const TechItem = ({ icon, text, colors }) => (
  <View style={styles.techItem}>
    <Icon name={icon} size={18} color="#FF9500" />
    <Text style={[styles.techText, { color: colors.textSecondary }]}>{text}</Text>
  </View>
);

// Step Card Component
const StepCard = ({ step, title, description, colors }) => (
  <View style={[styles.stepCard, { backgroundColor: colors.surface }]}>
    <View style={styles.stepNumber}>
      <LinearGradient
        colors={['#FFD700', '#FF9500']}
        style={styles.stepNumberGradient}
      >
        <Text style={styles.stepNumberText}>{step}</Text>
      </LinearGradient>
    </View>
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  </View>
);

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
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Hero Section
  heroSection: {
    marginBottom: 24,
  },
  heroGradient: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 1,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Section
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF9500',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Features
  featureCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Tech Stack
  techStack: {
    padding: 20,
    borderRadius: 16,
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  techText: {
    fontSize: 15,
    fontWeight: '600',
  },
  // Steps
  stepCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  stepNumber: {
    marginRight: 16,
  },
  stepNumberGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Contact
  contactCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  contactGradient: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 24,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  copyrightText: {
    fontSize: 12,
  },
});

export default About;
