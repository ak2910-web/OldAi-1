import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

const ProfileIcon = ({ 
  size = 40, 
  name = 'User', 
  showBadge = false,
  imageUri = null,
  style = {},
  textStyle = {},
  isGuest = false,
}) => {
  // Get initials from name
  const getInitials = (fullName) => {
    if (!fullName || fullName === 'Guest') return 'G';
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <LinearGradient
        colors={isGuest ? ['#9CA3AF', '#6B7280'] : ['#FFD700', '#FF9500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { borderRadius: size / 2 }]}
      >
        {imageUri ? (
          <Image 
            source={{ uri: imageUri }} 
            style={[styles.image, { borderRadius: size / 2 }]} 
          />
        ) : (
          <Text style={[styles.initials, { fontSize: size * 0.4 }, textStyle]}>
            {initials}
          </Text>
        )}
      </LinearGradient>

      {/* Badge indicator */}
      {showBadge && (
        <View style={[styles.badge, { width: size * 0.3, height: size * 0.3 }]}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.badgeGradient}
          >
            <Icon name="check" size={size * 0.18} color="#fff" />
          </LinearGradient>
        </View>
      )}

      {/* Guest indicator */}
      {isGuest && (
        <View style={[styles.guestBadge, { width: size * 0.35, height: size * 0.35 }]}>
          <View style={styles.guestBadgeInner}>
            <Icon name="user" size={size * 0.2} color="#6B7280" />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  initials: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: 100,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  guestBadgeInner: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileIcon;
