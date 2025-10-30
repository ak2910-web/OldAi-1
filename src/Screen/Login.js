import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Check and handle existing sign-in
  React.useEffect(() => {
    const checkSignInStatus = async () => {
      try {
        // Check if user is signed in with Firebase
        const currentUser = auth().currentUser;
        if (currentUser) {
          await auth().signOut();
        }
        
        // Check if user is signed in with Google
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
          await GoogleSignin.signOut();
        }
      } catch (error) {
        console.error('Error checking sign-in status:', error);
      }
    };
    
    checkSignInStatus();
  }, []);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Password validation
  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    try {
      // Attempt to sign in with Firebase
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      if (userCredential.user) {
        navigation.replace('Home');
      }
    } catch (error) {
      let errorMessage = 'An error occurred during login';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Invalid password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later';
          break;
      }
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    // Navigate to sign up screen
    navigation.navigate('Signup');
  };

  // Configure Google Signin
  React.useEffect(() => {
    // Web client ID from google-services.json (OAuth client type 3)
    GoogleSignin.configure({
      webClientId: '215577452779-s4ljb43bjj3430ebh9iepic9evf91h14.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      // Check Play Services first
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Make sure we're signed out before attempting sign in
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.signOut();
        // Small delay to ensure sign out is complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Clear any existing Firebase auth state
      const currentUser = auth().currentUser;
      if (currentUser) {
        await auth().signOut();
        // Small delay to ensure sign out is complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Now attempt sign in
      console.log('Starting Google Sign In...');
      const { idToken, user } = await GoogleSignin.signIn();
      console.log('Google Sign In successful:', user?.email);
      
      if (!idToken) {
        throw new Error('No ID token received from Google Sign-In');
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Sign-in the user with the credential
      console.log('Signing in to Firebase with credential...');
      const userCredential = await auth().signInWithCredential(googleCredential);
      console.log('Firebase Sign In successful:', userCredential.user.email);
      
      navigation.replace('Home');
    } catch (error) {
            console.error('Google sign-in error:', error);
      let errorMessage = 'Unable to sign in with Google';
      
      // More detailed error logging
      if (error?.code) {
        console.log('Error code:', error.code);
      }
      if (error?.message) {
        console.log('Error message:', error.message);
      }
      
      if (error?.code) {
        switch (error.code) {
          case 'SIGN_IN_CANCELLED':
            errorMessage = 'Sign in was cancelled';
            break;
          case 'SIGN_IN_REQUIRED':
            errorMessage = 'Sign in is required';
            break;
          case 'PLAY_SERVICES_NOT_AVAILABLE':
            errorMessage = 'Google Play Services is not available';
            break;
          case '12501': // This is a common Google Sign-In error code
            errorMessage = 'Sign in was cancelled by user';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'The credential is invalid. Please try again.';
            break;
          default:
            errorMessage = error.message || 'An unexpected error occurred';
            break;
        }
      }
      
      Alert.alert(
        'Google Sign-In Error',
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => {
              // Clean up state before retrying
              GoogleSignin.signOut().catch(() => {});
              auth().signOut().catch(() => {});
            }
          },
          { text: 'OK' }
        ]
      );
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
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>VedAI</Text>
          <Text style={styles.tagline}>Ancient Wisdom Through AI</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formContainer}
      >
        <View>
          <View style={styles.inputContainer}>
            <Icon name="mail" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) validateEmail(text);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={() => validateEmail(email)}
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        <View>
          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) validatePassword(text);
              }}
              secureTextEntry={!showPassword}
              onBlur={() => validatePassword(password)}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              <Icon 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#6B7280" 
              />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={() => Alert.alert('Coming Soon', 'Password reset will be available soon!')}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signupButton}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        
        {/* Google Sign-In */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Icon name="google" size={20} color="#DB4437" style={{ marginRight: 10 }} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0EDE6',
  },
  header: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  passwordInput: {
    paddingRight: 40,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#1E3A8A',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9500',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signupButton: {
    color: '#1E3A8A',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 16,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    height: 56,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
});

export default Login;