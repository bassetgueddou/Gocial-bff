import React from "react";
import { View, Text, TouchableOpacity, Image, Modal } from "react-native";
import { useTheme } from "../ThemeContext";

interface GirlsOnlyModalProps {
    visible: boolean;
    onClose: () => void;
}

const GirlsOnlyModal: React.FC<GirlsOnlyModalProps> = ({ visible, onClose }) => {
    const { isDarkMode } = useTheme();

    return (
        <Modal visible={visible} animationType="fade" transparent>
            {/* Fond semi-transparent */}
            <View className={`flex-1 justify-center items-center bg-black bg-opacity-50`}>
                <View className={`${isDarkMode ? 'bg-[#1D1E20]' : 'bg-white' } w-[85%] p-6 rounded-2xl items-center`}>

                    <View className={`flex-row items-center mb-4`}>
                        {/* Icône */}
                        <Image
                            source={require("../../img/girls-only.png")}
                            className={`w-10 h-10 mb-2`}
                            resizeMode="contain"
                            style={{ tintColor: isDarkMode ? "white" : "black" }}
                        />

                        {/* Titre */}
                        <Text className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>Girls only</Text>
                    </View>

                    {/* Description */}
                    <Text className={`text-center ${isDarkMode ? "text-white" : "text-gray-700"} mb-3`}>
                        Seules les femmes pourront voir ton profil et t’ajouter en amie.
                    </Text>
                    <Text className={`text-center ${isDarkMode ? "text-white" : "text-gray-700"} mb-5`}>
                        Tu pourras toujours voir et ajouter les autres profils.
                    </Text>

                    {/* Bouton Ok */}
                    <TouchableOpacity
                        onPress={onClose}
                        className={`bg-green-600 w-full py-3 rounded-full`}
                    >
                        <Text className={`text-white text-center font-semibold text-lg`}>Ok</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default GirlsOnlyModal;
