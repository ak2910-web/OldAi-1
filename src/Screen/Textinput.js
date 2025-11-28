import React, { useState, useEffect } from 'react';
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
  Modal,
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
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  const languages = [
    { code: 'en', name: 'English', icon: '🇬🇧' },
    { code: 'hi', name: 'Hindi', icon: '🇮🇳' },
    { code: 'sa', name: 'Sanskrit', icon: '🕉️' },
  ];

  const loadingMessages = [
    'Connecting to ancient wisdom...',
    'Analyzing Vedic mathematics...',
    'Comparing ancient and modern approaches...',
    'Generating detailed explanation...',
    'Almost there...',
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      setElapsedTime(0);
      setLoadingMessage(loadingMessages[0]);
      
      interval = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          // Update message every 5 seconds
          if (newTime % 5 === 0) {
            const messageIndex = Math.min(Math.floor(newTime / 5), loadingMessages.length - 1);
            setLoadingMessage(loadingMessages[messageIndex]);
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);


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
      console.log('🚀 Starting API call...');
      console.log('🌐 Language:', selectedLanguage);
      
      const result = await getResonance(prompt, selectedLanguage);
      console.log('✅ API response received, length:', result?.length || 0);
      
      if (result) {
        // Save conversation to Firestore (non-blocking)
        saveConversation(prompt, result, 'gemini-2.0-flash', 'text')
          .then(() => console.log('✅ Conversation saved to Firestore'))
          .catch(err => console.warn('⚠️ Failed to save to Firestore:', err));

        console.log('📱 Navigating to Output screen...');
        
        // Navigate first, then stop loading
        navigation.navigate('Output', { 
          result: result,
          prompt: prompt,
          model: 'Gemini Pro',
          language: selectedLanguage
        });
        
        // Small delay to ensure navigation completes
        setTimeout(() => {
          setLoading(false);
        }, 300);
      } else {
        setLoading(false);
        throw new Error('No response received from the server');
      }
    } catch (error) {
      setLoading(false);
      console.error("❌ Error generating response:", error);
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
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading Modal */}
      <Modal
        visible={loading}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#FF9500" />
            <Text style={styles.modalTitle}>{loadingMessage}</Text>
            <Text style={styles.modalTimer}>{elapsedTime}s elapsed</Text>
            <Text style={styles.modalHint}>
              Generating comprehensive ancient vs modern comparison...
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((elapsedTime / 30) * 100, 95)}%` }
                ]} 
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back" size={24} color="#1F1F1F" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Atharvanavira</Text>
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
            <Text style={[styles.inputTypeText, styles.selectedInputTypeText]}>Athravanavira</Text>
          </View>
        </View>
        <View style={styles.separator} />

        {/* Language Selection */}
        <View style={styles.languageContainer}>
          <Text style={styles.sectionLabel}>Language</Text>
          <TouchableOpacity 
            style={styles.languageSelector}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.languageDisplay}>
              <Text style={styles.languageIcon}>
                {languages.find(l => l.name === selectedLanguage)?.icon}
              </Text>
              <Text style={styles.languageText}>{selectedLanguage}</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Language Selection Modal */}
        <Modal
          visible={showLanguageModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={styles.languageModalOverlay}>
            <View style={styles.languageModalContent}>
              <View style={styles.languageModalHeader}>
                <Text style={styles.languageModalTitle}>Select Language</Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    selectedLanguage === language.name && styles.languageOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedLanguage(language.name);
                    setShowLanguageModal(false);
                  }}
                >
                  <Text style={styles.languageOptionIcon}>{language.icon}</Text>
                  <Text style={[
                    styles.languageOptionText,
                    selectedLanguage === language.name && styles.languageOptionTextSelected
                  ]}>
                    {language.name}
                  </Text>
                  {selectedLanguage === language.name && (
                    <Icon name="check" size={24} color="#FF9500" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

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
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  languageDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageIcon: {
    fontSize: 20,
  },
  languageText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
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
  // Loading Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  modalTimer: {
    fontSize: 14,
    color: '#FF9500',
    marginTop: 8,
    fontWeight: '500',
  },
  modalHint: {
    fontSize: 13,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9500',
    borderRadius: 2,
  },
  // Language Modal Styles
  languageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  languageModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  languageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  languageModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  languageOptionSelected: {
    backgroundColor: '#FFF8E7',
  },
  languageOptionIcon: {
    fontSize: 24,
  },
  languageOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  languageOptionTextSelected: {
    fontWeight: '600',
    color: '#FF9500',
  },
});

export default Textinput