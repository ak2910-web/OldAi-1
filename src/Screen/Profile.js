import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
  ScrollView,
} from 'react-native';
// LinearGradient removed — header uses simple View
import Icon from 'react-native-vector-icons/Feather';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import FooterNavigation from '../components/FooterNavigation';
import ProfileIcon from '../components/ProfileIcon';
import { getUserConversations } from '../services/firebaseService';
import { getLocalConversations, getGuestStats } from '../services/localStorageService';

const Profile = ({ navigation }) => {
  const { isDarkMode, colors, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [stats, setStats] = useState({
    totalConversations: 0,
    textQuestions: 0,
    imageQuestions: 0,
    lastUsed: null,
    memberSince: null,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      setUser({
        email: currentUser.email,
        displayName: currentUser.displayName || 'VedAI User',
        photoURL: currentUser.photoURL || null,
      });
      // Load user stats from Firestore
      try {
        console.log('[PROFILE] Loading user conversations...');
        const conversations = await getUserConversations(1000);
        console.log('[PROFILE] Found conversations:', conversations.length);
        
        const textCount = conversations.filter(c => c.type === 'text').length;
        const imageCount = conversations.filter(c => c.type === 'image').length;
        
        // Calculate last used date
        let lastUsedDate = null;
        if (conversations.length > 0 && conversations[0]) {
          const conv = conversations[0];
          // Try different timestamp fields
          const timestamp = conv.timestamp || conv.createdAt;
          if (timestamp) {
            if (typeof timestamp === 'string') {
              lastUsedDate = timestamp;
            } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
              lastUsedDate = timestamp.toDate().toISOString();
            } else if (timestamp instanceof Date) {
              lastUsedDate = timestamp.toISOString();
            }
          }
        }
        
        setStats({
          totalConversations: conversations.length,
          textQuestions: textCount,
          imageQuestions: imageCount,
          lastUsed: lastUsedDate,
          memberSince: currentUser.metadata.creationTime,
        });
        
        console.log('[PROFILE] Stats loaded:', {
          total: conversations.length,
          text: textCount,
          image: imageCount,
        });
      } catch (error) {
        console.error('[ERROR] Error loading stats:', error);
        console.error('[ERROR] Error details:', error.message);
      }
    } else {
      setUser(null);
      // Load guest stats
      console.log('[PROFILE] Loading guest stats...');
      const guestStats = await getGuestStats();
      console.log('[PROFILE] Guest stats:', guestStats);
      if (guestStats) {
        setStats({
          totalConversations: guestStats.totalQuestions || 0,
          textQuestions: guestStats.totalTextQuestions || 0,
          imageQuestions: guestStats.totalImageQuestions || 0,
          lastUsed: guestStats.lastUsed,
          memberSince: guestStats.firstUsed,
        });
      }
    }
    // load persisted notifications
    try {
      const notif = await AsyncStorage.getItem('@vedai:notifications');
      if (notif !== null) setNotificationsEnabled(notif === 'true');
    } catch (e) {
      // ignore
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('ProfileEdit');
  };

  const toggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem('@vedai:notifications', value ? 'true' : 'false');
    } catch (e) {}
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9500" />
      </View>
    );
  }

  // If user is not logged in, show login/signup options
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.guestContainer}>
          <ProfileIcon 
            size={120} 
            name="Guest" 
            isGuest={true}
          />
          <Text style={[styles.guestTitle, { color: colors.text }]}>You're using Atharvanavira as a Guest</Text>
          <Text style={[styles.guestSubtitle, { color: colors.textSecondary }]}>
            Sign in to save your conversation history and access it across devices
          </Text>

          {/* Guest Statistics */}
          {stats.totalConversations > 0 && (
            <View style={[styles.guestStatsCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.guestStatsTitle, { color: colors.text }]}>Your Activity (Guest)</Text>
              <View style={styles.guestStatsGrid}>
                <View style={styles.guestStatItem}>
                  <Icon name="message-circle" size={32} color={colors.primary} />
                  <Text style={[styles.guestStatValue, { color: colors.text }]}>{stats.totalConversations}</Text>
                  <Text style={[styles.guestStatLabel, { color: colors.textSecondary }]}>Questions</Text>
                </View>
                <View style={styles.guestStatItem}>
                  <Icon name="edit" size={32} color="#3B82F6" />
                  <Text style={[styles.guestStatValue, { color: colors.text }]}>{stats.textQuestions}</Text>
                  <Text style={[styles.guestStatLabel, { color: colors.textSecondary }]}>Text</Text>
                </View>
                <View style={styles.guestStatItem}>
                  <Icon name="image" size={32} color="#10B981" />
                  <Text style={[styles.guestStatValue, { color: colors.text }]}>{stats.imageQuestions}</Text>
                  <Text style={[styles.guestStatLabel, { color: colors.textSecondary }]}>Image</Text>
                </View>
              </View>
              <Text style={[styles.guestStatsNote, { color: colors.textSecondary }]}>
                📱 This data is stored locally. Sign in to sync across devices!
              </Text>
            </View>
          )}

          <View style={styles.guestButtonContainer}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.continueGuestButton}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.continueGuestText}>Continue as Guest</Text>
          </TouchableOpacity>

          <View style={styles.guestFeatures}>
            <Text style={[styles.guestFeaturesTitle, { color: colors.text }]}>What you can do as a guest:</Text>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={20} color="#22C55E" />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>Ask unlimited questions</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={20} color="#22C55E" />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>Use image and text input</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={20} color="#22C55E" />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>Save chats locally on your device</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="x-circle" size={20} color="#EF4444" />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>Sync history across devices</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Navigation */}
        <FooterNavigation />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Use native navigator header — remove in-screen back button/title to avoid duplicates */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.profileContent}>
        <View style={styles.avatarContainer}>
          <ProfileIcon
            size={100}
            name={user?.displayName || 'VedAI User'}
            imageUri={user?.photoURL}
            showBadge={true} />
          <TouchableOpacity
            style={[styles.editAvatarButton, { backgroundColor: colors.primary }]}
            onPress={handleEditProfile}
          >
            <Icon name="edit-2" size={16} color="white" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.displayName, { color: colors.text }]}>{user?.displayName}</Text>
        <Text style={[styles.roleText, { color: colors.textSecondary }]}>Vedic Scholar</Text>

        <TouchableOpacity style={[styles.mainEditButton, { backgroundColor: colors.primary }]} onPress={handleEditProfile}>
          <Text style={styles.mainEditButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Enhanced Statistics Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Your Activity</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('History')}
              activeOpacity={0.7}
            >
              <View style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
                <Icon name="chevron-right" size={16} color="#FF9500" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Icon name="message-circle" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.totalConversations}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Chats</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#3B82F6' + '20' }]}>
                <Icon name="edit" size={24} color="#3B82F6" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.textQuestions}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Text Questions</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#10B981' + '20' }]}>
                <Icon name="image" size={24} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.imageQuestions}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Image Questions</Text>
            </View>
          </View>

          {/* Additional Stats Row */}
          <View style={[styles.additionalStats, { borderTopColor: colors.border }]}>
            {stats.lastUsed && (
              <View style={styles.additionalStatItem}>
                <Icon name="clock" size={16} color={colors.textSecondary} />
                <Text style={[styles.additionalStatText, { color: colors.textSecondary }]}>
                  Last active: {new Date(stats.lastUsed).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            )}

            {stats.memberSince && (
              <View style={styles.additionalStatItem}>
                <Icon name="calendar" size={16} color={colors.textSecondary} />
                <Text style={[styles.additionalStatText, { color: colors.textSecondary }]}>
                  Member since {new Date(stats.memberSince).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Account Info Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Account Information</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Icon name="mail" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderTopColor: colors.border }]}>
            <View style={styles.infoLeft}>
              <Icon name="user" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Display Name</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
              {user?.displayName}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderTopColor: colors.border }]}>
            <View style={styles.infoLeft}>
              <Icon name="shield" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Account Type</Text>
            </View>
            <View style={styles.accountBadge}>
              <Text style={styles.accountBadgeText}>Verified</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Settings</Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
            <Switch value={notificationsEnabled} onValueChange={toggleNotifications} thumbColor={notificationsEnabled ? colors.primary : '#fff'} />
          </View>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
            <Switch value={isDarkMode} onValueChange={toggleTheme} thumbColor={isDarkMode ? colors.primary : '#fff'} trackColor={{ true: '#9CA3AF', false: '#E5E7EB' }} />
          </View>
        </View>

        {/* Legal Section */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
    <Text style={[styles.cardTitle, { color: colors.text }]}>Legal</Text>

    <TouchableOpacity
      style={[styles.legalOption, { borderBottomColor: colors.border }]}
      onPress={() => navigation.navigate('LegalScreen', { type: 'privacy' })}
      activeOpacity={0.7}
    >
      <View style={styles.legalOptionLeft}>
        <View style={[styles.legalIconContainer, { backgroundColor: '#10B981' + '20' }]}>
          <Icon name="shield" size={20} color="#10B981" />
        </View>
        <View style={styles.legalTextContainer}>
          <Text style={[styles.legalOptionTitle, { color: colors.text }]}>Privacy Policy</Text>
          <Text style={[styles.legalOptionSubtitle, { color: colors.textSecondary }]}>
            How we protect your data
          </Text>
        </View>
      </View>
      <Icon name="chevron-right" size={20} color={colors.textSecondary} />
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.legalOption}
      onPress={() => navigation.navigate('LegalScreen', { type: 'terms' })}
      activeOpacity={0.7}
    >
      <View style={styles.legalOptionLeft}>
        <View style={[styles.legalIconContainer, { backgroundColor: '#3B82F6' + '20' }]}>
          <Icon name="file-text" size={20} color="#3B82F6" />
        </View>
        <View style={styles.legalTextContainer}>
          <Text style={[styles.legalOptionTitle, { color: colors.text }]}>Terms & Conditions</Text>
          <Text style={[styles.legalOptionSubtitle, { color: colors.textSecondary }]}>
            Rules and guidelines
          </Text>
        </View>
      </View>
      <Icon name="chevron-right" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  </View>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButtonFull, { backgroundColor: '#fff', borderColor: '#F87171', borderWidth: 1 }]} onPress={handleLogout}>
          <Text style={[styles.logoutTextFull, { color: '#F87171' }]}>Logout</Text>
        </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  profileContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#FF9500',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  displayName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  infoContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoTextContainer: {
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  editProfileText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#1E3A8A',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  mainEditButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  mainEditButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  card: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  // Enhanced Profile Styles
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
  },
  additionalStats: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 16,
    gap: 12,
  },
  additionalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  additionalStatText: {
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  accountBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  accountBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  memberText: {
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 12,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButtonFull: {
    marginTop: 24,
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutTextFull: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Guest view styles
  guestContainer: {
    flexGrow: 1,
    backgroundColor: '#F5F5DC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 100,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F',
    marginTop: 24,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  guestStatsCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  guestStatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  guestStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  guestStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  guestStatValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  guestStatLabel: {
    fontSize: 12,
  },
  guestStatsNote: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  guestButtonContainer: {
    width: '100%',
    marginTop: 32,
    gap: 12,
  },
  loginButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  signupButtonText: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
  },
  // Legal Section Styles
  legalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  legalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  legalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalTextContainer: {
    flex: 1,
  },
  legalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  legalOptionSubtitle: {
    fontSize: 13,
  },
});

export default Profile;
