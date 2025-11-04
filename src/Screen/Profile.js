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
} from 'react-native';
// LinearGradient removed — header uses simple View
import Icon from 'react-native-vector-icons/Feather';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      setUser({
        email: currentUser.email,
        displayName: currentUser.displayName || 'VedAI User',
        photoURL: currentUser.photoURL || null,
      });
    }
    // load persisted theme
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('@vedai:darkMode');
        if (stored !== null) setDarkMode(stored === 'true');
        const notif = await AsyncStorage.getItem('@vedai:notifications');
        if (notif !== null) setNotificationsEnabled(notif === 'true');
      } catch (e) {
        // ignore
      }
    })();
    setLoading(false);
  }, []);

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

  const toggleDarkMode = async (value) => {
    setDarkMode(value);
    try {
      await AsyncStorage.setItem('@vedai:darkMode', value ? 'true' : 'false');
    } catch (e) {}
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

  // theme colors
  const theme = darkMode
    ? {
        background: '#0F172A',
        card: '#111827',
        text: '#E5E7EB',
        subtext: '#9CA3AF',
        accent: '#FFB84D',
        surface: '#0B1220',
      }
    : {
        background: '#F5F5DC',
        card: '#FFFFFF',
        text: '#111827',
        subtext: '#6B7280',
        accent: '#F59E0B',
        surface: '#FFFFFF',
      };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
      {/* Use native navigator header — remove in-screen back button/title to avoid duplicates */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}> 
        <View style={styles.headerContent}>
          <View style={styles.placeholder} />
        </View>
      </View>

      <View style={styles.profileContent}>
        <View style={styles.avatarContainer}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.card }]}> 
              <Icon name="user" size={40} color={theme.subtext} />
            </View>
          )}
          <TouchableOpacity style={[styles.editAvatarButton, { backgroundColor: theme.accent }]} onPress={handleEditProfile}>
            <Icon name="edit-2" size={16} color="white" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.displayName, { color: theme.text }]}>{user?.displayName}</Text>
        <Text style={[styles.roleText, { color: theme.subtext }]}>Vedic Scholar</Text>

        <TouchableOpacity style={[styles.mainEditButton, { backgroundColor: theme.accent }]} onPress={handleEditProfile}>
          <Text style={styles.mainEditButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <View style={[styles.card, { backgroundColor: theme.card }]}> 
          <Text style={[styles.cardTitle, { color: theme.text }]}>Account</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.subtext }]}>Email</Text>
            <View style={styles.rowRight}>
              <Text style={[styles.value, { color: theme.text }]}>{user?.email}</Text>
              <TouchableOpacity>
                <Text style={[styles.changeText, { color: theme.accent }]}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.subtext }]}>Phone</Text>
            <View style={styles.rowRight}>
              <Text style={[styles.value, { color: theme.text }]}>+91 98765 43210</Text>
              <TouchableOpacity>
                <Text style={[styles.changeText, { color: theme.accent }]}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.subtext }]}>Password</Text>
            <View style={styles.rowRight}>
              <Text style={[styles.value, { color: theme.text }]}>••••••••</Text>
              <TouchableOpacity>
                <Text style={[styles.changeText, { color: theme.accent }]}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card }]}> 
          <Text style={[styles.cardTitle, { color: theme.text }]}>Settings</Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Notifications</Text>
            <Switch value={notificationsEnabled} onValueChange={toggleNotifications} thumbColor={notificationsEnabled ? theme.accent : '#fff'} />
          </View>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={toggleDarkMode} thumbColor={darkMode ? '#111' : '#fff'} trackColor={{ true: '#9CA3AF', false: '#E5E7EB' }} />
          </View>
        </View>

        <TouchableOpacity style={[styles.logoutButtonFull, { backgroundColor: '#fff', borderColor: '#F87171', borderWidth: 1 }]} onPress={handleLogout}>
          <Text style={[styles.logoutTextFull, { color: '#F87171' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
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
  profileContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
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
});

export default Profile;