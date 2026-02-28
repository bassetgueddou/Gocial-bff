import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../../src/contexts/AuthContext";

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};
type NavigationProp = StackNavigationProp<RootStackParamList>;

const Login: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { login } = useAuth();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      // Navigation handled automatically by AuthContext → AppNavigator
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Identifiants incorrects ou serveur indisponible.";
      Alert.alert("Connexion échouée", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#004C82", "#065C98"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1 justify-between items-center px-6 pb-14">
          {/* Titre de l'App */}
          <View className="flex-1 justify-center">
            <Text className="text-white text-5xl font-bold">Gocial</Text>
          </View>

          {/* Formulaire ou boutons */}
          <View className="w-full gap-4">
            {showEmailForm ? (
              <>
                {/* Email input */}
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Adresse email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="bg-white rounded-full py-3 px-6 text-black text-lg"
                />

                {/* Password input */}
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mot de passe"
                  placeholderTextColor="#999"
                  secureTextEntry
                  className="bg-white rounded-full py-3 px-6 text-black text-lg"
                />

                {/* Login button */}
                <TouchableOpacity
                  onPress={handleEmailLogin}
                  disabled={loading}
                  className="bg-white rounded-full py-3 px-6 w-full"
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? (
                    <ActivityIndicator color="#004C82" />
                  ) : (
                    <Text className="text-[#004C82] text-lg text-center font-bold">
                      Se connecter
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Back to options */}
                <TouchableOpacity onPress={() => setShowEmailForm(false)}>
                  <Text className="text-white text-center text-base mt-2">
                    ← Retour aux options
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity className="flex-row items-center bg-white rounded-full py-3 px-6 w-full">
                  <Image source={require("../../img/apple-logo.png")} className="w-6 h-6 mr-3" />
                  <Text className="text-black text-lg text-center flex-1">Connexion Apple</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center bg-white rounded-full py-3 px-6 w-full">
                  <Image source={require("../../img/google-logo.png")} className="w-6 h-6 mr-3" />
                  <Text className="text-black text-lg text-center flex-1">Connexion Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowEmailForm(true)}
                  className="flex-row items-center bg-white rounded-full py-3 px-6 w-full"
                >
                  <Image source={require("../../img/email-logo.png")} className="w-6 h-6 mr-3" />
                  <Text className="text-black text-lg text-center flex-1">Connexion Email</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center bg-white rounded-full py-3 px-6 w-full">
                  <Image source={require("../../img/facebook-logo.png")} className="w-6 h-6 mr-3" />
                  <Text className="text-black text-lg text-center flex-1">Connexion Facebook</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Inscription link */}
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text className="text-white text-center text-base mt-4">
                Pas encore de compte ?{" "}
                <Text className="font-bold underline">S'inscrire</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default Login;
