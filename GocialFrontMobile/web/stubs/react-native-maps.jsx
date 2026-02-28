// Stub for react-native-maps on web
import React from 'react';
import { View, Text } from 'react-native-web';

const MapView = ({ children, style, ...props }) => (
  <View style={[{ backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', minHeight: 200 }, style]}>
    <Text style={{ color: '#666' }}>Carte indisponible sur le web</Text>
    {children}
  </View>
);

const Marker = ({ children }) => <>{children}</>;
const Callout = ({ children }) => <>{children}</>;
const Circle = () => null;
const Polygon = () => null;
const Polyline = () => null;

MapView.Marker = Marker;
MapView.Callout = Callout;

export default MapView;
export { Marker, Callout, Circle, Polygon, Polyline };
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = null;
