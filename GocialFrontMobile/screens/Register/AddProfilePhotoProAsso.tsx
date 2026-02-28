import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";

const AddProfilePhotoProAsso : React.FC = () => {
    const { isDarkMode } = useTheme();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handlePress = () => {
        console.log("Bouton d'ajout de photo cliqué !");
    };

    return (
        <SafeAreaView className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"} px-6 justify-between`}>
            {/* Message principal */}
            <View className="mt-12 items-center px-6 w-full">
                <Text className={`${isDarkMode ? "text-white" : "text-black"} text-lg text-center font-medium leading-6`}>
                    Il te reste plus qu'à ajouter une photo de profil{" "}
                </Text>
                <Image source={require("../../img/great.png")} className="w-6 h-6 relative left-[3rem] bottom-6" />
            </View>

            {/* Bouton d'ajout de photo */}
            <View className="items-center mt-8">
                <TouchableOpacity
                    onPress={handlePress}
                    className="w-[13rem] h-[13rem] bg-gray-300 rounded-lg flex items-center justify-center"
                >
                    <Image source={require("../../img/add-profile-photo.png")} className="w-[7rem] h-[7rem]" />
                </TouchableOpacity>
                <Text className={`${isDarkMode ? "text-white" : "text-black"} text-center mt-4`}>
                    Nous te conseillons de mettre ton établissement{"\n"}ou ton activité{" "}
                    <Text className="text-lg">😊</Text>
                </Text>
            </View>

            {/* Aide */}
            <View className="items-center mt-6">
                <TouchableOpacity className="flex-row items-center">
                    <Image source={require("../../img/help-icon.png")} className="w-8 h-8 mr-2" />
                    <Text className="text-black underline text-lg">Aide</Text>
                </TouchableOpacity>
            </View>

            {/* Avertissement */}
            <View className="items-center mt-6 px-6">
                <View className="flex-row items-center">
                    <Image source={require("../../img/warning-icon.png")} className="w-6 h-6 mr-2" />
                    <Text className={`${isDarkMode ? "text-white" : "text-black"} text-sm text-center`}>
                        Une photo inappropriée (dénudé, fake...) aura pour{"\n"}conséquence la suppression du compte !
                    </Text>
                </View>
            </View>

            {/* Boutons */}
            <View className="flex-row justify-between mt-8 pb-6">
                <TouchableOpacity className={`flex-1 py-3 border ${isDarkMode ? "border-[#0A99FE]" : "border-[#2C5B90]"} rounded-md mr-2`}>
                    <Text className={`${isDarkMode ? "text-[#0A99FE]" : "text-[#2C5B90]"}  text-center font-medium`}>Plus tard</Text>
                </TouchableOpacity>

                <TouchableOpacity className={`flex-1 py-3 ${isDarkMode ? "bg-[#0A99FE]" : "bg-[#2C5B90]"} rounded-md ml-2`}>
                    <Text className="text-white text-center font-medium">Terminer</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default AddProfilePhotoProAsso;
