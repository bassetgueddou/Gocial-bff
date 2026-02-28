import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    TextInput,
    ImageSourcePropType,
    Image,
    Switch,
    FlatList,
    Pressable,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../ThemeContext";

const { width, height } = Dimensions.get("window");

interface Category {
    id: string;
    label: string;
    icon: ImageSourcePropType;
}

const categories: Category[] = [
    { id: "sorties", label: "Sorties", icon: require("../../img/exit.png") },
    { id: "sports", label: "Sports", icon: require("../../img/sport.png") },
    { id: "jeux", label: "Jeux", icon: require("../../img/game.png") },
    { id: "divers", label: "Divers", icon: require("../../img/various.png") },
];

interface Activity {
    id: string;
    name: string;
    category: string;
    emoji: string;
}

const activities: Activity[] = [
    { id: "accrobranche", name: "Accrobranche", category: "sports", emoji: "🌳" },
    { id: "afterwork", name: "AfterWork", category: "sorties", emoji: "🍻" },
];

interface WhatViewProps {
    onClose: () => void;
    onBack: () => void;
}

const WhatView: React.FC<WhatViewProps> = ({ onClose, onBack }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>("sorties");
    const { isDarkMode } = useTheme();
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    // Filtrer les activités selon la catégorie sélectionnée
    const filteredActivities = activities.filter(activity => activity.category === selectedCategory);

    const toggleSelection = (id: string) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems([]); // Tout désélectionner
        } else {
            setSelectedItems(filteredActivities.map((activity) => activity.id)); // Tout sélectionner
        }
        setSelectAll(!selectAll);
    };


    return (
        <View className="flex-1">

            {/* Icône et texte */}

            <View className="relative flex-row items-center justify-center mb-3 px-4 bottom-3">

                <TouchableOpacity onPress={onBack} className="absolute left-2 bottom-6">
                    <MaterialIcons name="arrow-back-ios" size={22} color={isDarkMode ? "white" : "black"} />
                </TouchableOpacity>

                {/* Icône + Texte "Filtres" centré */}
                <View className="flex-row items-center flex-1 justify-center">
                    <MaterialIcons name="tune" size={20} color={isDarkMode ? "white" : "black"} />
                    <Text className={`text-lg font-bold ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>Activité préféré</Text>
                </View>

                {/* Bouton de fermeture aligné à droite */}
                <TouchableOpacity onPress={() => {onBack(); onClose();}} className="absolute right-4 bottom-6">
                    <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                </TouchableOpacity>
            </View>

            {/* Barre de recherche */}
            <View className={`flex-row items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"} rounded-lg px-3 w-full h-10`}>
                <MaterialIcons name="search" size={20} color={isDarkMode ? "white" : "black"} />
                <TextInput
                    className={`flex-1 ml-2 ${isDarkMode ? "text-white" : "text-black"}`}
                    placeholder="Rechercher..."
                    placeholderTextColor={isDarkMode ? "gray" : "black"}
                    autoFocus
                />
            </View>

            {/* Catégories */}
            <View className="flex-row justify-between px-6 mt-4">
                {categories.map((category) => (
                    <TouchableOpacity key={category.id} onPress={() => setSelectedCategory(category.id)} className="items-center space-y-1">
                        <View className={`w-14 h-14 rounded-full items-center justify-center
                                        ${selectedCategory === category.id ? isDarkMode ? "bg-[#1A6EDE]" : "bg-[#1D4E89]" : "bg-transparent"}`}>
                            <Image
                                source={category.icon}
                                className="w-8 h-8"
                                resizeMode="contain"
                                style={{ tintColor: selectedCategory === category.id ? "white" : isDarkMode ? "white" : "black" }}
                            />
                        </View>

                        <Text className={`text-sm font-medium ${selectedCategory === category.id ? isDarkMode ? "text-white" : "text-black" : isDarkMode ? "text-white" : "text-black"}`}>
                            {category.label}
                        </Text>

                        {selectedCategory === category.id && (
                            <View className={`w-10 h-[2px] mt-1 ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#1D4E89]"}`} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <View className="p-1">
                {/* Switch Tout sélectionner */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-black"}`}>
                        {selectAll ? "Tout désélectionner" : "Tout sélectionner"}
                    </Text>
                    <Switch
                        value={selectAll}
                        onValueChange={handleSelectAll}
                        thumbColor="white"
                        trackColor={{ false: "#ccc", true: "#3A7D75" }}
                        ios_backgroundColor="#E5E7EB"
                        style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                    />
                </View>

                {/* Liste des éléments */}
                <FlatList
                    data={filteredActivities} // Affiche seulement les activités de la catégorie sélectionnée
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const isSelected = selectedItems.includes(item.id);
                        return (
                            <Pressable
                                onPress={() => toggleSelection(item.id)}
                                className={`flex-row items-center justify-between p-3 mb-2 rounded-lg
                                            ${isSelected ? "bg-[#3A7D75]" : isDarkMode ? "bg-[#1D1E20]" : "bg-gray-100"}`}
                            >
                                <View className="flex-row items-center space-x-3">
                                    <Text>{item.emoji}</Text>
                                    <Text className={`text-sm font-medium ml-1 ${isSelected ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>
                                        {item.name}
                                    </Text>
                                </View>

                                <View className={`w-6 h-6 rounded-full items-center justify-center
                                                  ${isSelected ? "bg-white" : "border border-gray-400"}`}
                                >
                                    {isSelected && <MaterialIcons name="check" size={18} color="#3A7D75" />}
                                </View>
                            </Pressable>
                        );
                    }}
                />
            </View>

            {/* Boutons en bas */}
            <View className={`absolute bottom-6 left-0 right-0 ${isDarkMode ? "bg-black" : "bg-white"} p-4 flex-row justify-between`}>
                <TouchableOpacity onPress={onClose} className={`border  
                                px-5 py-2 rounded-lg ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"}`}>
                    <Text className={`text-base ${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"}`}>Réinitialiser</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose} className={`px-5 py-2 rounded-lg ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"}`}>
                    <Text className="text-white text-base">Valider</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default WhatView;
