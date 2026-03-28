import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import { useAuth } from "../../src/contexts/AuthContext";
import { authService } from "../../src/services/auth";
import { useTheme } from "../ThemeContext";
import AddressAutocomplete from "../../src/components/AddressAutocomplete";
import type { InlineErrors, AddressAutocompleteResult } from "../../src/types";

const getPasswordStrength = (pwd: string): number => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;
  return score;
};
const strengthColors = ['#EF4444', '#F97316', '#EAB308', '#22C55E'];
const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Fort'];

type RootStackParamList = {
  Login: undefined;
  RegisterPerson: undefined;
  RegisterProAsso: undefined;
  AddProfilePhotoProAsso: { registerData: import("../../src/types").RegisterData };
};
type NavigationProp = StackNavigationProp<RootStackParamList>;

const RegisterProAsso: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { register } = useAuth();
  const { isDarkMode } = useTheme();
  const [selectedType, setSelectedType] = useState<"pro" | "asso">("pro");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common fields
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [sector, setSector] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");

  // Pro-specific
  const [denomination, setDenomination] = useState("");
  const [siren, setSiren] = useState("");

  // Asso-specific
  const [title, setTitle] = useState("");
  const [rna, setRna] = useState("");

  const [errors, setErrors] = useState<InlineErrors>({});

  const passwordStrength = getPasswordStrength(password);

  const clearError = (field: string) => setErrors(prev => ({ ...prev, [field]: '' }));

  const validateEmailField = (val: string) => {
    setErrors(prev => {
      const u = { ...prev };
      if (!val.trim()) { u.email = "L'email est obligatoire"; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { u.email = "Format d'email invalide"; }
      else { delete u.email; }
      return u;
    });
  };

  const validatePasswordField = (val: string) => {
    setErrors(prev => {
      const u = { ...prev };
      if (!val) { u.password = 'Le mot de passe est obligatoire'; }
      else if (val.length < 8) { u.password = '8 caractères minimum'; }
      else if (!/[A-Z]/.test(val)) { u.password = '1 majuscule requise'; }
      else if (!/[a-z]/.test(val)) { u.password = '1 minuscule requise'; }
      else if (!/[0-9]/.test(val)) { u.password = '1 chiffre requis'; }
      else if (!/[^a-zA-Z0-9]/.test(val)) { u.password = '1 caractère spécial requis (!@#$%...).'; }
      else { delete u.password; }
      return u;
    });
  };

  const validatePseudoField = (val: string) => {
    setErrors(prev => {
      const u = { ...prev };
      if (val.length > 0 && val.length < 3) { u.pseudo = '3 caractères minimum'; } else { delete u.pseudo; }
      return u;
    });
  };

  const parseBackendError = (message: string): Partial<InlineErrors> => {
    const lower = message.toLowerCase();
    if (lower.includes('email')) return { email: message };
    if (lower.includes('mot de passe') || lower.includes('password')) return { password: message };
    if (lower.includes('pseudo')) return { pseudo: message };
    if (lower.includes('siren')) return { siren: message };
    if (lower.includes('rna')) return { rna: message };
    return {};
  };

  const handleRegister = async () => {
    // Inline validation
    const validationErrors: InlineErrors = {};
    if (selectedType === "pro") {
      if (!denomination.trim()) validationErrors.denomination = 'La dénomination est obligatoire.';
      if (!siren.trim()) validationErrors.siren = 'Le SIREN est obligatoire.';
    } else {
      if (!title.trim()) validationErrors.title = 'Le titre est obligatoire.';
      if (!rna.trim()) validationErrors.rna = 'Le numéro RNA est obligatoire.';
    }
    if (!companyName.trim()) validationErrors.company_name = 'Le nom visible est obligatoire.';
    if (!address.trim()) validationErrors.address = "L'adresse est obligatoire.";
    if (!sector.trim()) validationErrors.sector = "Le secteur d'activité est obligatoire.";
    if (!pseudo.trim()) {
      validationErrors.pseudo = 'Le pseudo est obligatoire.';
    } else if (pseudo.length < 3) {
      validationErrors.pseudo = '3 caractères minimum';
    }
    if (!email.trim()) {
      validationErrors.email = "L'email est obligatoire.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.email = "Format d'email invalide";
    }
    if (!password) {
      validationErrors.password = 'Le mot de passe est obligatoire.';
    } else if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
      validationErrors.password = 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 chiffre et 1 caractère spécial (!@#$%...).';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Veuillez corriger les champs indiqués.', position: 'top', topOffset: 60 });
      return;
    }

    // Vérifier disponibilité email + pseudo côté serveur
    setIsSubmitting(true);
    try {
      const [emailCheck, pseudoCheck] = await Promise.all([
        authService.checkEmail(email.trim().toLowerCase()),
        authService.checkPseudo(pseudo.trim()),
      ]);
      const serverErrors: InlineErrors = {};
      if (!emailCheck.available) {
        serverErrors.email = emailCheck.reason || 'Cet email est déjà utilisé';
      }
      if (!pseudoCheck.available) {
        serverErrors.pseudo = pseudoCheck.reason || 'Ce pseudo est déjà pris';
      }
      if (Object.keys(serverErrors).length > 0) {
        setErrors(serverErrors);
        Toast.show({
          type: 'error',
          text1: 'Inscription impossible',
          text2: Object.values(serverErrors).join('. '),
          position: 'top',
          topOffset: 60,
        });
        return;
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Erreur de connexion',
        text2: 'Impossible de vérifier la disponibilité. Réessaie.',
        position: 'top',
        topOffset: 60,
      });
      return;
    } finally {
      setIsSubmitting(false);
    }

    navigation.navigate("AddProfilePhotoProAsso", {
      registerData: {
        email: email.trim().toLowerCase(),
        password,
        pseudo: pseudo.trim(),
        company_name: companyName.trim(),
        address: address.trim(),
        profession: sector.trim(),
        user_type: selectedType,
        ...(selectedType === "pro"
          ? { first_name: denomination.trim(), siren: siren.trim() }
          : { first_name: title.trim(), rna: rna.trim() }
        ),
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="relative py-4 mt-4 flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="absolute left-0">
            <MaterialIcons name="arrow-back-ios" size={25} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold mx-auto">Inscription</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")} className="absolute right-0">
            <MaterialIcons name="close" size={25} color="black" />
          </TouchableOpacity>
        </View>

        <Text className="text-red-700 font-medium mt-4">* Obligatoire</Text>

        {/* Type selection */}
        <View className="mt-6 flex-row justify-between gap-4">
          <TouchableOpacity
            onPress={() => setSelectedType("pro")}
            className={`flex-1 px-6 py-4 rounded-md ${selectedType === "pro" ? "bg-[#2C5B90]" : "border border-[#2C5B90]"}`}
          >
            <Text className={`text-center font-medium ${selectedType === "pro" ? "text-white" : "text-[#2C5B90]"}`}>Pro</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedType("asso")}
            className={`flex-1 px-6 py-4 rounded-md ${selectedType === "asso" ? "bg-[#2C5B90]" : "border border-[#2C5B90]"}`}
          >
            <Text className={`text-center font-medium ${selectedType === "asso" ? "text-white" : "text-[#2C5B90]"}`}>Asso</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic fields */}
        <View className="mt-6 space-y-6">
          {selectedType === "pro" ? (
            <>
              <View className="mt-6">
                <Text className="text-base font-medium">Dénomination <Text className="text-red-700">*</Text></Text>
                <TextInput value={denomination} onChangeText={t => { setDenomination(t); clearError('denomination'); }} className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
                {errors.denomination ? <Text className="text-red-700 text-xs mt-1 ml-1">{errors.denomination}</Text> : null}
              </View>
              <View className="mt-6">
                <Text className="text-base font-medium">Siren <Text className="text-red-700">*</Text></Text>
                <TextInput value={siren} onChangeText={t => { setSiren(t); clearError('siren'); }} keyboardType="numeric" className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
                {errors.siren ? <Text className="text-red-700 text-xs mt-1 ml-1">{errors.siren}</Text> : null}
              </View>
            </>
          ) : (
            <>
              <View className="mt-6">
                <Text className="text-base font-medium">Titre <Text className="text-red-700">*</Text></Text>
                <TextInput value={title} onChangeText={t => { setTitle(t); clearError('title'); }} className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
                {errors.title ? <Text className="text-red-700 text-xs mt-1 ml-1">{errors.title}</Text> : null}
              </View>
              <View className="mt-6">
                <Text className="text-base font-medium">Numéro RNA <Text className="text-red-700">*</Text></Text>
                <TextInput value={rna} onChangeText={t => { setRna(t); clearError('rna'); }} className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
                {errors.rna ? <Text className="text-red-700 text-xs mt-1 ml-1">{errors.rna}</Text> : null}
              </View>
            </>
          )}

          <View className="mt-6">
            <Text className="text-base font-medium">Nom visible <Text className="text-red-700">*</Text></Text>
            <TextInput value={companyName} onChangeText={t => { setCompanyName(t); clearError('company_name'); }} className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
            {errors.company_name ? <Text className="text-red-700 text-xs mt-1 ml-1">{errors.company_name}</Text> : null}
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium">Adresse <Text className="text-red-700">*</Text></Text>
            <AddressAutocomplete
              onSelect={(result: AddressAutocompleteResult) => {
                setAddress(result.address);
                clearError('address');
              }}
              placeholder="Rechercher une adresse"
              isDarkMode={isDarkMode}
              initialValue={address}
              className="mt-2"
            />
            {errors.address ? <Text className="text-red-700 text-xs mt-1 ml-1">{errors.address}</Text> : null}
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium">Secteur d'activité <Text className="text-red-700">*</Text></Text>
            <TextInput value={sector} onChangeText={t => { setSector(t); clearError('sector'); }} className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
            {errors.sector ? <Text className="text-red-700 text-xs mt-1 ml-1">{errors.sector}</Text> : null}
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium">Pseudo <Text className="text-red-700">*</Text></Text>
            <TextInput
              value={pseudo}
              onChangeText={t => { setPseudo(t); clearError('pseudo'); }}
              onBlur={() => validatePseudoField(pseudo)}
              autoCapitalize="none"
              placeholder="(exemple : mon_entreprise)"
              className={`border rounded-md px-4 py-3 mt-2 ${errors.pseudo ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.pseudo ? <Text className="text-red-700 text-xs mt-1 ml-1">{errors.pseudo}</Text> : null}
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium">Email <Text className="text-red-700">*</Text></Text>
            <TextInput
              value={email}
              onChangeText={t => { setEmail(t); clearError('email'); }}
              onBlur={() => validateEmailField(email)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="contact@entreprise.com"
              className={`border rounded-md px-4 py-3 mt-2 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email ? <Text className="text-red-700 text-xs mt-1 ml-1">{errors.email}</Text> : null}
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium">Mot de passe <Text className="text-red-700">*</Text></Text>
            <TextInput
              value={password}
              onChangeText={t => { setPassword(t); clearError('password'); }}
              onBlur={() => validatePasswordField(password)}
              secureTextEntry
              placeholder="Minimum 8 caractères"
              className={`border rounded-md px-4 py-3 mt-2 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.password ? <Text className="text-red-700 text-xs mt-1 ml-1">{errors.password}</Text> : null}
            {/* Indicateur de force du mot de passe */}
            {password.length > 0 && (
              <View className="mt-2">
                <View className="flex-row gap-1 mt-1">
                  {[0, 1, 2, 3].map((i) => (
                    <View
                      key={i}
                      className="flex-1 h-1 rounded-full"
                      style={{ backgroundColor: i < passwordStrength ? strengthColors[passwordStrength - 1] : '#E5E7EB' }}
                    />
                  ))}
                </View>
                {passwordStrength > 0 && (
                  <Text className="text-xs mt-1" style={{ color: strengthColors[passwordStrength - 1] }}>
                    {strengthLabels[passwordStrength - 1]}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Buttons */}
        <View className="flex-row justify-between mt-10 pb-6">
          <TouchableOpacity className="flex-1 py-3 border border-[#2C5B90] rounded-md mr-2" onPress={() => navigation.navigate("Login")}>
            <Text className="text-[#2C5B90] text-center font-medium">Abandonner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 bg-[#2C5B90] rounded-md ml-2 ${isSubmitting ? 'opacity-50' : ''}`}
            disabled={isSubmitting}
            onPress={handleRegister}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-center font-medium">Créer mon compte</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterProAsso;
