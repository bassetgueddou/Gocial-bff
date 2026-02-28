// Stub for react-native-linear-gradient on web
import React from 'react';
import { View } from 'react-native-web';

const LinearGradient = ({ children, style, colors, start, end, ...props }) => {
  const gradient = colors && colors.length >= 2
    ? `linear-gradient(to bottom right, ${colors.join(', ')})`
    : undefined;

  return (
    <View style={[{ backgroundImage: gradient }, style]} {...props}>
      {children}
    </View>
  );
};

export default LinearGradient;
