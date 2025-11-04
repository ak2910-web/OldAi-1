import React from 'react';
import Feather from 'react-native-vector-icons/Feather';

// React Native friendly back arrow using react-native-vector-icons
// Accepts size, color and style via props
export const ArrowLeftIcon = ({ size = 24, color = '#000', style, ...props }) => (
  <Feather name="arrow-left" size={size} color={color} style={style} {...props} />
);

export default ArrowLeftIcon;
