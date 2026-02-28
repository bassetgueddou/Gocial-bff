import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";

const ClickNotifVerifyProfile: React.FC = () => {
    const { isDarkMode } = useTheme();
    return (
        <SafeAreaView className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"} justify-center items-center px-6`}>
            <View className={`absolute top-0 w-full mt-[8rem] items-center`}>
                <Text className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-black"}  text-center`}>
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
            <Text className={`text-lg text-center ${isDarkMode ? "text-white" : "text-black"}  mt-1`}>
                Ajoute t’as pièce d’identité pour pouvoir avoir accès à cette option.
            </Text>

            {/* Texte d'aide */}
            <Text className={`text-sm text-center mt-[5rem] ${isDarkMode ? "text-white" : "text-black"} `}>
                Les utilisateurs pourront ainsi s’assurer de ta véritable identité. 😇
            </Text>

            <View className="absolute bottom-[4rem] w-full px-6 flex-row justify-between">
                <TouchableOpacity className={`flex-1 py-3 border ${isDarkMode ? "border-[#0A99FE]" : "border-[#2C5B90]"} rounded-md mr-2`}>
                    <Text className={`${isDarkMode ? "text-[#0A99FE]" : "text-[#2C5B90]"}  text-center font-medium`}>Plus tard</Text>
                </TouchableOpacity>

                <TouchableOpacity className={`flex-1 py-3 ${isDarkMode ? "bg-[#1F7500]" : "bg-green-700"} rounded-md ml-2`}>
                    <Text className="text-white text-center font-medium">Vérifier mon profil</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

export default ClickNotifVerifyProfile;
