import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { extractText, getResonance } from '../api/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';
import FooterNavigation from '../components/FooterNavigation';

const Imageinput = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [inputMode, setInputMode] = useState('image'); // 'image' or 'text'
  const [showImageOptions, setShowImageOptions] = useState(false);

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

  const handleSelectImage = async (type = 'library') => {
    try {
      setShowImageOptions(false);
      
      const options = {
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
      };

      const result = type === 'library' 
        ? await launchImageLibrary(options)
        : await launchCamera(options);

      if (result.assets?.[0]) {
        setSelectedImage(result.assets[0]);
      }
    } catch (err) {
      console.error('Error selecting image:', err);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleProcessRequest = async () => {
    try {
      setLoading(true);
      let result;
      
      if (inputMode === 'image' && selectedImage?.base64) {
        // Process image
        const response = await extractText(selectedImage.base64, selectedImage.type || "image/png");
        result = response.text;
      } else if (inputMode === 'text' && query) {
        // Process text query
        result = await getResonance(query);
      } else {
        Alert.alert('Error', inputMode === 'image' ? 'Please select an image' : 'Please enter a question');
        setLoading(false);
        return;
      }
      
      // Navigate to output with result
      navigation.navigate('Output', { 
        result,
        prompt: inputMode === 'image' ? "Image Analysis" : query,
        model: inputMode === 'image' ? "Gemini Pro Vision" : "Gemini Pro"
      });
    } catch (error) {
      console.error("Error processing request:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to process request. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}> Athravanavira</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {inputMode === 'image' ? 'Analyze Images' : 'Ask Questions'}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Input Mode Toggle */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              { backgroundColor: colors.surface },
              inputMode === 'image' && styles.modeButtonActive
            ]}
            onPress={() => setInputMode('image')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={inputMode === 'image' ? ['#FFD700', '#FF9500'] : ['transparent', 'transparent']}
              style={styles.modeButtonGradient}
            >
              <Icon 
                name="camera" 
                size={22} 
                color={inputMode === 'image' ? '#fff' : colors.textSecondary} 
              />
              <Text style={[
                styles.modeButtonText,
                { color: inputMode === 'image' ? '#fff' : colors.textSecondary }
              ]}>
                Image
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              { backgroundColor: colors.surface },
              inputMode === 'text' && styles.modeButtonActive
            ]}
            onPress={() => setInputMode('text')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={inputMode === 'text' ? ['#FFD700', '#FF9500'] : ['transparent', 'transparent']}
              style={styles.modeButtonGradient}
            >
              <Icon 
                name="edit-3" 
                size={22} 
                color={inputMode === 'text' ? '#fff' : colors.textSecondary} 
              />
              <Text style={[
                styles.modeButtonText,
                { color: inputMode === 'text' ? '#fff' : colors.textSecondary }
              ]}>
                Text
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Image Input Section */}
        {inputMode === 'image' && (
          <View style={styles.imageSection}>
            {selectedImage ? (
              <View style={styles.selectedImageContainer}>
                <Image 
                  source={{ uri: selectedImage.uri }} 
                  style={styles.selectedImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0.6)', 'transparent']}
                  style={styles.imageOverlay}
                >
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedImage(null)}
                    activeOpacity={0.8}
                  >
                    <Icon name="x" size={20} color="#fff" />
                  </TouchableOpacity>
                </LinearGradient>
                
                <TouchableOpacity
                  style={[styles.changeImageButton, { backgroundColor: colors.surface }]}
                  onPress={() => setShowImageOptions(true)}
                  activeOpacity={0.8}
                >
                  <Icon name="refresh-cw" size={18} color="#FF9500" />
                  <Text style={styles.changeImageText}>Change Image</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.imageUploadArea, { backgroundColor: colors.surface }]}
                onPress={() => setShowImageOptions(true)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={isDarkMode ? ['#374151', '#1F2937'] : ['#FFF8E7', '#FFE4B5']}
                  style={styles.imageUploadGradient}
                >
                  <View style={styles.uploadIconContainer}>
                    <Icon name="image" size={48} color="#FF9500" opacity={0.8} />
                  </View>
                  <Text style={[styles.imageUploadTitle, { color: colors.text }]}>
                    Upload or Capture Image
                  </Text>
                  <Text style={[styles.imageUploadSubtext, { color: colors.textSecondary }]}>
                    Take a photo or choose from gallery
                  </Text>
                  <View style={styles.uploadHintContainer}>
                    <Icon name="info" size={14} color={colors.primary} />
                    <Text style={[styles.uploadHint, { color: colors.textSecondary }]}>
                      Works with formulas, diagrams & handwritten math
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Text Input Section */}
        {inputMode === 'text' && (
          <View style={[styles.textSection, { backgroundColor: colors.surface }]}>
            <View style={styles.textInputHeader}>
              <Icon name="edit-3" size={20} color="#FF9500" />
              <Text style={[styles.textInputLabel, { color: colors.text }]}>Your Question</Text>
            </View>
            <TextInput
              style={[styles.queryInput, { color: colors.text }]}
              placeholder="Ask about Vedic mathematics methods, sutras, or techniques..."
              placeholderTextColor={colors.textSecondary}
              multiline
              value={query}
              onChangeText={setQuery}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Examples Section (only for text mode) */}
        {inputMode === 'text' && (
          <View style={styles.examplesContainer}>
            <View style={styles.examplesHeader}>
              <Icon name="zap" size={18} color="#FF9500" />
              <Text style={[styles.examplesTitle, { color: colors.text }]}>Quick Examples</Text>
            </View>
            {examples.map((example, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.exampleChip, { backgroundColor: colors.surface }]}
                onPress={() => setQuery(example)}
                activeOpacity={0.7}
              >
                <Text style={[styles.exampleText, { color: colors.textSecondary }]}>{example}</Text>
                <Icon name="chevron-right" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Generate Button */}
        <TouchableOpacity 
          style={[
            styles.generateButton,
            (!query && !selectedImage || loading) && styles.generateButtonDisabled
          ]}
          disabled={!query && !selectedImage || loading}
          onPress={handleProcessRequest}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={(!query && !selectedImage || loading) 
              ? ['#9CA3AF', '#6B7280'] 
              : ['#FFD700', '#FF9500']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.generateButtonGradient}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" />
                <Text style={styles.generateText}>Processing...</Text>
              </>
            ) : (
              <>
                <Icon name="sparkles" size={20} color="#fff" />
                <Text style={styles.generateText}>Analyze {inputMode === 'image' ? 'Image' : 'Question'}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Tips Section */}
        <View style={[styles.tipsContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.tipsHeader}>
            <Icon name="lightbulb" size={20} color="#F59E0B" />
            <Text style={[styles.tipsTitle, { color: colors.text }]}>Tips for Better Results</Text>
          </View>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View style={[styles.tipBullet, { backgroundColor: colors.primary }]} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowImageOptions(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Image</Text>
            
            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
              onPress={() => handleSelectImage('camera')}
              activeOpacity={0.7}
            >
              <View style={[styles.modalIconContainer, { backgroundColor: '#FF9500' + '20' }]}>
                <Icon name="camera" size={24} color="#FF9500" />
              </View>
              <View style={styles.modalOptionTextContainer}>
                <Text style={[styles.modalOptionTitle, { color: colors.text }]}>Take Photo</Text>
                <Text style={[styles.modalOptionSubtitle, { color: colors.textSecondary }]}>
                  Use camera to capture
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
              onPress={() => handleSelectImage('library')}
              activeOpacity={0.7}
            >
              <View style={[styles.modalIconContainer, { backgroundColor: '#3B82F6' + '20' }]}>
                <Icon name="image" size={24} color="#3B82F6" />
              </View>
              <View style={styles.modalOptionTextContainer}>
                <Text style={[styles.modalOptionTitle, { color: colors.text }]}>Choose from Gallery</Text>
                <Text style={[styles.modalOptionSubtitle, { color: colors.textSecondary }]}>
                  Select existing image
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowImageOptions(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Footer Navigation */}
      <FooterNavigation />
    </SafeAreaView>
  );
};

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
    borderBottomColor: 'rgba(0,0,0,0.05)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  // Mode Toggle
  modeToggleContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  modeButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  modeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Image Section
  imageSection: {
    marginTop: 20,
  },
  imageUploadArea: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageUploadGradient: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  imageUploadTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  imageUploadSubtext: {
    fontSize: 14,
    marginBottom: 16,
  },
  uploadHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  uploadHint: {
    fontSize: 12,
  },
  selectedImageContainer: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  selectedImage: {
    width: '100%',
    height: 300,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  removeImageButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
  },
  changeImageText: {
    fontSize: 16,
    color: '#FF9500',
    fontWeight: '600',
  },
  // Text Section
  textSection: {
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  textInputLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  queryInput: {
    minHeight: 140,
    fontSize: 16,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  // Examples
  examplesContainer: {
    marginTop: 24,
  },
  examplesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  exampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  exampleText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  // Generate Button
  generateButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  generateButtonDisabled: {
    elevation: 1,
    shadowOpacity: 0.1,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  generateText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  // Tips
  tipsContainer: {
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 16,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionTextContainer: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  modalOptionSubtitle: {
    fontSize: 13,
  },
  modalCancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
});

export default Imageinput;