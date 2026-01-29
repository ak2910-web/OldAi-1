import React from 'react';
import { StatusBar } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const StatusBarThemed = () => {
  const { isDarkMode, colors } = useTheme();

  return (
    <StatusBar
      barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={colors.surface}
    />
  );
};

export default StatusBarThemed;
