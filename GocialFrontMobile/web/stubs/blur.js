// Stub for @react-native-community/blur on web
import React from 'react';
import { View } from 'react-native';

const BlurView = ({ children, style, ...props }) => (
  <View style={[{ backdropFilter: 'blur(10px)' }, style]}>{children}</View>
);

export default BlurView;
