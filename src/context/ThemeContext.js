import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('themePreference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = {
    isDarkMode,
    colors: isDarkMode ? darkColors : lightColors,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Light Theme Colors
const lightColors = {
  // Primary Colors
  primary: '#FF9500',
  primaryDark: '#D35400',
  primaryLight: '#FFD700',
  
  // Background Colors
  background: '#F0EDE6',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text Colors
  text: '#374151',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Border Colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Status Colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Header Gradient
  headerGradient: ['#FF9500', '#FFD700'],
  
  // Drawer Gradient
  drawerGradient: ['#D35400', '#FF9500', '#FFD700'],
  
  // Shadow
  shadowColor: '#000',
  
  // Input Colors
  inputBackground: '#F9FAFB',
  inputBorder: '#E5E7EB',
  inputText: '#374151',
  inputPlaceholder: '#9CA3AF',
};

// Dark Theme Colors
const darkColors = {
  // Primary Colors
  primary: '#FF9500',
  primaryDark: '#D35400',
  primaryLight: '#FFD700',
  
  // Background Colors
  background: '#1A1A1A',
  surface: '#2A2A2A',
  card: '#333333',
  
  // Text Colors
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  textInverse: '#1F2937',
  
  // Border Colors
  border: '#404040',
  borderLight: '#363636',
  
  // Status Colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Header Gradient
  headerGradient: ['#D35400', '#FF9500'],
  
  // Drawer Gradient
  drawerGradient: ['#1A1A1A', '#2A2A2A', '#333333'],
  
  // Shadow
  shadowColor: '#000',
  
  // Input Colors
  inputBackground: '#333333',
  inputBorder: '#404040',
  inputText: '#F9FAFB',
  inputPlaceholder: '#9CA3AF',
};
