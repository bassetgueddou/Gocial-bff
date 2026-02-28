import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    Dimensions,
    TextInput,
    Image,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { runOnJS } from "react-native-reanimated";
import { useTheme } from "../ThemeContext";
import Slider from "@react-native-community/slider";

const { width, height } = Dimensions.get("window");

interface WhereModalProps {
    visible: boolean;
    onClose: () => void;
}

const WhereModal: React.FC<WhereModalProps> = ({ visible, onClose }) => {
    const { isDarkMode } = useTheme();
    const [selectedMode, setSelectedMode] = useState<"nearby" | "city">("nearby");
    const [radius, setRadius] = useState<number>(10);
    const [city, setCity] = useState<string>("");

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 100) {
                runOnJS(onClose)(); // Utilisation de runOnJS pour éviter l'erreur
            }
        });

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <GestureDetector gesture={panGesture}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className={`w-full h-[92%] ${isDarkMode ? "bg-black" : "bg-white"} rounded-t-2xl p-5`}>
                        {/* Barre pour glisser vers le bas */}
                        <View className="items-center mb-3">
                            <View className="w-10 h-1 bg-gray-400 rounded-full" />
                        </View>

                        {/* Icône et texte */}
                        <View className="flex-row items-center justify-center mb-3 space-x-2">
                            <Image
                                source={require("../../img/marker.png")}
                                className="w-6 h-6"
                                resizeMode="contain"
                                style={{ tintColor: isDarkMode ? "white" : "black" }}
                            />
                            <Text className={`text-lg font-bold ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>Où ?</Text>
                        </View>

                        <View className="items-center w-full px-5 mt-6">
                            {/* Boutons de sélection */}
                            <View className="flex-row mb-6">
                                <TouchableOpacity
                                    className={`px-6 py-2 rounded-md mr-3 ${selectedMode === "nearby" ? isDarkMode ? "bg-[#1A6EDE]" :  "bg-[#1D4E89]" : "bg-gray-300"
                                        }`}
                                    onPress={() => setSelectedMode("nearby")}
                                >
                                    <Text className={`${selectedMode === "nearby" ? "text-white" : "text-black"}`}>
                                        Autour de moi
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className={`px-6 py-2 mr-[4rem] rounded-md ${selectedMode === "city" ? isDarkMode ? "bg-[#1A6EDE]" : "bg-[#1D4E89]" : "bg-gray-300"
                                        }`}
                                    onPress={() => setSelectedMode("city")}
                                >
                                    <Text className={`${selectedMode === "city" ? "text-white" : "text-black"}`}>Ville</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Champ de recherche visible si "Ville" est sélectionné */}
                            {selectedMode === "city" && (
                                <TextInput
                                    className={`border border-[#1D4E89] rounded-md w-full h-12 px-4 mb-6 ${isDarkMode ? "text-white" : "text-black"}`}
                                    placeholder="Rechercher une ville"
                                    placeholderTextColor="#888"
                                    value={city}
                                    onChangeText={setCity}
                                />
                            )}

                            {/* Slider de rayon */}
                            <Text className={` ${isDarkMode ? "text-white" : "text-black"} text-base mb-4`}>Dans un rayon de {radius} kms</Text>
                            <View className="w-full flex-row items-center justify-between">
                                <Text className="text-black">0 km</Text>
                                <Slider
                                    style={{ flex: 1, marginHorizontal: 10 }}
                                    minimumValue={0}
                                    maximumValue={200}
                                    step={1}
                                    value={radius}
                                    onValueChange={(val) => setRadius(val)}
                                    minimumTrackTintColor={ isDarkMode ? "#1A6EDE" : "#1D4E89"}
                                    thumbTintColor={ isDarkMode ? "#1A6EDE" : "#1D4E89"}
                                />
                                <Text className="text-black">200 km</Text>
                            </View>
                        </View>

                        {/* Boutons en bas */}
                        <View className={`absolute bottom-6 left-0 right-0 ${isDarkMode ? "bg-black" : "bg-white"} p-4 flex-row justify-between`}>
                            <TouchableOpacity onPress={onClose} className={`border  
                                px-5 py-2 rounded-lg ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"}`}>
                                <Text className={`text-base ${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"}`}>Réinitialiser</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={onClose} className={`px-5 py-2 rounded-lg flex-row items-center justify-center ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"}`}>
                                <MaterialIcons name="search" size={20} color="white" />
                                <Text className="text-white text-base">Rechercher</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </GestureDetector>
        </Modal>
    );
};

export default WhereModal;
