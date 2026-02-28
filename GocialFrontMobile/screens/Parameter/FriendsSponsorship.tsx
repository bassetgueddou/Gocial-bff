import { useState } from "react";
import { View, Text, TouchableOpacity, Clipboard, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";


const FriendsSponsorship: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation();

    const referralCode = "crvsf1gfg1";

    const copyToClipboard = () => {
        Clipboard.setString(referralCode);
        Alert.alert(referralCode, "Le code a été copié dans le presse-papiers.");
    };

    return (
        <View className="flex-1">
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg relative right-[8.3rem] font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        Parrainer des amis
                    </Text>
                </View>
            </SafeAreaView>

            <View className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="p-4">
                    <Text className={`mb-2 text-lg ${isDarkMode ? "text-white" : ""}`}><Text className="text-3xl">•</Text> Parrainer 1 ami et obtenez 1 mois d’offre Premium gratuit !</Text>
                    <Text className={`mb-2 text-lg ${isDarkMode ? 'text-white' : ""}`}><Text className="text-3xl">•</Text> Parrainer 3 amis et obtenez 1 mois d’offre Premium + gratuit !</Text>
                </View>

                <Text className={`ml-2 text-sm ${isDarkMode ? 'text-white' : ""}`}>Chaque offres est cumulable.</Text>

                <View className={`flex-row justify-between items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-gray-200"} px-4 py-3 mt-[10rem]`}>
                    <Text className={`text-base ${isDarkMode ? "text-white" : ""}`}>{referralCode}</Text>
                    <TouchableOpacity onPress={copyToClipboard} className={`${isDarkMode ? "bg-black" : "bg-white"} px-4 py-1 rounded-full`}>
                        <Text className={`text-sm font-medium ${isDarkMode ? "text-white" : ""}`}>Copier</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className={`pb-6 px-[1rem] ${isDarkMode ? "bg-black" : "bg-[#F2F5FA]"}`}>
                <TouchableOpacity className={`w-full ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#2C5B90]"} py-4 rounded-md`}>
                    <Text className="text-white text-center text-lg font-medium">Parrainer des amis</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
};

export default FriendsSponsorship;
