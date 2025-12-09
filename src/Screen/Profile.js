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
        const conversations = await getUserConversations(1000);
        const textCount = conversations.filter(c => c.type === 'text').length;
        const imageCount = conversations.filter(c => c.type === 'image').length;
        
        setStats({
          totalConversations: conversations.length,
          textQuestions: textCount,
          imageQuestions: imageCount,
          lastUsed: conversations[0]?.timestamp || conversations[0]?.createdAt,
          memberSince: currentUser.metadata.creationTime,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    } else {
      setUser(null);
      // Load guest stats
      const guestStats = await getGuestStats();
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
            showBadge={true}
          />
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

        {/* Statistics Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Your Activity</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Icon name="message-circle" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalConversations}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Chats</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#3B82F6' + '20' }]}>
                <Icon name="edit" size={24} color="#3B82F6" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.textQuestions}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Text Questions</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#10B981' + '20' }]}>
                <Icon name="image" size={24} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.imageQuestions}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Image Questions</Text>
            </View>
          </View>
          {stats.memberSince && (
            <View style={styles.memberInfo}>
              <Icon name="calendar" size={16} color={colors.textSecondary} />
              <Text style={[styles.memberText, { color: colors.textSecondary }]}>
                Member since {new Date(stats.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}> 
          <Text style={[styles.cardTitle, { color: colors.text }]}>Account</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
            <View style={styles.rowRight}>
              <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>{user?.email}</Text>
            </View>
          </View>
        </View>

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
    borderWidth: 2,
    borderColor: '#FF9500',
  },
  signupButtonText: {
    color: '#FF9500',
    fontSize: 18,
    fontWeight: '600',
  },
  continueGuestButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  continueGuestText: {
    color: '#666',
    fontSize: 16,
  },
  guestFeatures: {
    width: '100%',
    marginTop: 32,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  guestFeaturesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#333',
  },
});

export default Profile;
