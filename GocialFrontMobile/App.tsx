import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "./screens/ThemeContext";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import AppNavigator from "./navigation/AppNavigator";
import Toast from 'react-native-toast-message';
import ErrorBoundary from "./src/components/ErrorBoundary";

const SplashScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#004C82' }}>
    <Text style={{ color: 'white', fontSize: 40, fontWeight: 'bold', marginBottom: 20 }}>Gocial</Text>
    <ActivityIndicator size="large" color="white" />
  </View>
);

const AppContent = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <Toast />
    </>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;

