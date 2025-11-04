import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import auth from '@react-native-firebase/auth';

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Validation', 'Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      await auth().sendPasswordResetEmail(email.trim());
      Alert.alert('Email sent', 'Check your inbox for reset instructions.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      let msg = 'Failed to send reset email.';
      if (e?.code === 'auth/user-not-found') msg = 'No account found for this email.';
      if (e?.code === 'auth/invalid-email') msg = 'Invalid email address.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF9500" />
      <LinearGradient
        colors={['#FF9500', '#FFD700']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Forgot Password</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.infoText}>Enter your email to receive a password reset link.</Text>
        <View style={styles.inputContainer}>
          <Icon name="mail" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity style={[styles.resetButton, loading && styles.disabled]} onPress={handleReset} disabled={loading}>
          <Text style={styles.resetText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EDE6' },
  header: { paddingTop: 20, paddingBottom: 20, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  backButton: { padding: 8 },
  content: { padding: 20 },
  infoText: { color: '#374151', marginBottom: 16 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12,
    paddingHorizontal: 16, height: 56, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 3, marginBottom: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#374151' },
  resetButton: {
    backgroundColor: '#1E3A8A', borderRadius: 12, height: 52, justifyContent: 'center', alignItems: 'center',
  },
  resetText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.7 },
});

export default ForgotPassword;


