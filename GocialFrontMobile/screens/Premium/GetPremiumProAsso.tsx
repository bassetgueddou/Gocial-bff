import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LinearGradient from "react-native-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    Main: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

// Définition du type pour le plan d'abonnement
type PlanType = {
    duration: string;
    price: string;
};

const GetPremiumProAsso: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

    const plans: PlanType[] = [
        { duration: "12 mois", price: "18,99 €/mois" },
        { duration: "6 mois", price: "28,99 €/mois" },
        { duration: "3 mois", price: "38,99 €/mois" },
        { duration: "1 mois", price: "48,99 €/mois" },
    ];

    return (
        <View className="flex-1">
            {/* HEADER */}
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        Obtenir Premium
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Main")}>
                        <MaterialIcons name="close" size={25} color="red" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* View contenant le contenu dynamique */}
            <View className={`${isDarkMode ? "bg-black" : "bg-white"} min-h-screen`}>
                {/* HEADER Gocial Premium */}
                <LinearGradient
                    colors={["#828799", "#626674", "#2B2D33"]}
                    locations={[0.32, 0.56, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: "100%", height: 60, justifyContent: "center", alignItems: "center" }}
                >
                    <Text className="text-white text-lg font-bold">Gocial Premium</Text>
                </LinearGradient>

                {/* Texte d'instruction */}
                <Text className={`text-base font-medium text-center mt-5 ${isDarkMode ? "text-white" : ""}`}>
                    Choisis la formule qui te convient le mieux 👌
                </Text>

                {/* Liste des offres */}
                {plans.map((plan, index) => (
                    <Pressable
                        key={index}
                        className={`w-[85%] flex-row justify-between items-center bg-gray-300 p-4 rounded-lg my-2 mx-auto ${selectedPlan === index ? "bg-gray-600" : ""
                            }`}
                        onPress={() => setSelectedPlan(index)}
                    >
                        <Text className={`text-base font-medium ${selectedPlan === index ? "text-white" : ""}`}>{plan.duration}</Text>
                        <Text className={`text-base font-medium ${selectedPlan === index ? "text-white" : ""}`}>{plan.price}</Text>
                    </Pressable>
                ))}

                {/* Texte Offres sans engagements */}
                <Text className={`text-sm mt-2 text-center ${isDarkMode ? "text-white" : ""}`}>
                    Offres sans engagements
                </Text>
            </View>

            {/* Conditions d'utilisation et Bouton Valider */}
            <View className={`${isDarkMode ? "bg-black" : "bg-white"} absolute bottom-0 left-0 right-0 p-4`}>
                <Text className={`text-xs text-center mx-5 ${isDarkMode ? "text-white" : "text-black"}`}>
                    En t’abonnant à Gocial Premium, tu acceptes les Conditions Générales
                    d’Utilisations et la Politique de Confidentialité
                </Text>

                {/* Bouton Valider */}
                <TouchableOpacity className="w-[90%] mx-auto my-5">
                    <LinearGradient
                        colors={["#828799", "#626674", "#2B2D33"]}
                        locations={[0.32, 0.56, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ borderRadius: 10, justifyContent: "center", alignItems: "center", height: 45 }}
                    >
                        <Text className="text-white font-bold text-lg">Valider</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default GetPremiumProAsso;
