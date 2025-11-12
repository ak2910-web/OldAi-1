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

const HowItWorks = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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
    ]).start();
  }, []);
  
  const steps = [
    {
      number: '1',
      title: 'Choose Your Input Method',
      description: 'Select either text or image input based on your question',
      icon: 'edit-3',
      color: '#FF9500',
      details: [
        'Text Input: Type your mathematical question directly',
        'Image Input: Upload or capture a photo of a formula',
        'Both methods powered by AI for accuracy',
      ],
    },
    {
      number: '2',
      title: 'Ask Your Question',
      description: 'Formulate your Vedic mathematics question clearly',
      icon: 'message-circle',
      color: '#3B82F6',
      details: [
        'Be specific about the operation or sutra',
        'Include numbers for calculation examples',
        'Ask about concepts, methods, or formulas',
      ],
    },
    {
      number: '3',
      title: 'AI Analysis & Processing',
      description: 'Gemini AI analyzes using Vedic mathematics principles',
      icon: 'cpu',
      color: '#8B5CF6',
      details: [
        'Google Gemini 2.0 Flash processes your query',
        'Applies Vedic mathematics knowledge base',
        'Generates structured explanations',
      ],
    },
    {
      number: '4',
      title: 'Get Detailed Explanation',
      description: 'Receive comprehensive answer with Sanskrit terms',
      icon: 'book-open',
      color: '#10B981',
      details: [
        'Sanskrit term with transliteration',
        'Step-by-step explanation',
        'Mathematical formulas and methods',
        'Modern equivalent comparisons',
      ],
    },
    {
      number: '5',
      title: 'Learn & Practice',
      description: 'Study the method and try similar problems',
      icon: 'trending-up',
      color: '#EC4899',
      details: [
        'Save explanations for later reference',
        'Practice with similar examples',
        'Build your Vedic math skills',
      ],
    },
  ];

  const features = [
    {
      icon: 'camera',
      title: 'Image Recognition',
      description: 'Upload photos of handwritten or printed formulas for instant analysis',
    },
    {
      icon: 'type',
      title: 'Text Input',
      description: 'Type your questions naturally and get accurate Vedic solutions',
    },
    {
      icon: 'bookmark',
      title: 'Save History',
      description: 'Keep track of your learning journey with conversation history',
    },
    {
      icon: 'globe',
      title: 'Multilingual',
      description: 'Sanskrit terms with English transliterations for easy understanding',
    },
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>How It Works</Text>
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
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={isDarkMode ? ['#1F2937', '#111827'] : ['#FFF8E7', '#FFE4B5']}
            style={styles.heroGradient}
          >
            <View style={styles.heroIconContainer}>
              <LinearGradient
                colors={['#FFD700', '#FF9500']}
                style={styles.heroIconGradient}
              >
                <MaterialIcons name="lightbulb" size={40} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={[styles.heroTitle, { color: colors.text }]}>
              Master Vedic Mathematics
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              Learn ancient calculation techniques with modern AI assistance
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Introduction */}
        <Animated.View 
          style={[
            styles.section,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Icon name="info" size={24} color="#FF9500" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Getting Started</Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            VedAI makes learning Vedic mathematics simple and interactive. Follow these 
            steps to unlock the power of ancient Indian mathematical techniques.
          </Text>
        </Animated.View>

        {/* Step-by-Step Process */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="list" size={24} color="#FF9500" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Step-by-Step Process</Text>
          </View>
          {steps.map((step, index) => (
            <StepCard 
              key={index}
              step={step}
              index={index}
              colors={colors}
              isDarkMode={isDarkMode}
            />
          ))}
        </View>

        {/* Key Features */}
        <Animated.View 
          style={[
            styles.section,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Icon name="star" size={24} color="#FF9500" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Features</Text>
          </View>
          <View style={styles.featuresGrid}>
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
        </Animated.View>

        {/* Tips Section */}
        <Animated.View 
          style={[
            styles.section,
            { opacity: fadeAnim }
          ]}
        >
          <View style={[styles.tipsCard, { backgroundColor: colors.surface }]}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.tipsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="check-circle" size={32} color="#fff" />
              <Text style={styles.tipsTitle}>Pro Tips</Text>
              <View style={styles.tipsList}>
                <TipItem text="Be specific about the Vedic sutra or method" />
                <TipItem text="Include example numbers for calculations" />
                <TipItem text="Use clear, well-lit images for best results" />
                <TipItem text="Save important explanations for later review" />
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Call to Action */}
        <Animated.View 
          style={[
            styles.section,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#FFD700', '#FF9500']}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="rocket-launch" size={48} color="#fff" />
              <Text style={styles.ctaTitle}>Ready to Start Learning?</Text>
              <Text style={styles.ctaSubtitle}>
                Ask your first Vedic mathematics question now
              </Text>
              <View style={styles.ctaButton}>
                <Text style={styles.ctaButtonText}>Get Started</Text>
                <Icon name="arrow-right" size={18} color="#FF9500" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Footer Navigation */}
      <FooterNavigation />
    </SafeAreaView>
  );
};

// Step Card Component
const StepCard = ({ step, index, colors, isDarkMode }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 600,
      delay: index * 150,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.stepCard,
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
      <View style={styles.stepHeader}>
        <View style={[styles.stepNumberContainer, { backgroundColor: step.color + '20' }]}>
          <LinearGradient
            colors={[step.color, step.color + 'CC']}
            style={styles.stepNumberGradient}
          >
            <Text style={styles.stepNumber}>{step.number}</Text>
          </LinearGradient>
        </View>
        <View style={styles.stepHeaderText}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
          <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
            {step.description}
          </Text>
        </View>
        <View style={[styles.stepIcon, { backgroundColor: step.color + '15' }]}>
          <Icon name={step.icon} size={24} color={step.color} />
        </View>
      </View>
      <View style={styles.stepDetails}>
        {step.details.map((detail, idx) => (
          <View key={idx} style={styles.detailItem}>
            <Icon name="chevron-right" size={16} color={step.color} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{detail}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
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
            scale: animValue,
          }],
        },
      ]}
    >
      <View style={styles.featureIconContainer}>
        <Icon name={feature.icon} size={28} color="#FF9500" />
      </View>
      <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
      <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
        {feature.description}
      </Text>
    </Animated.View>
  );
};

// Tip Item Component
const TipItem = ({ text }) => (
  <View style={styles.tipItem}>
    <Icon name="check" size={16} color="#fff" />
    <Text style={styles.tipText}>{text}</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Hero Section
  heroSection: {
    marginBottom: 24,
  },
  heroGradient: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroIconContainer: {
    marginBottom: 20,
  },
  heroIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Section Styles
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
  },

  // Step Card Styles
  stepCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumberContainer: {
    borderRadius: 28,
    padding: 3,
    marginRight: 12,
  },
  stepNumberGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepHeaderText: {
    flex: 1,
    marginRight: 12,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDetails: {
    marginTop: 12,
    paddingLeft: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },

  // Feature Grid
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Tips Card
  tipsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  tipsGradient: {
    padding: 24,
    alignItems: 'center',
  },
  tipsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 16,
  },
  tipsList: {
    width: '100%',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 15,
    color: '#fff',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },

  // CTA Card
  ctaCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  ctaGradient: {
    padding: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.9,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9500',
    marginRight: 8,
  },
});

export default HowItWorks;
