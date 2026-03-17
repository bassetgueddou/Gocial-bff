import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../../src/contexts/AuthContext";

type RootStackParamList = {
  Login: undefined;
  RegisterPerson: undefined;
  RegisterProAsso: undefined;
};
type NavigationProp = StackNavigationProp<RootStackParamList>;

const RegisterProAsso: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { register } = useAuth();
  const [selectedType, setSelectedType] = useState<"pro" | "asso">("pro");
  const [loading, setLoading] = useState(false);

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

  const handleRegister = async () => {
    const requiredFields = selectedType === "pro"
      ? [denomination, siren, companyName, address, sector, email, password, pseudo]
      : [title, rna, companyName, address, sector, email, password, pseudo];

    if (requiredFields.some(f => !f.trim())) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    try {
      await register({
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
      });
      // Auth context handles navigation automatically
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Erreur lors de l'inscription.";
      Alert.alert("Inscription échouée", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}>
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

        <Text className="text-red-500 font-medium mt-4">* Obligatoire</Text>

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
                <Text className="text-base font-medium">Dénomination <Text className="text-red-500">*</Text></Text>
                <TextInput value={denomination} onChangeText={setDenomination} className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
              </View>
              <View className="mt-6">
                <Text className="text-base font-medium">Siren <Text className="text-red-500">*</Text></Text>
                <TextInput value={siren} onChangeText={setSiren} keyboardType="numeric" className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
              </View>
            </>
          ) : (
            <>
              <View className="mt-6">
                <Text className="text-base font-medium">Titre <Text className="text-red-500">*</Text></Text>
                <TextInput value={title} onChangeText={setTitle} className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
              </View>
              <View className="mt-6">
                <Text className="text-base font-medium">Numéro RNA <Text className="text-red-500">*</Text></Text>
                <TextInput value={rna} onChangeText={setRna} className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
              </View>
            </>
          )}

          <View className="mt-6">
            <Text className="text-base font-medium">Nom visible <Text className="text-red-500">*</Text></Text>
            <TextInput value={companyName} onChangeText={setCompanyName} className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium">Adresse <Text className="text-red-500">*</Text></Text>
            <TextInput value={address} onChangeText={setAddress} className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium">Secteur d'activité <Text className="text-red-500">*</Text></Text>
            <TextInput value={sector} onChangeText={setSector} className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium">Pseudo <Text className="text-red-500">*</Text></Text>
            <TextInput value={pseudo} onChangeText={setPseudo} autoCapitalize="none" placeholder="(exemple : mon_entreprise)" className="border border-gray-300 rounded-md px-4 py-3 mt-2" />
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium">Email <Text className="text-red-500">*</Text></Text>
            <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholder="contact@entreprise.com" className="border border-gray-300 rounded-md px-4 py-3 mt-2" />
          </View>

          <View className="mt-6">
            <Text className="text-base font-medium">Mot de passe <Text className="text-red-500">*</Text></Text>
            <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Minimum 8 caractères" className="border border-gray-300 rounded-md px-4 py-3 mt-2" />
          </View>
        </View>

        {/* Buttons */}
        <View className="flex-row justify-between mt-10 pb-6">
          <TouchableOpacity className="flex-1 py-3 border border-[#2C5B90] rounded-md mr-2" onPress={() => navigation.navigate("Login")}>
            <Text className="text-[#2C5B90] text-center font-medium">Abandonner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-3 bg-[#2C5B90] rounded-md ml-2"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
            onPress={handleRegister}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-medium">Valider</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterProAsso;
