import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const LotusIcon = () => (
  <View style={styles.lotusContainer}>
    <View style={styles.lotus}>
      {/* Petals */}
      <View style={[styles.petal, styles.petal1]} />
      <View style={[styles.petal, styles.petal2]} />
      <View style={[styles.petal, styles.petal3]} />
      <View style={[styles.petal, styles.petal4]} />
      <View style={[styles.petal, styles.petal5]} />
      <View style={[styles.petal, styles.petal6]} />
      <View style={[styles.petal, styles.petal7]} />
      <View style={[styles.petal, styles.petal8]} />
      {/* Center */}
      <View style={styles.center} />
    </View>
  </View>
);

const Splash = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      navigation.navigate('Login');
    }, 3000);

    return () => clearTimeout(timer);
    // navigation is stable from react-navigation, include it to satisfy exhaustive-deps
    // fadeAnim and scaleAnim are refs and don't need to be included
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  // Lotus/Flower Icon Component
  const LotusIcon = () => (
    <View style={styles.lotusContainer}>
      <View style={styles.lotus}>
        {/* Petals */}
        <View style={[styles.petal, styles.petal1]} />
        <View style={[styles.petal, styles.petal2]} />
        <View style={[styles.petal, styles.petal3]} />
        <View style={[styles.petal, styles.petal4]} />
        <View style={[styles.petal, styles.petal5]} />
        <View style={[styles.petal, styles.petal6]} />
        <View style={[styles.petal, styles.petal7]} />
        <View style={[styles.petal, styles.petal8]} />
        {/* Center */}
        <View style={styles.center} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F5E6D3" barStyle="dark-content" />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo */}
        <LotusIcon />
        
        {/* Brand Name */}
        <Text style={styles.brandName}>VedAI</Text>
        
        {/* Tagline */}
        <Text style={styles.tagline}>
          Where Ancient Knowledge{'\n'}Resonates with Modern Intelligence.
        </Text>
      </Animated.View>
      
      {/* Bottom Indicator */}
      <View style={styles.bottomIndicator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E6D3', // Cream/beige background
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lotusContainer: {
    marginBottom: 40,
  },
  lotus: {
    width: 80,
    height: 80,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petal: {
    position: 'absolute',
    width: 20,
    height: 35,
    backgroundColor: '#D4AF37', // Golden color
    borderRadius: 10,
    opacity: 0.8,
  },
  petal1: {
    top: 0,
    left: 30,
    transform: [{ rotate: '0deg' }],
  },
  petal2: {
    top: 5,
    right: 10,
    transform: [{ rotate: '45deg' }],
  },
  petal3: {
    top: 22,
    right: 0,
    transform: [{ rotate: '90deg' }],
  },
  petal4: {
    bottom: 5,
    right: 10,
    transform: [{ rotate: '135deg' }],
  },
  petal5: {
    bottom: 0,
    left: 30,
    transform: [{ rotate: '180deg' }],
  },
  petal6: {
    bottom: 5,
    left: 10,
    transform: [{ rotate: '225deg' }],
  },
  petal7: {
    top: 22,
    left: 0,
    transform: [{ rotate: '270deg' }],
  },
  petal8: {
    top: 5,
    left: 10,
    transform: [{ rotate: '315deg' }],
  },
  center: {
    width: 15,
    height: 15,
    backgroundColor: '#B8860B', // Darker gold for center
    borderRadius: 7.5,
    position: 'absolute',
  },
  brandName: {
    fontSize: 32,
    fontWeight: '300',
    color: '#8B4513', // Dark brown
    marginBottom: 20,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: '#8B4513',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
    fontWeight: '300',
    maxWidth: width * 0.8,
  },
  bottomIndicator: {
    position: 'absolute',
    bottom: 50,
    width: 40,
    height: 4,
    backgroundColor: '#D4AF37',
    borderRadius: 2,
    opacity: 0.6,
  },
});

export default Splash;