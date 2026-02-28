// Stub for react-native-maps on web
import React from 'react';
import { View, Text } from 'react-native';

const MapView = ({ children, style, ...props }) => (
  <View style={[{ backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }, style]}>
    <Text style={{ color: '#666' }}>Map (web non disponible)</Text>
    {children}
  </View>
);

MapView.Marker = ({ children }) => <>{children}</>;
MapView.Callout = ({ children }) => <>{children}</>;

export default MapView;
export const Marker = MapView.Marker;
export const Callout = MapView.Callout;
export const PROVIDER_GOOGLE = 'google';
