import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';

export default function ResonanceSkeleton({ variant = 'output', count = 1 }) {
  const { colors } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const SkeletonBox = ({ width = '100%', height = 20, style = {} }) => (
    <Animated.View
      style={[
        styles.skeletonBox,
        { 
          width, 
          height, 
          backgroundColor: colors.surface || '#E5E7EB',
          opacity 
        },
        style,
      ]}
    />
  );

  const renderOutputSkeleton = () => (
    <View style={styles.outputSkeletonContainer}>
      {/* Header skeleton */}
      <View style={styles.headerSkeleton}>
        <SkeletonBox width={120} height={24} />
        <SkeletonBox width={80} height={20} style={{ marginTop: 8 }} />
      </View>

      {/* Content lines skeleton */}
      <View style={styles.contentSkeleton}>
        <SkeletonBox width="95%" height={16} style={{ marginBottom: 12 }} />
        <SkeletonBox width="100%" height={16} style={{ marginBottom: 12 }} />
        <SkeletonBox width="88%" height={16} style={{ marginBottom: 12 }} />
        <SkeletonBox width="92%" height={16} style={{ marginBottom: 12 }} />
        <SkeletonBox width="78%" height={16} style={{ marginBottom: 12 }} />
        <SkeletonBox width="96%" height={16} style={{ marginBottom: 12 }} />
        <SkeletonBox width="85%" height={16} style={{ marginBottom: 12 }} />
        <SkeletonBox width="70%" height={16} />
      </View>

      {/* Card skeleton */}
      <View style={styles.cardSkeleton}>
        <SkeletonBox width={140} height={20} style={{ marginBottom: 12 }} />
        <SkeletonBox width="100%" height={60} />
      </View>
    </View>
  );

  const renderHistorySkeleton = () => (
    <View style={styles.historySkeletonContainer}>
      <View style={styles.historyCardSkeleton}>
        <View style={styles.historyCardHeader}>
          <SkeletonBox width={40} height={40} style={{ borderRadius: 20 }} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <SkeletonBox width="60%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonBox width="40%" height={14} />
          </View>
        </View>
        <View style={{ marginTop: 12 }}>
          <SkeletonBox width="90%" height={14} style={{ marginBottom: 6 }} />
          <SkeletonBox width="75%" height={14} />
        </View>
      </View>
    </View>
  );

  const renderCompactSkeleton = () => (
    <View style={styles.compactSkeletonContainer}>
      <SkeletonBox width="100%" height={50} style={{ borderRadius: 12, marginBottom: 12 }} />
      <SkeletonBox width="100%" height={50} style={{ borderRadius: 12, marginBottom: 12 }} />
      <SkeletonBox width="100%" height={50} style={{ borderRadius: 12 }} />
    </View>
  );

  const renderContent = () => {
    switch (variant) {
      case 'output':
        return renderOutputSkeleton();
      case 'history':
        return Array.from({ length: count }).map((_, i) => (
          <View key={i}>{renderHistorySkeleton()}</View>
        ));
      case 'compact':
        return renderCompactSkeleton();
      default:
        return renderOutputSkeleton();
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  skeletonBox: {
    borderRadius: 8,
  },
  outputSkeletonContainer: {
    paddingVertical: 16,
  },
  headerSkeleton: {
    marginBottom: 24,
  },
  contentSkeleton: {
    marginBottom: 24,
  },
  cardSkeleton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  historySkeletonContainer: {
    marginBottom: 12,
  },
  historyCardSkeleton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  historyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactSkeletonContainer: {
    paddingVertical: 8,
  },
});

