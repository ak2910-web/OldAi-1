import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
  {
    id: '1',
    title: 'Welcome to VedAI',
    description: 'Bridge ancient Vedic wisdom with modern science through AI-powered knowledge mapping',
    emoji: '🕉️',
    gradient: ['#FF6B6B', '#FF8E53'],
    icon: 'auto-awesome',
  },
  {
    id: '2',
    title: 'Ask Any Question',
    description: 'Type mathematical problems, Vedic concepts, or upload images of formulas',
    emoji: '❓',
    gradient: ['#4ECDC4', '#44A08D'],
    icon: 'chat-bubble-outline',
    example: '"How does Nikhilam Sutra work?"',
  },
  {
    id: '3',
    title: 'Vedic-Modern Comparison',
    description: 'See ancient methods and modern equivalents side-by-side with confidence scores',
    emoji: '🔗',
    gradient: ['#A8E6CF', '#56CCF2'],
    icon: 'compare-arrows',
    features: ['✓ Step-by-step solutions', '✓ Cross-domain connections', '✓ Real-world applications'],
  },
  {
    id: '4',
    title: 'Upload Images',
    description: 'Scan handwritten formulas, Sanskrit texts, or math problems for instant analysis',
    emoji: '📸',
    gradient: ['#FFB75E', '#ED8F03'],
    icon: 'camera-alt',
  },
  {
    id: '5',
    title: 'Ready to Explore!',
    description: 'Start your journey into the fascinating world of Vedic mathematics',
    emoji: '🚀',
    gradient: ['#667EEA', '#764BA2'],
    icon: 'explore',
  },
];

const OnboardingSlide = ({ item }) => (
  <View style={styles.slide}>
    <LinearGradient
      colors={item.gradient}
      style={styles.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.slideContent}>
        {/* Emoji/Icon */}
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>

        {/* Title */}
        <Text style={styles.slideTitle}>{item.title}</Text>

        {/* Description */}
        <Text style={styles.slideDescription}>{item.description}</Text>

        {/* Optional Example */}
        {item.example && (
          <View style={styles.exampleBox}>
            <Icon name="lightbulb-outline" size={20} color="#FFF" />
            <Text style={styles.exampleText}>{item.example}</Text>
          </View>
        )}

        {/* Optional Features */}
        {item.features && (
          <View style={styles.featuresList}>
            {item.features.map((feature, index) => (
              <Text key={index} style={styles.featureText}>
                {feature}
              </Text>
            ))}
          </View>
        )}
      </View>
    </LinearGradient>
  </View>
);

const Onboarding = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      // Navigate to main app (Login or Homescreen depending on auth state)
      navigation.replace('Login');
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      navigation.replace('Login');
    }
  };

  const handleScroll = (event) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / width
    );
    setCurrentIndex(slideIndex);
  };

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Skip Button */}
      {!isLastSlide && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={({ item }) => <OnboardingSlide item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomContainer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {ONBOARDING_SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextButtonText}>
              {isLastSlide ? 'Get Started' : 'Next'}
            </Text>
            <Icon
              name={isLastSlide ? 'check' : 'arrow-forward'}
              size={24}
              color="#FFF"
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  slide: {
    width: width,
    height: height,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    opacity: 0.9,
  },
  exampleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
    gap: 8,
  },
  exampleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontStyle: 'italic',
  },
  featuresList: {
    marginTop: 32,
    gap: 12,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 28,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 30,
  },
  dotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  nextButton: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Onboarding;
