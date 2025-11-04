import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const HowItWorks = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>How It Works</Text>
      <Text style={styles.paragraph}>
        VedAI uses a combination of Vedic mathematics heuristics and a lightweight AI model to explain
        methods and sutras. Use the Image Input or Text Input to ask questions. The app will parse your
        input and return step-by-step explanations.
      </Text>
      <Text style={styles.paragraph}>
        This screen is intentionally simple. Replace or expand this content with a more detailed
        tutorial, images, or videos as needed.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
});

export default HowItWorks;
