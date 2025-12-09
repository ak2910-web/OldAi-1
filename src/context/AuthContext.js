import React, { createContext, useContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [guestId, setGuestId] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for logged-in user
        const currentUser = auth().currentUser;
        
        if (currentUser) {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || 'User',
            photoURL: currentUser.photoURL,
          });
          setIsGuest(false);
        } else {
          // Check for existing guest session
          let storedGuestId = await AsyncStorage.getItem('@vedai:guestId');
          if (!storedGuestId) {
            // Create new guest ID
            storedGuestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await AsyncStorage.setItem('@vedai:guestId', storedGuestId);
          }
          setGuestId(storedGuestId);
          setIsGuest(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL,
        });
        setIsGuest(false);
        setGuestId(null);
      } else {
        setUser(null);
        // Set up guest mode
        let storedGuestId = await AsyncStorage.getItem('@vedai:guestId');
        if (!storedGuestId) {
          storedGuestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await AsyncStorage.setItem('@vedai:guestId', storedGuestId);
        }
        setGuestId(storedGuestId);
        setIsGuest(true);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    try {
      await auth().signOut();
      // Create new guest ID after logout
      const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('@vedai:guestId', newGuestId);
      setGuestId(newGuestId);
      setIsGuest(true);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const getUserId = () => {
    return user?.uid || guestId || 'anonymous';
  };

  const value = {
    user,
    loading,
    isGuest,
    guestId,
    signOut,
    getUserId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
