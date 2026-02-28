import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";

const NotifVerifyProfile: React.FC = () => {
    const { isDarkMode } = useTheme();
    return (
        <SafeAreaView className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"} justify-center items-center px-6`}>
            <View className={`absolute top-0 w-full mt-[8rem] items-center`}>
                <Text className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-black"} text-center`}>
                    Penses à vérifier ton Profil
                </Text>
                <Image source={require("../../img/great.png")} className="w-6 h-6 relative left-[9rem] bottom-7" />
            </View>
            {/* Image Carte d'identité */}
            <Image
                source={require("../../img/id.png")} // Remplace avec ton image
                className={`w-[17rem] h-[17rem] mt-6`}
                resizeMode="contain"
            />

            {/* Texte Explicatif */}
            <Text className={`text-lg text-center ${isDarkMode ? "text-white" : "text-black"} mt-1`}>
                Ajoute ta pièce d’identité pour plus de sécurité !
            </Text>

            {/* Texte d'aide */}
            <Text className={`${isDarkMode ? "text-white" : "text-black"} text-sm text-center mt-[5rem]`}>
                Les utilisateurs pourront ainsi s’assurer de ta véritable identité. 😇
            </Text>

            {/* Aide */}
            <View className="items-center mt-6">
                <TouchableOpacity className="flex-row items-center mt-5">
                    <Image source={require("../../img/help-icon.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} className="w-8 h-8 mr-2" />
                    <Text className={`${isDarkMode ? "text-white" : "text-black"} underline text-lg`}>Aide</Text>
                </TouchableOpacity>
            </View>

            {/* Bouton de Vérification */}
            <TouchableOpacity className={`absolute bottom-12 bg-green-700 py-4 w-full mx-6 rounded-lg`}>
                <Text className={`text-white text-center font-semibold text-lg`}>
                    Vérifier mon profil
                </Text>
            </TouchableOpacity>

        </SafeAreaView>
    );
};

export default NotifVerifyProfile;
