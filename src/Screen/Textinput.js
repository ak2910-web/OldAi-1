import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getResonance } from '../api/api';
import { saveConversation } from '../services/firebaseService';
import FooterNavigation from '../components/FooterNavigation';

const Textinput = ({navigation}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');


  const examples = [
    'How to find square of 45 using Vedic method?',
    'Explain Ekadhikena Purvena sutra',
    'What is Nikhilam multiplication?',
    'Vedic method for finding cube roots',
  ];

  const tips = [
    'Be specific about the Vedic method you want to learn',
    'Include numbers for calculation examples',
    'Ask about sutras by name or description',
    'For images, ensure clear visibility of formulas',
  ];

  const handleGenerate = async () => {
    const prompt = (query || '').trim();
    if (!prompt) {
      Alert.alert('Error', 'Please enter a question first');
      return;
    }

    try {
      setLoading(true);
      const result = await getResonance(prompt);
      if (result) {
        // Save conversation to Firestore
        try {
          await saveConversation(prompt, result, 'gemini-2.0-flash', 'text');
          console.log('✅ Conversation saved to Firestore');
        } catch (firestoreError) {
          console.warn('⚠️ Failed to save to Firestore:', firestoreError);
          // Don't block the user experience if Firestore fails
        }

        navigation.navigate('Output', { 
          result: result,
          prompt: prompt,
          model: 'Gemini Pro'
        });
      } else {
        throw new Error('No response received from the server');
      }
    } catch (error) {
      console.error("Error generating response:", error);
      let errorMessage = error.message;
      
      if (errorMessage.includes('Network request failed')) {
        errorMessage = 'Cannot connect to the server. Please make sure:\n\n' +
          '1. You have an internet connection\n' +
          '2. The Firebase emulator is running\n' +
          '3. Try restarting the app';
      }
      
      Alert.alert(
        "Error",
        errorMessage || "Failed to generate response. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back" size={24} color="#1F1F1F" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Text Input</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.headerButton}>
          <Icon name="account-circle" size={28} color="#1F1F1F" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Input Type (text only) + separator */}
        <View style={styles.inputTypeContainer}>
          <View style={[styles.inputTypeButton, styles.textInputButton, styles.selectedInputType]}>
            <Ionicons name="chatbubble-outline" size={20} color={'#fff'} />
            <Text style={[styles.inputTypeText, styles.selectedInputTypeText]}>Text Input</Text>
          </View>
        </View>
        <View style={styles.separator} />

        {/* Language Selection */}
        <View style={styles.languageContainer}>
          <Text style={styles.sectionLabel}>Language</Text>
          <TouchableOpacity style={styles.languageSelector}>
            <Text style={styles.languageText}>{selectedLanguage}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Query Input */}
        <View style={styles.queryContainer}>
          <Text style={styles.sectionLabel}>Your Question</Text>
          <TextInput
            style={styles.queryInput}
            placeholder="Ask about Vedic mathematics methods, sutras, or techniques..."
            placeholderTextColor="#999"
            multiline
            value={query}
            onChangeText={setQuery}
            textAlignVertical="top"
          />
        </View>

        {/* Examples Section */}
        <View style={styles.examplesContainer}>
          <Text style={styles.examplesTitle}>Try these examples:</Text>
          {examples.map((example, index) => (
            <TouchableOpacity
              key={index}
              style={styles.exampleButton}
              onPress={() => setQuery(example)}
            >
              <Text style={styles.exampleText}>{example}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Generate Button */}
        <TouchableOpacity 
          style={[styles.generateButton, loading && styles.generateButtonDisabled]} 
          onPress={handleGenerate}
          disabled={loading || !query.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color="#fff" style={styles.generateIcon} />
              <Text style={styles.generateText}>Generate Explanation</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
            <Text style={styles.tipsTitle}>Tips for better results:</Text>
          </View>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <FooterNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  inputTypeContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  inputTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  textInputButton: {
    backgroundColor: '#FF8C42',
  },
  imageInputButton: {
    backgroundColor: '#E5E5E5',
  },
  selectedInputType: {
    backgroundColor: '#FF8C42',
  },
  inputTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  selectedInputTypeText: {
    color: '#fff',
  },
  languageContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  queryContainer: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  queryInput: {
    height: 120,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
  examplesContainer: {
    marginTop: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 16,
    borderRadius: 1,
  },
  examplesTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  exampleButton: {
    backgroundColor: '#E8D5B7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#5D4E37',
    fontWeight: '500',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB84D',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  generateIcon: {
    marginRight: 4,
  },
  generateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  generateButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  tipsContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 16,
  },
  tipBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
    marginTop: 8,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default Textinput