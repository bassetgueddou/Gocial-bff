import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTheme } from "../ThemeContext";
import Toast from "react-native-toast-message";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import type { InlineErrors } from "../../src/types";

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};
type NavigationProp = StackNavigationProp<RootStackParamList>;

const Login: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { login } = useAuth();
  const { isDarkMode } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<InlineErrors>({});

  const clearError = (field: string) => setErrors(prev => ({ ...prev, [field]: '' }));

  const parseBackendError = (message: string): Partial<InlineErrors> => {
    const lower = message.toLowerCase();
    if (lower.includes('email')) return { email: message };
    if (lower.includes('mot de passe') || lower.includes('password') || lower.includes('identifiant')) return { password: message };
    return {};
  };

  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    const validationErrors: InlineErrors = {};
    if (!email.trim()) validationErrors.email = "L'email est obligatoire.";
    if (!password.trim()) validationErrors.password = 'Le mot de passe est obligatoire.';
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setErrorMessage("Veuillez remplir tous les champs.");
      return;
    }
    setErrorMessage(null);
    setErrors({});
    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      // Navigation handled automatically by AuthContext → AppNavigator
    } catch (err: unknown) {
      if (__DEV__) {
        const debugErr = err as { response?: { status?: number; data?: unknown }; message?: string };
        console.log('[Login] Error:', debugErr?.response?.status, debugErr?.response?.data, debugErr?.message);
      }
      const apiErr = err as { response?: { data?: { error?: string; message?: string } } };
      const message =
        apiErr?.response?.data?.error ||
        apiErr?.response?.data?.message ||
        "Identifiants incorrects ou serveur indisponible.";
      const fieldErrors = parseBackendError(message);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...fieldErrors }) as InlineErrors);
      }
      setErrorMessage(message);
      Toast.show({ type: 'error', text1: message, position: 'top', topOffset: 60 });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Toast.show({
      type: "info",
      text1: "Bientôt disponible",
      position: "top",
      topOffset: 60,
    });
  };

  const handleForgotPassword = () => {
    Toast.show({
      type: "info",
      text1: "Bientôt disponible",
      position: "top",
      topOffset: 60,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"}`}
    >
      <SafeAreaView className="flex-1">
        <Animated.View style={{ flex: 1, opacity }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            className="px-6"
          >
            {/* Logo + sous-titre */}
            <View className="items-center mb-10 mt-8">
              <Image
                source={require('../../img/ic_launcher.png')}
                className="w-36 h-36 rounded-2xl"
                resizeMode="contain"
              />
              <Text
                className={`text-3xl font-bold ${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"}`}
              >
                Gocial
              </Text>
              <Text className="text-gray-500 text-sm text-center mt-2">
                Rejoignez la communauté
              </Text>
            </View>

            {/* Bouton Google */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              className={`flex-row items-center justify-center rounded-xl py-3.5 mb-4 border ${isDarkMode
                ? "border-gray-700 bg-[#1D1E20]"
                : "border-gray-200 bg-white"
                }`}
            >
              <Image
                source={require('../../img/google-logo.png')}
                className="w-5 h-5 mr-4"
                resizeMode="contain"
              />
              <Text
                className={`text-base font-medium text-center ${isDarkMode ? "text-white" : "text-black"}`}
              >
                Continuer avec Google
              </Text>
            </TouchableOpacity>

            {/* Séparateur */}
            <View className="flex-row items-center my-5">
              <View
                className={`flex-1 h-px ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}
              />
              <Text className="mx-3 text-gray-600 text-sm">ou</Text>
              <View
                className={`flex-1 h-px ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}
              />
            </View>

            {/* Erreur inline */}
            {errorMessage ? (
              <View className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
                <Text className="text-red-600 text-sm text-center">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            <Text className="mb-1 ml-1">Adresse email</Text>
            {/* Input email */}
            <TextInput
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setErrorMessage(null);
                clearError('email');
              }}
              placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className={`rounded-xl px-4 py-3.5 text-base leading-tight ${errors.email ? 'mb-1' : 'mb-4'} ${isDarkMode
                ? "bg-[#1D1E20] text-white"
                : "bg-[#F2F5FA] text-black"
                }`}
            />
            {errors.email ? <Text className="text-red-500 text-xs mb-3 ml-1">{errors.email}</Text> : null}

            <Text className="mb-1 ml-1">Mot de passe</Text>
            {/* Input mot de passe */}
            <View className={`relative ${errors.password ? 'mb-1' : 'mb-4'}`}>
              <TextInput
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setErrorMessage(null);
                  clearError('password');
                }}
                placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
                secureTextEntry={!showPassword}
                className={`rounded-xl px-4 py-3.5 text-base pr-14 leading-tight ${isDarkMode
                  ? "bg-[#1D1E20] text-white"
                  : "bg-[#F2F5FA] text-black"
                  }`}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={{ position: "absolute", right: 14, top: 14 }}
              >
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={20}
                color={isDarkMode ? "white" : "black"}
              />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text className="text-red-500 text-xs mb-3 ml-1">{errors.password}</Text> : null}

            {/* Bouton SE CONNECTER */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
              className={`rounded-xl py-3.5 items-center mt-6 mb-4 ${isDarkMode ? "bg-[#1A6EDE]" : "bg-black"
                }`}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-semibold text-base tracking-widest">
                  SE CONNECTER
                </Text>
              )}
            </TouchableOpacity>

            {/* Mot de passe oublié */}
            <TouchableOpacity onPress={handleForgotPassword} className="mb-6">
              <Text
                className={`text-sm text-center ${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"}`}
              >
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>

            {/* Pas de compte */}
            <View className="items-center pb-8">
              <Text className="text-gray-500 text-sm text-center">
                Pas de compte ?{" "}
                <Text
                  className={`underline ${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"}`}
                  onPress={() => navigation.navigate("Register")}
                >
                  Créez-en un
                </Text>
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Login;

