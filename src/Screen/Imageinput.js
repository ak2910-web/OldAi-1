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
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { extractText, getResonance } from '../api/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';
import FooterNavigation from '../components/FooterNavigation';
import ProfileIcon from '../components/ProfileIcon';
import auth from '@react-native-firebase/auth';

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
      
      // Request camera permission for Android
      if (type === 'camera' && Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Denied',
            'Camera permission is required to take photos. Please enable it in settings.',
            [{ text: 'OK' }]
          );
          return;
        }
      }
      
      const options = {
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        saveToPhotos: type === 'camera',
      };

      const result = type === 'library' 
        ? await launchImageLibrary(options)
        : await launchCamera(options);

      if (result.didCancel) {
        console.log('[INFO] User cancelled image picker');
        return;
      }

      if (result.errorCode) {
        console.error('[ERROR] Image picker error:', result.errorCode, result.errorMessage);
        Alert.alert(
          'Error',
          result.errorMessage || 'Failed to capture image. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (result.assets?.[0]) {
        setSelectedImage(result.assets[0]);
        console.log('[SUCCESS] Image selected:', result.assets[0].fileName);
      }
    } catch (err) {
      console.error('[ERROR] Error selecting image:', err);
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
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
        >
          <ProfileIcon
            size={36}
            name={auth().currentUser?.displayName || 'Guest'}
            imageUri={auth().currentUser?.photoURL}
            isGuest={!auth().currentUser}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Improved Mode Toggle with Slider */}
        <View style={[styles.modeToggleWrapper, { backgroundColor: colors.surface }]}>
          <View style={styles.modeToggleContainer}>
            <TouchableOpacity
              style={[styles.modeButton, inputMode === 'image' && styles.modeButtonActive]}
              onPress={() => setInputMode('image')}
              activeOpacity={0.7}
            >
              <Icon 
                name="camera" 
                size={20} 
                color={inputMode === 'image' ? '#fff' : colors.textSecondary} 
              />
              <Text style={[
                styles.modeButtonText,
                { color: inputMode === 'image' ? '#fff' : colors.textSecondary }
              ]}>
                Image
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeButton, inputMode === 'text' && styles.modeButtonActive]}
              onPress={() => setInputMode('text')}
              activeOpacity={0.7}
            >
              <Icon 
                name="edit-3" 
                size={20} 
                color={inputMode === 'text' ? '#fff' : colors.textSecondary} 
              />
              <Text style={[
                styles.modeButtonText,
                { color: inputMode === 'text' ? '#fff' : colors.textSecondary }
              ]}>
                Text
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Animated Slider */}
          <View style={[
            styles.modeSlider,
            { left: inputMode === 'image' ? 4 : '50%' }
          ]}>
            <LinearGradient
              colors={['#FFD700', '#FF9500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modeSliderGradient}
            />
          </View>
        </View>

        {/* Redesigned Image Input Section */}
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
                  colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.imageOverlay}
                >
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedImage(null)}
                    activeOpacity={0.8}
                  >
                    <Icon name="x" size={18} color="#fff" />
                  </TouchableOpacity>
                </LinearGradient>
                
                <View style={styles.imageActionsContainer}>
                  <TouchableOpacity
                    style={[styles.imageActionButton, { backgroundColor: colors.surface }]}
                    onPress={() => handleSelectImage('camera')}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#FF9500', '#FF6B00']}
                      style={styles.imageActionGradient}
                    >
                      <Icon name="camera" size={20} color="#fff" />
                      <Text style={styles.imageActionText}>Retake</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.imageActionButton, { backgroundColor: colors.surface }]}
                    onPress={() => handleSelectImage('library')}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#3B82F6', '#2563EB']}
                      style={styles.imageActionGradient}
                    >
                      <Icon name="image" size={20} color="#fff" />
                      <Text style={styles.imageActionText}>Gallery</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.imageUploadContainer}>
                {/* Quick Action Buttons */}
                <View style={styles.quickActionsRow}>
                  <TouchableOpacity
                    style={[styles.quickActionCard, { backgroundColor: colors.surface }]}
                    onPress={() => handleSelectImage('camera')}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={isDarkMode ? ['#374151', '#1F2937'] : ['#FFF8E7', '#FFE4B5']}
                      style={styles.quickActionGradient}
                    >
                      <View style={[styles.quickActionIconContainer, { backgroundColor: '#FF9500' + '20' }]}>
                        <Icon name="camera" size={32} color="#FF9500" />
                      </View>
                      <Text style={[styles.quickActionTitle, { color: colors.text }]}>Take Photo</Text>
                      <Text style={[styles.quickActionSubtitle, { color: colors.textSecondary }]}>
                        Capture instantly
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.quickActionCard, { backgroundColor: colors.surface }]}
                    onPress={() => handleSelectImage('library')}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={isDarkMode ? ['#374151', '#1F2937'] : ['#E0F2FE', '#DBEAFE']}
                      style={styles.quickActionGradient}
                    >
                      <View style={[styles.quickActionIconContainer, { backgroundColor: '#3B82F6' + '20' }]}>
                        <Icon name="image" size={32} color="#3B82F6" />
                      </View>
                      <Text style={[styles.quickActionTitle, { color: colors.text }]}>From Gallery</Text>
                      <Text style={[styles.quickActionSubtitle, { color: colors.textSecondary }]}>
                        Choose existing
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Feature Highlights */}
                <View style={[styles.featuresContainer, { backgroundColor: colors.surface }]}>
                  <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: '#10B981' + '20' }]}>
                      <Icon name="check-circle" size={18} color="#10B981" />
                    </View>
                    <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                      Handwritten formulas
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: '#8B5CF6' + '20' }]}>
                      <Icon name="check-circle" size={18} color="#8B5CF6" />
                    </View>
                    <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                      Math diagrams
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: '#F59E0B' + '20' }]}>
                      <Icon name="check-circle" size={18} color="#F59E0B" />
                    </View>
                    <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                      Printed equations
                    </Text>
                  </View>
                </View>
              </View>
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
  // Improved Mode Toggle
  modeToggleWrapper: {
    marginTop: 20,
    borderRadius: 16,
    padding: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  modeToggleContainer: {
    flexDirection: 'row',
    position: 'relative',
    zIndex: 2,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    borderRadius: 12,
    zIndex: 2,
  },
  modeButtonActive: {
    // Active state handled by slider
  },
  modeSlider: {
    position: 'absolute',
    top: 4,
    width: '48%',
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 1,
  },
  modeSliderGradient: {
    flex: 1,
    borderRadius: 12,
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  // Redesigned Image Section
  imageSection: {
    marginTop: 24,
  },
  imageUploadContainer: {
    gap: 20,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  quickActionGradient: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 12,
  },
  quickActionIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  featuresContainer: {
    borderRadius: 16,
    padding: 20,
    gap: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 15,
    fontWeight: '500',
  },
  selectedImageContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  selectedImage: {
    width: '100%',
    height: 360,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  removeImageButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  imageActionsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  imageActionButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
  },
  imageActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  imageActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
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