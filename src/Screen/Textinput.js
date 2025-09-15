import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Textinput = ({navigation}) => {
  const [selectedInput, setSelectedInput] = useState('text');
  const [query, setQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');



  const handlePress = () => {
   setSelectedInput('image');
    navigation.navigate("Imageinput"); // 👈 your target screen name
  };


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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Input Your Query</Text>
          <Text style={styles.headerSubtitle}>Ask about Vedic mathematics</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Input Type Selection */}
        <View style={styles.inputTypeContainer}>
          <TouchableOpacity
            style={[
              styles.inputTypeButton,
              styles.textInputButton,
              selectedInput === 'text' && styles.selectedInputType,
            ]}
            onPress={() => setSelectedInput('text')}
          >
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={selectedInput === 'text' ? '#fff' : '#666'}
            />
            <Text
              style={[
                styles.inputTypeText,
                selectedInput === 'text' && styles.selectedInputTypeText,
              ]}
            >
              Text Input
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.inputTypeButton,
              styles.imageInputButton,
              selectedInput === 'image' && styles.selectedInputType,
            ]}
            onPress={handlePress}
          >
            <Ionicons
              name="image-outline"
              size={20}
              color={selectedInput === 'image' ? '#fff' : '#666'}
            />
            <Text
              style={[
                styles.inputTypeText,
                selectedInput === 'image' && styles.selectedInputTypeText,
              ]}
            >
              Image Input
            </Text>
          </TouchableOpacity>
        </View>

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
        <TouchableOpacity style={styles.generateButton}>
          <Ionicons name="sparkles" size={20} color="#fff" style={styles.generateIcon} />
          <Text style={styles.generateText}>Generate Explanation</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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