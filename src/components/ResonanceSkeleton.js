import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function ResonanceSkeleton() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF9500" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
});
