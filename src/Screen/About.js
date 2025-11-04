import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const About = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>About VedAI</Text>
      <Text style={styles.paragraph}>
        VedAI is a learning tool that helps you explore Vedic mathematics with clear explanations and
        step-by-step guidance. Our mission is to make ancient techniques accessible through modern
        interfaces.
      </Text>
      <Text style={styles.paragraph}>
        Built with React Native, VedAI supports image and text inputs and offers quick access to
        tutorials and background information.
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

export default About;
