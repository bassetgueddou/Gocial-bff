// Stub for @react-native-community/blur on web
import React from 'react';
import { View } from 'react-native-web';

export const BlurView = ({ children, style, blurType, blurAmount, ...props }) => (
  <View style={[{ backdropFilter: `blur(${blurAmount || 10}px)`, WebkitBackdropFilter: `blur(${blurAmount || 10}px)` }, style]} {...props}>
    {children}
  </View>
);

export default BlurView;
