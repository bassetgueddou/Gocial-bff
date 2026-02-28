import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    Dimensions,
    Switch,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { runOnJS } from "react-native-reanimated";
import { useTheme } from "../ThemeContext";

const { width, height } = Dimensions.get("window");

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
}

const participantTypes: string[] = [
    "Tout le monde",
    "Hommes",
    "Femmes",
    "Familles",
    "Etudiants",
    "Célibataires",
];

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose }) => {
    const { isDarkMode } = useTheme();
    const [selectedType, setSelectedType] = useState<string>("Tout le monde");
    const [onlyFree, setOnlyFree] = useState<boolean>(false);
    const [onlyPro, setOnlyPro] = useState<boolean>(false);
    const [onlyAsso, setOnlyAsso] = useState<boolean>(false);
    const [onlyIndividuals, setOnlyIndividuals] = useState<boolean>(true);

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
                            <MaterialIcons name="tune" size={20} color={isDarkMode ? "white" : "black"} />
                            <Text className={`text-lg font-bold ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>Filtres</Text>
                        </View>

                        <View className="p-4">
                            {/* Types de participants */}
                            <Text className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-black"}`}>Types de participants :</Text>
                            <View className="flex-row flex-wrap gap-2 mb-6">
                                {participantTypes.map((type) => {
                                    const isSelected = selectedType === type;
                                    return (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => setSelectedType(type)}
                                            className={`px-4 py-2 rounded-full ${isSelected ? isDarkMode ? "bg-[#1A6EDE]" : "bg-[#1D4E89]" : "bg-gray-300"
                                                }`}
                                        >
                                            <Text className={`${isSelected ? "text-white" : "text-black"}`}>
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Autres filtres */}
                            <Text className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-black"}`}>Autres filtres :</Text>

                            {/* <View className="flex-row justify-between items-center mb-4">
                                <Text className={`text-base ${isDarkMode ? "text-white" : "text-black"}`}>Voir uniquement les activités gratuites</Text>
                                <Switch
                                    value={onlyFree}
                                    onValueChange={setOnlyFree}
                                    thumbColor="white"
                                    trackColor={{ false: "#ccc", true: isDarkMode ? "#1A6EDE" : "#1D4E89" }}
                                    ios_backgroundColor="#E5E7EB"
                                    style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }], marginLeft: 42 }}
                                />
                            </View> */}

                            <View className="flex-row justify-between items-center">
                                <Text className={`text-base ${isDarkMode ? "text-white" : "text-black"}`}>Voir uniquement les activités des particuliers</Text>
                                <Switch
                                    value={onlyIndividuals}
                                    onValueChange={setOnlyIndividuals}
                                    thumbColor="white"
                                    trackColor={{ false: "#ccc", true: isDarkMode ? "#1A6EDE" : "#1D4E89" }}
                                    ios_backgroundColor="#E5E7EB"
                                    style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                                />
                            </View>

                            <View className="flex-row justify-between items-center">
                                <Text className={`text-base ${isDarkMode ? "text-white" : "text-black"}`}>Voir uniquement les activités des pros</Text>
                                <Switch
                                    value={onlyPro}
                                    onValueChange={setOnlyPro}
                                    thumbColor="white"
                                    trackColor={{ false: "#ccc", true: isDarkMode ? "#1A6EDE" : "#1D4E89" }}
                                    ios_backgroundColor="#E5E7EB"
                                    style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                                />
                            </View>

                            <View className="flex-row justify-between items-center">
                                <Text className={`text-base ${isDarkMode ? "text-white" : "text-black"}`}>Voir uniquement les activités des assos</Text>
                                <Switch
                                    value={onlyAsso}
                                    onValueChange={setOnlyAsso}
                                    thumbColor="white"
                                    trackColor={{ false: "#ccc", true: isDarkMode ? "#1A6EDE" : "#1D4E89" }}
                                    ios_backgroundColor="#E5E7EB"
                                    style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                                />
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

export default FilterModal;
