import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
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


const Register: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const [selected, setSelected] = useState<"person" | "pro" | null>("person");

    return (
        <SafeAreaView className={`flex-1 bg-white px-6`} accessible={true}>
            {/* Header */}
            <View className={`relative py-4 mt-8`}>
                <Text className={`text-xl font-semibold absolute left-1/2 -translate-x-1/2`}
                    accessibilityRole="header">
                    Inscription
                </Text>
                <TouchableOpacity
                    className={`absolute right-4`}
                    accessibilityLabel="Fermer l'inscription"
                    accessibilityRole="button"
                    onPress={() => navigation.navigate("Login")}
                >
                    <MaterialIcons name="close" size={25} color="black" />
                </TouchableOpacity>
            </View>

            {/* Question */}
            <View className={`flex-1 justify-center items-center`} accessible={true}>
                <Text className={`text-lg font-medium`} accessibilityRole="text">
                    Qui es-tu ?
                </Text>

                {/* Choix des boutons avec plus d’espacement */}
                <View className={`flex-row gap-6 mt-8`}>
                    {/* Option 1 : Une Personne */}
                    <TouchableOpacity
                        onPress={() => setSelected("person")}
                        accessibilityLabel="Une Personne"
                        accessibilityRole="radio"
                        aria-checked={selected === "person"}
                        className={`px-8 py-3 rounded-md ${selected === "person" ? "bg-[#2C5B90]" : "border border-[#2C5B90]"
                            }`}
                    >
                        <Text
                            className={`text-base font-medium ${selected === "person" ? "text-white" : "text-[#2C5B90]"
                                }`}
                        >
                            Une Personne
                        </Text>
                    </TouchableOpacity>

                    {/* Option 2 : Un Pro / Asso */}
                    <TouchableOpacity
                        onPress={() => setSelected("pro")}
                        accessibilityLabel="Un Pro/Asso"
                        accessibilityRole="radio"
                        aria-checked={selected === "pro"}
                        className={`px-8 py-3 rounded-md ${selected === "pro" ? "bg-[#2C5B90]" : "border border-[#2C5B90]"
                            }`}
                    >
                        <Text
                            className={`text-base font-medium ${selected === "pro" ? "text-white" : "text-[#2C5B90]"
                                }`}
                        >
                            Un Pro / Asso
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bouton Suivant */}
            <View className={`pb-6`}>
                <TouchableOpacity
                    className={`w-full bg-[#2C5B90] py-4 rounded-md`}
                    accessibilityLabel="Bouton suivant pour continuer l'inscription"
                    accessibilityRole="button"
                    onPress={() => {
                        if (selected === "person") {
                            navigation.navigate("RegisterPerson");
                        } else {
                            navigation.navigate("RegisterProAsso");
                        }
                    }}
                >
                    <Text className={`text-white text-center text-lg font-medium`}>
                        Suivant
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default Register;
