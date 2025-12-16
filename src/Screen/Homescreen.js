import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getResonance, getTextFromImage, getRecentSearches } from "../api/api";
import { getUserConversations } from '../services/firebaseService';
import auth from '@react-native-firebase/auth';
import { useTheme } from '../context/ThemeContext';
import FooterNavigation from '../components/FooterNavigation';
import ProfileIcon from '../components/ProfileIcon';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;


const Homescreen = ({navigation}) => {
  const { isDarkMode, colors, toggleTheme } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerAnimation] = useState(new Animated.Value(-DRAWER_WIDTH));
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [conversations, setConversations] = useState([]);
  const [isGuest, setIsGuest] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loadingSearches, setLoadingSearches] = useState(false);

  useEffect(() => {
    // Auth state listener
    const unsubscribe = auth().onAuthStateChanged((user) => {
      console.log('[USER] Auth state changed:', user ? `User: ${user.email}` : 'Guest');
      setCurrentUser(user);
      setIsGuest(!user);
      
      // Load conversations if authenticated
      if (user) {
        loadConversations();
      } else {
        setConversations([]);
      }
    });

    // Load recent searches (available for everyone)
    loadRecentSearches();

    return () => unsubscribe();
  }, []);

  const loadConversations = async () => {
    try {
      console.log('[FETCH] Loading conversations...');
      const convos = await getUserConversations(10); // Fetch last 10
      console.log(`[SUCCESS] Loaded ${convos.length} conversations`);
      setConversations(convos);
    } catch (error) {
      console.error('[ERROR] Error loading conversations:', error);
      console.error('Make sure Firestore emulator is running on port 8080');
    }
  };

  const loadRecentSearches = async () => {
    try {
      setLoadingSearches(true);
      console.log('[HISTORY] Loading recent searches...');
      const searches = await getRecentSearches(5); // Fetch last 5
      console.log(`[SUCCESS] Loaded ${searches.length} recent searches`);
      setRecentSearches(searches);
    } catch (error) {
      console.error('[ERROR] Error loading recent searches:', error);
    } finally {
      setLoadingSearches(false);
    }
  };

  const toggleDrawer = () => {
    if (isDrawerOpen) {
      // Close drawer
      Animated.parallel([
        Animated.timing(drawerAnimation, {
          toValue: -DRAWER_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setIsDrawerOpen(false));
    } else {
      // Open drawer
      setIsDrawerOpen(true);
      Animated.parallel([
        Animated.timing(drawerAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleNewChat = () => {
    toggleDrawer();
    // Clear any selected conversation and stay on home
  };

  const handleTemporaryChat = () => {
    toggleDrawer();
    // Navigate to text input for a one-time question
    navigation.navigate('Textinput');
  };

  const handleConversationPress = (conversation) => {
    toggleDrawer();
    console.log('[READ] Opening conversation:', conversation.id);
    // Navigate to output with this conversation
    navigation.navigate('Output', { 
      result: conversation.answer,  // Changed from 'results' to 'result' and 'response' to 'answer'
      prompt: conversation.question  // Changed from 'question' to 'prompt' to match Output screen
    });
  };

  const handleRecentSearchPress = (search) => {
    console.log('[SEARCH] Repeating search:', search.question);
    // Navigate to text input with the question pre-filled
    navigation.navigate('Textinput', {
      prefilledQuestion: search.question,
      language: search.language
    });
  };

  const handleImageInput = async () => {
    console.log('Image input pressed');
    try {
      // First navigate to ImageInput screen where user can select/capture image
      navigation.navigate('Imageinput');
      
      // NOTE: The actual image processing should happen in Imageinput screen
      // because we need to let user select/capture the image first
      // The base64 processing code below should move to Imageinput.js:
      
      /* Example flow for Imageinput.js:
      const base64Data = // ... from image picker/camera
      const text = await getTextFromImage(base64Data, "image/png");
      // Navigate to results with extracted text
      navigation.navigate('Output', { results: text });
      */
    } catch (error) {
      console.error("Error in handleImageInput:", error);
      // Show error alert to user
      Alert.alert(
        "Error",
        "Failed to process image. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleTextInput = () => {
    console.log('Text input pressed');
    navigation.navigate('Textinput');
  };


  const handleHowItWorks = () => {
    console.log('How it works pressed');
    navigation.navigate('HowItWorks');
  };

  const handleAboutVedAI = () => {
    console.log('About VedAI pressed');
    navigation.navigate('About');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "light-content"} 
        backgroundColor={colors.primary} 
      />
      
      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <TouchableWithoutFeedback onPress={toggleDrawer}>
          <Animated.View 
            style={[
              styles.overlay,
              { opacity: overlayOpacity }
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      {/* Sliding Drawer */}
      <Animated.View 
        style={[
          styles.drawer,
          { transform: [{ translateX: drawerAnimation }] }
        ]}
      >
        <LinearGradient
          colors={isDarkMode ? colors.drawerGradient : colors.drawerGradient}
          style={styles.drawerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Drawer Header */}
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Athravanavira</Text>
            <TouchableOpacity onPress={toggleDrawer} style={styles.closeDrawer}>
              <Icon name="x" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* New Chat & Temporary Chat Buttons */}
          <View style={styles.drawerActions}>
            <TouchableOpacity 
              style={styles.newChatButton}
              onPress={handleNewChat}
              activeOpacity={0.8}
            >
              <Icon name="plus-circle" size={20} color="white" />
              <Text style={styles.newChatText}>New Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.tempChatButton}
              onPress={handleTemporaryChat}
              activeOpacity={0.8}
            >
              <MaterialIcons name="chat-bubble-outline" size={20} color="white" />
              <Text style={styles.tempChatText}>Temporary Chat</Text>
            </TouchableOpacity>
          </View>

          {/* Chat History */}
          <View style={styles.historySection}>
            <Text style={styles.historySectionTitle}>Recent Chats</Text>
            <ScrollView 
              style={styles.historyList}
              showsVerticalScrollIndicator={false}
            >
              {isGuest ? (
                <View style={styles.guestPrompt}>
                  <Icon name="lock" size={32} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.guestPromptText}>Sign in to save and view chat history</Text>
                  <TouchableOpacity 
                    style={styles.signInButton}
                    onPress={() => {
                      toggleDrawer();
                      navigation.navigate('Login');
                    }}
                  >
                    <Text style={styles.signInButtonText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              ) : conversations.length === 0 ? (
                <View style={styles.emptyHistory}>
                  <Icon name="message-circle" size={32} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.emptyHistoryText}>No chat history yet</Text>
                </View>
              ) : (
                conversations.map((convo, index) => (
                  <TouchableOpacity
                    key={convo.id || index}
                    style={styles.historyItem}
                    onPress={() => handleConversationPress(convo)}
                    activeOpacity={0.7}
                  >
                    <Icon name="message-square" size={18} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.historyItemText} numberOfLines={1}>
                      {convo.question || 'Untitled chat'}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>

          {/* Drawer Footer */}
          <View style={styles.drawerFooter}>
            <TouchableOpacity 
              style={styles.drawerFooterButton}
              onPress={() => {
                toggleDrawer();
                navigation.navigate('Profile');
              }}
            >
              <Icon name="user" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.drawerFooterText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.drawerFooterButton}
              onPress={toggleTheme}
            >
              <Icon name={isDarkMode ? "sun" : "moon"} size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.drawerFooterText}>{isDarkMode ? "Light" : "Dark"}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.drawerFooterButton}
              onPress={() => {
                toggleDrawer();
                navigation.navigate('About');
              }}
            >
              <Icon name="info" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.drawerFooterText}>About</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header Section */}
        <LinearGradient
          colors={colors.headerGradient}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.menuIcon} 
              activeOpacity={0.7}
              onPress={toggleDrawer}
            >
              <Icon name="menu" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.welcomeText}>Athravanavira</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileIconButton} 
              activeOpacity={0.7} 
              onPress={() => navigation.navigate('Profile')}
            >
              <ProfileIcon 
                size={40}
                name={currentUser?.displayName || 'Guest'}
                imageUri={currentUser?.photoURL}
                isGuest={isGuest}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Start Learning Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Start Learning</Text>
            <View style={[styles.inputCard, { backgroundColor: colors.surface }]}>
              {/* Image Input Option */}
              <TouchableOpacity 
                style={[styles.inputOption, styles.imageInputOption]}
                onPress={handleImageInput}
                activeOpacity={0.8}
              >
                <View style={styles.inputIconContainer}>
                  <Icon name="camera" size={24} color="white" />
                </View>
                <View style={styles.inputTextContainer}>
                  <Text style={styles.inputTitle}>Image Input</Text>
                  <Text style={styles.inputSubtitle}>Upload Vedic text or formula</Text>
                </View>
              </TouchableOpacity>

              {/* Text Input Option */}
              <TouchableOpacity 
                style={[styles.inputOption, styles.textInputOption]}
                onPress={handleTextInput}
                activeOpacity={0.8}
              >
                <View style={[styles.inputIconContainer, styles.textIconContainer]}>
                  <Text style={styles.textIcon}>T</Text>
                </View>
                <View style={styles.inputTextContainer}>
                  <Text style={[styles.inputTitle, styles.textInputTitle]}>Text Input</Text>
                  <Text style={[styles.inputSubtitle, styles.textInputSubtitle]}>Type your query directly</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Access Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Access</Text>
            <View style={styles.quickAccessContainer}>
              <TouchableOpacity 
                style={[styles.quickAccessCard, { backgroundColor: colors.surface }]}
                onPress={() => navigation.navigate('Explore')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickAccessIconContainer, { backgroundColor: isDarkMode ? '#7C2D12' : '#FEF3C7' }]}>
                  <Icon name="compass" size={32} color="#F59E0B" />
                </View>
                <Text style={[styles.quickAccessTitle, { color: colors.text }]}>Explore</Text>
                <Text style={[styles.quickAccessSubtitle, { color: colors.textSecondary }]}>Discover wisdom</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.quickAccessCard, { backgroundColor: colors.surface }]}
                onPress={handleHowItWorks}
                activeOpacity={0.7}
              >
                <View style={styles.quickAccessIconContainer}>
                  <Icon name="help-circle" size={32} color={colors.textSecondary} />
                </View>
                <Text style={[styles.quickAccessTitle, { color: colors.text }]}>How It Works</Text>
                <Text style={[styles.quickAccessSubtitle, { color: colors.textSecondary }]}>Learn the process</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.quickAccessCard, { backgroundColor: colors.surface }]}
                onPress={handleAboutVedAI}
                activeOpacity={0.7}
              >
                <View style={styles.quickAccessIconContainer}>
                  <Icon name="info" size={32} color={colors.textSecondary} />
                </View>
                <Text style={[styles.quickAccessTitle, { color: colors.text }]}>About Athravanavira</Text>
                <Text style={[styles.quickAccessSubtitle, { color: colors.textSecondary }]}>Our mission</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Queries Section */}
          <View style={[styles.section, styles.lastSection]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Queries</Text>
              {recentSearches.length > 0 && (
                <TouchableOpacity onPress={loadRecentSearches}>
                  <Icon name="refresh-cw" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            {loadingSearches ? (
              <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <Icon name="loader" size={48} color={colors.border} style={styles.emptyIcon} />
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>Loading...</Text>
              </View>
            ) : recentSearches.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <Icon name="clock" size={48} color={colors.border} style={styles.emptyIcon} />
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No recent queries yet</Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.textTertiary }]}>Your recent searches will appear here</Text>
              </View>
            ) : (
              <View>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={search.id || index}
                    style={[styles.recentSearchCard, { backgroundColor: colors.surface }]}
                    onPress={() => handleRecentSearchPress(search)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.recentSearchHeader}>
                      <View style={[styles.languageBadge, { 
                        backgroundColor: search.language === 'Hindi' ? '#DBEAFE' : 
                                        search.language === 'Sanskrit' ? '#FEF3C7' : '#F3E8FF' 
                      }]}>
                        <Text style={styles.languageBadgeText}>
                          {search.language === 'English' ? '🇬🇧' : 
                           search.language === 'Hindi' ? '🇮🇳' : '🕉️'} {search.language}
                        </Text>
                      </View>
                      <Text style={[styles.recentSearchTime, { color: colors.textTertiary }]}>
                        {search.timestamp ? new Date(search.timestamp).toLocaleDateString() : ''}
                      </Text>
                    </View>
                    <Text style={[styles.recentSearchQuestion, { color: colors.text }]} numberOfLines={2}>
                      {search.question}
                    </Text>
                    {search.preview && (
                      <Text style={[styles.recentSearchPreview, { color: colors.textSecondary }]} numberOfLines={2}>
                        {search.preview}
                      </Text>
                    )}
                    <View style={styles.recentSearchFooter}>
                      <Icon name="repeat" size={14} color={colors.textSecondary} />
                      <Text style={[styles.recentSearchAction, { color: colors.textSecondary }]}>
                        Tap to search again
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
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
    backgroundColor: '#F0EDE6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'System',
  },
  profileIconButton: {
    // No extra styling needed - ProfileIcon component handles its own styling
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  section: {
    marginBottom: 30,
  },
  lastSection: {
    marginBottom: 50,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 20,
    fontFamily: 'System',
  },
  inputCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  imageInputOption: {
    backgroundColor: '#FF9500',
  },
  textInputOption: {
    backgroundColor: '#1E3A8A',
    marginBottom: 0,
  },
  inputIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  textIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'System',
  },
  inputTextContainer: {
    flex: 1,
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
    fontFamily: 'System',
  },
  inputSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'System',
  },
  textInputTitle: {
    color: 'white',
  },
  textInputSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 120,
    justifyContent: 'center',
  },
  quickAccessIconContainer: {
    marginBottom: 15,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'System',
  },
  quickAccessSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'System',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 150,
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: 15,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 5,
    fontFamily: 'System',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontFamily: 'System',
  },
  // Recent Searches Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recentSearchCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  recentSearchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  languageBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  recentSearchTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  recentSearchQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 22,
  },
  recentSearchPreview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  recentSearchFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  recentSearchAction: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  // Drawer Styles
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 1000,
    elevation: 10,
  },
  drawerGradient: {
    flex: 1,
    paddingTop: 50,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  drawerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'System',
  },
  closeDrawer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerActions: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  newChatText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    fontFamily: 'System',
  },
  tempChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.3)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.5)',
  },
  tempChatText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    fontFamily: 'System',
  },
  historySection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  historySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'System',
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  historyItemText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    marginLeft: 12,
    flex: 1,
    fontFamily: 'System',
  },
  guestPrompt: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  guestPromptText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: 'System',
  },
  signInButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyHistoryText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    marginTop: 12,
    fontFamily: 'System',
  },
  drawerFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  drawerFooterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  drawerFooterText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    marginLeft: 8,
    fontFamily: 'System',
  },
});

export default Homescreen;