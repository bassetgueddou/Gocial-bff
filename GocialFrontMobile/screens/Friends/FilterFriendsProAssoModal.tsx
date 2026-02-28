import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
} from "react-native";
import { GestureDetector, Gesture, ScrollView } from "react-native-gesture-handler";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { runOnJS } from "react-native-reanimated";
import { useTheme } from "../ThemeContext";
import Slider from "@react-native-community/slider";
import FavoriteActivityView from './FavoriteActivityView';


interface FilterFriendsProAssoModalProps {
    visible: boolean;
    onClose: () => void;
}

const participantTypes: string[] = [
    "Pro",
    "Asso",
];

const FilterFriendsProAssoModal: React.FC<FilterFriendsProAssoModalProps> = ({ visible, onClose }) => {
    const { isDarkMode } = useTheme();
    const [selectedType, setSelectedType] = useState<string>("Tout le monde");
    const [onlyFree, setOnlyFree] = useState<boolean>(false);

    const [selectedOption, setSelectedOption] = useState("around"); // "around" ou "city"
    const [radius, setRadius] = useState(10);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 100) {
                runOnJS(onClose)(); // Utilisation de runOnJS pour éviter l'erreur
            }
        });

    const [viewFavoriteActivityVisible, setViewFavoriteActivityVisible] = useState(false);

    const handleBackFromFavorite = () => {
        setViewFavoriteActivityVisible(false);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <GestureDetector gesture={panGesture}>
                <View className="flex-1 justify-end bg-black/50">

                    <View className={`w-full h-[92%] ${isDarkMode ? "bg-black" : "bg-white"} rounded-t-2xl`}>
                        {/* Barre pour glisser vers le bas */}
                        <View className="items-center mb-3 p-5">
                            <View className="w-10 h-1 bg-gray-400 rounded-full" />
                        </View>

                        {!viewFavoriteActivityVisible ? (
                            <>
                                <View className="relative flex-row items-center justify-center mb-3 px-4 bottom-3">
                                    {/* Icône + Texte "Filtres" centré */}
                                    <View className="flex-row items-center flex-1 justify-center">
                                        <MaterialIcons name="tune" size={20} color={isDarkMode ? "white" : "black"} />
                                        <Text className={`text-lg font-bold ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>Filtres</Text>
                                    </View>

                                    {/* Bouton de fermeture aligné à droite */}
                                    <TouchableOpacity onPress={onClose} className="absolute right-4 bottom-6">
                                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                                    </TouchableOpacity>
                                </View>

                                <View className="border-b border-gray-300 mx-2 mb-3"></View>

                                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                                    {/* Types de participants */}
                                    <View className="px-4">
                                        <Text className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-black"}`}>Type</Text>
                                    </View>

                                    <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 flex-row flex-wrap gap-2 mb-6 w-full justify-center items-center`}>
                                        {participantTypes.map((type) => {
                                            const isSelected = selectedType === type;
                                            return (
                                                <TouchableOpacity
                                                    key={type}
                                                    onPress={() => setSelectedType(type)}
                                                    className={`px-4 py-2 rounded-full ${isSelected ? (isDarkMode ? "bg-[#1A6EDE]" : "bg-[#1D4E89]") : isDarkMode ? "bg-black border-[0.3px] border-white" : "bg-gray-300"}`}
                                                >
                                                    <Text className={`${isSelected ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>
                                                        {type}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>

                                    <View className="px-5">
                                        <Text className="text-lg font-bold mb-3">Endroit</Text>
                                    </View>

                                    <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 mt-1 w-full`}>

                                        {/* Boutons de sélection */}
                                        <View className="flex-row justify-center mb-7 mr-[4rem]">
                                            <TouchableOpacity
                                                className={`px-4 py-2 rounded-lg mr-2 ${selectedOption === "around" ? isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98] text-white" : isDarkMode ? "bg-black border-[0.3px] border-white" : "bg-gray-300"
                                                    }`}
                                                onPress={() => setSelectedOption("around")}
                                            >
                                                <Text className={`${selectedOption === "around" ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>
                                                    Autour de moi
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                className={`px-4 py-2 rounded-lg ${selectedOption === "city" ? isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98] text-white" : isDarkMode ? "bg-black border-[0.3px] border-white" : "bg-gray-300"
                                                    }`}
                                                onPress={() => setSelectedOption("city")}
                                            >
                                                <Text className={`${selectedOption === "city" ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>
                                                    Ville
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Input de ville si sélectionné */}
                                        {selectedOption === "city" && (
                                            <TextInput
                                                className={`border border-[#1D4E89] rounded-md w-full h-12 px-4 mb-6 ${isDarkMode ? "text-white bg-black" : "text-black bg-white"}`}
                                                placeholder="Rechercher une ville"
                                                placeholderTextColor="#888"
                                            />
                                        )}

                                        {/* Texte Rayon */}
                                        <Text className={`text-center mb- ${isDarkMode ? "text-white" : "text-black"}`}>Dans un rayon de {radius} kms</Text>

                                        <Slider
                                            style={{ flex: 1, marginHorizontal: 10 }}
                                            minimumValue={0}
                                            maximumValue={200}
                                            step={1}
                                            value={radius}
                                            onValueChange={(value) => setRadius(value)}
                                            minimumTrackTintColor={isDarkMode ? "#1A6EDE" : "#1D4E89"}
                                            maximumTrackTintColor={isDarkMode ? "white" : ""}
                                            thumbTintColor={isDarkMode ? "#1A6EDE" : "#1D4E89"}
                                        />

                                        {/* Indicateurs KM */}
                                        <View className={`flex-row justify-between mt-5`}>
                                            <Text className={`${isDarkMode ? "text-white" : ""}`}>0 km</Text>
                                            <Text className={`${isDarkMode ? "text-white" : ""}`}>200 km</Text>
                                        </View>
                                    </View>

                                    <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-gray-100"} p-4 rounded-lg mt-5`}>
                                        <TouchableOpacity
                                            onPress={() => setViewFavoriteActivityVisible(true)}
                                            className={`flex-row items-center justify-between ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#1D4E89]"} px-6 py-4 rounded-full`}>
                                            <Text className="text-white text-base">Activité préférée</Text>
                                            <MaterialIcons name="open-in-new" size={20} color="white" />
                                        </TouchableOpacity>
                                    </View>

                                </ScrollView>

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
                            </>
                        ) : (
                            <FavoriteActivityView onClose={onClose} onBack={handleBackFromFavorite} />
                        )}
                    </View>
                </View>
            </GestureDetector>
        </Modal>
    );
};

export default FilterFriendsProAssoModal;
