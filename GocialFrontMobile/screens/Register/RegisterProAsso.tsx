import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
  Login: undefined;
  RegisterPerson: undefined;
  RegisterProAsso: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

const RegisterProAsso: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedType, setSelectedType] = useState<"pro" | "asso">("pro");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}>
        {/* Header */}
        <View className="relative py-4 mt-4 flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="absolute left-0">
            <MaterialIcons name="arrow-back-ios" size={25} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold mx-auto">Inscription 1/2</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")} className="absolute right-0">
            <MaterialIcons name="close" size={25} color="black" />
          </TouchableOpacity>
        </View>

        {/* Champ obligatoire */}
        <Text className="text-red-500 font-medium mt-4">* Obligatoire</Text>

        {/* Sélection du type avec plus d'espace */}
        <View className="mt-6 flex-row justify-between gap-4">
          <TouchableOpacity
            onPress={() => setSelectedType("pro")}
            className={`flex-1 px-6 py-4 rounded-md ${selectedType === "pro" ? "bg-[#2C5B90]" : "border border-[#2C5B90]"
              }`}
          >
            <Text className={`text-center font-medium ${selectedType === "pro" ? "text-white" : "text-[#2C5B90]"}`}>
              Pro
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedType("asso")}
            className={`flex-1 px-6 py-4 rounded-md ${selectedType === "asso" ? "bg-[#2C5B90]" : "border border-[#2C5B90]"
              }`}
          >
            <Text className={`text-center font-medium ${selectedType === "asso" ? "text-white" : "text-[#2C5B90]"}`}>
              Asso
            </Text>
          </TouchableOpacity>
        </View>

        {/* Champs dynamiques */}
        <View className="mt-6 space-y-6"> {/* Augmente l'espace entre chaque champ */}
          {selectedType === "pro" ? (
            <>
              {/* Dénomination */}
              <View className="mt-6">
                <Text className="text-base font-medium">
                  Dénomination <Text className="text-red-500">*</Text>
                </Text>
                <TextInput className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
              </View>

              {/* Siren */}
              <View className="mt-6">
                <Text className="text-base font-medium">
                  Siren <Text className="text-red-500">*</Text>
                </Text>
                <TextInput className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
              </View>
            </>
          ) : (
            <>
              {/* Titre */}
              <View className="mt-6">
                <Text className="text-base font-medium">
                  Titre <Text className="text-red-500">*</Text>
                </Text>
                <TextInput className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
              </View>

              {/* Numéro RNA */}
              <View className="mt-6">
                <Text className="text-base font-medium">
                  Numéro RNA <Text className="text-red-500">*</Text>
                </Text>
                <TextInput className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
              </View>
            </>
          )}

          {/* Nom visible */}
          <View className="mt-6">
            <Text className="text-base font-medium">
              Nom visible <Text className="text-red-500">*</Text>
            </Text>
            <TextInput className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
          </View>

          {/* Adresse */}
          <View className="mt-6">
            <Text className="text-base font-medium">
              Adresse <Text className="text-red-500">*</Text>
            </Text>
            <TextInput className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
          </View>

          {/* Secteur d’activité */}
          <View className="mt-6">
            <Text className="text-base font-medium">
              Secteur d’activité <Text className="text-red-500">*</Text>
            </Text>
            <TextInput className="border border-[#2C5B90] rounded-md px-4 py-3 mt-2" />
          </View>
        </View>

        {/* Bouton Suivant */}
        <View className="mt-10 pb-6">
          <TouchableOpacity className="w-full bg-[#2C5B90] py-4 rounded-md">
            <Text className="text-white text-center text-lg font-medium">Suivant</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterProAsso;
