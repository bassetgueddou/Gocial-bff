import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    Dimensions,
    Pressable,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useTheme } from "../ThemeContext";

const { width, height } = Dimensions.get("window");

interface ShareModalProps {
    visible: boolean;
    onClose: () => void;
}


const MoreProfilModal: React.FC<ShareModalProps> = ({ visible, onClose }) => {
    const { isDarkMode } = useTheme();

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 100) {
                runOnJS(onClose)(); // Utilisation de runOnJS pour éviter l'erreur
            }
        });


    return (
        <Modal visible={visible} animationType="slide" transparent>
            <GestureDetector gesture={panGesture}>
                <Pressable onPress={onClose} className="flex-1 justify-end bg-black/50">
                    <Pressable className="absolute bottom-9 self-center w-[95%]">
                  
                        <View className={`w-full ${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} rounded-lg shadow-lg`}>
                            <TouchableOpacity  className={`p-4 border-b ${isDarkMode ? "border-black" : "border-gray-300"}`}>
                                <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-blue-600"} text-lg text-center`}>Partager</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className={`p-4 border-b ${isDarkMode ? "border-black" : "border-gray-300"}`}>
                                <Text className={`${isDarkMode ? "text-[#F00020]" : "text-red-500"} text-lg text-center`}>Bloquer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="p-4">
                                <Text className={`${isDarkMode ? "text-[#F00020]" : "text-red-500"} text-lg text-center`}>Signaler</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="h-1" />

                        <View className={`w-full ${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} rounded-lg shadow-lg`}>
                            <TouchableOpacity onPress={onClose} className="p-4">
                                <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-blue-600"} text-lg text-center`}>Annuler</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>

                </Pressable>
            </GestureDetector>
        </Modal>
    );
};

export default MoreProfilModal;
