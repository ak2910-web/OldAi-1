import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

const FooterNavigation = () => {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const navItems = [
    {
      name: 'Home',
      icon: 'home',
      label: 'Home',
      onPress: () => navigation.navigate('Home'),
    },
    {
      name: 'Explore',
      icon: 'compass',
      label: 'Explore',
      onPress: () => navigation.navigate('Explore'),
    },
    {
      name: 'Saved',
      icon: 'bookmark',
      label: 'Saved',
      onPress: () => {
        // Navigate to saved conversations - you can create this screen later
        console.log('Saved conversations');
        // For now, show a message or navigate to Profile
        navigation.navigate('Profile');
      },
    },
    {
      name: 'Profile',
      icon: 'user',
      label: 'Profile',
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  const isActive = (itemName) => {
    return route.name === itemName;
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
    }]}>
      {navItems.map((item, index) => {
        const active = isActive(item.name);
        return (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              active && { backgroundColor: colors.primary + '15' }
            ]}>
              <Icon
                name={item.icon}
                size={24}
                color={active ? colors.primary : colors.textSecondary}
              />
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: active ? colors.primary : colors.textSecondary,
                  fontWeight: active ? '600' : '400',
                },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    paddingHorizontal: 4,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8, // Extra padding for iOS home indicator
    borderTopWidth: 1,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    minHeight: Platform.OS === 'ios' ? 80 : 65,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    minWidth: isSmallDevice ? 70 : 80,
  },
  iconContainer: {
    width: isSmallDevice ? 36 : 40,
    height: isSmallDevice ? 36 : 40,
    borderRadius: isSmallDevice ? 10 : 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    transition: 'all 0.3s ease',
  },
  label: {
    fontSize: isSmallDevice ? 11 : 12,
    fontFamily: 'System',
    textAlign: 'center',
  },
});

export default FooterNavigation;
