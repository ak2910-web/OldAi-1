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
  Modal,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const Imageinput = () => {
  const [selectedInput, setSelectedInput] = useState('text');
  const [query, setQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchCamera(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
      }
    });
    setShowImageOptions(false);
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
      }
    });
    setShowImageOptions(false);
  };

  const handleImageInput = () => {
    if (selectedInput === 'image') {
      setShowImageOptions(true);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

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
            onPress={() => setSelectedInput('image')}
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

        {/* Conditional Input based on selection */}
        {selectedInput === 'text' ? (
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
        ) : (
          <View style={styles.imageContainer}>
            <Text style={styles.sectionLabel}>Upload Image</Text>
            
            {selectedImage ? (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                  <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imageUploadButton} onPress={handleImageInput}>
                <Ionicons name="camera-outline" size={40} color="#666" />
                <Text style={styles.imageUploadText}>Tap to add image</Text>
                <Text style={styles.imageUploadSubtext}>Camera or Gallery</Text>
              </TouchableOpacity>
            )}
            
            {selectedImage && (
              <TouchableOpacity style={styles.changeImageButton} onPress={handleImageInput}>
                <Ionicons name="refresh-outline" size={20} color="#FF8C42" />
                <Text style={styles.changeImageText}>Change Image</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Examples Section - only show for text input */}
        {selectedInput === 'text' && (
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
        )}

        {/* Generate Button */}
        <TouchableOpacity 
          style={[
            styles.generateButton,
            (!query && !selectedImage) && styles.generateButtonDisabled
          ]}
          disabled={!query && !selectedImage}
        >
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

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Image</Text>
            </View>
            
            <TouchableOpacity style={styles.modalOption} onPress={openCamera}>
              <Ionicons name="camera-outline" size={24} color="#333" />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={openGallery}>
              <Ionicons name="images-outline" size={24} color="#333" />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCancelButton} 
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#E5E5E5',
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
  imageContainer: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  imageUploadButton: {
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  imageUploadSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  selectedImageContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  changeImageText: {
    fontSize: 16,
    color: '#FF8C42',
    fontWeight: '500',
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
  generateButtonDisabled: {
    backgroundColor: '#D1D5DB',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
    gap: 16,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalCancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '500',
  },
});

export default Imageinput;