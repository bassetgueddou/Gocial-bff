import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    Dimensions,
    TextInput,
    ImageSourcePropType,
    Image,
    Switch,
    FlatList,
    Pressable,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { runOnJS } from "react-native-reanimated";
import { useTheme } from "../ThemeContext";

const { width, height } = Dimensions.get("window");

interface Category {
    id: string;
    label: string;
    icon: ImageSourcePropType;
}

const categories: Category[] = [
    { id: "outings", label: "Sorties", icon: require("../../img/exit.png") },
    { id: "sports", label: "Sports", icon: require("../../img/sport.png") },
    { id: "games", label: "Jeux", icon: require("../../img/game.png") },
    { id: "diverse", label: "Divers", icon: require("../../img/various.png") },
];

interface Activity {
    id: string;
    name: string;
    category: string;
    emoji: string;
}

const activities: Activity[] = [
    { id: "accrobranche", name: "Accrobranche", category: "outings", emoji: "🌳" },
    { id: "afterwork", name: "AfterWork", category: "outings", emoji: "🍻" },
    { id: "walk-visite", name: "Balade - Visite", category: "outings", emoji: "🚶‍♂️" },
    { id: "barbecue", name: "Barbecue", category: "outings", emoji: "🍖" },
    { id: "haveADrink", name: "Boire un verre", category: "outings", emoji: "🥂" },
    { id: "bowling", name: "Bowling", category: "outings", emoji: "🎳" },
    { id: "brunch", name: "Brunch", category: "outings", emoji: "🥞" },
    { id: "casino", name: "Casino", category: "outings", emoji: "🎰" },
    { id: "cinema", name: "Cinéma", category: "outings", emoji: "🎬" },
    { id: "concert", name: "Concert", category: "outings", emoji: "🎤" },
    { id: "festival", name: "Festival", category: "outings", emoji: "🎉" },
    { id: "fair-amusementPark", name: "Foire - Parc d’attraction", category: "outings", emoji: "🎡" },
    { id: "karaoke", name: "Karaoké", category: "outings", emoji: "🎤" },
    { id: "foreignLanguage", name: "Langues étrangères", category: "outings", emoji: "🌍" },
    { id: "expo-museum", name: "Expo - Musée", category: "outings", emoji: "🖼️" },
    { id: "beach-lake", name: "Plage - Lac", category: "outings", emoji: "🏖️" },
    { id: "party", name: "Party", category: "outings", emoji: "🪩" },
    { id: "picnic", name: "Pique-nique", category: "outings", emoji: "🧺" },
    { id: "restaurant", name: "Resto", category: "outings", emoji: "🍽️" },
    { id: "shopping", name: "Shopping", category: "outings", emoji: "🛍️" },
    { id: "dance", name: "Danse", category: "outings", emoji: "🕺" },
    { id: "studentEvening", name: "Soirée étudiante", category: "outings", emoji: "🎓" },
    { id: "motorized", name: "Motorisé", category: "outings", emoji: "🏍️" },
    { id: "outingWithChildren", name: "Sortie avec enfants", category: "outings", emoji: "👨‍👩‍👧‍👦" },
    { id: "show", name: "Spectacle", category: "outings", emoji: "🎭" },
    { id: "garageSales", name: "Vide greniers", category: "outings", emoji: "💰" },
    { id: "zoo-farm", name: "Zoo - Ferme", category: "outings", emoji: "🐐" },
    { id: "evening", name: "Soirée", category: "outings", emoji: "💃" },
    { id: "lasergame", name: "Lasergame", category: "outings", emoji: "🔫" },
    { id: "escapegame", name: "Escapegame", category: "outings", emoji: "🧩" },
    { id: "otherOutings", name: "Autres Sorties", category: "outings", emoji: "" },
    { id: "athletics", name: "Athlétisme", category: "sports", emoji: "🏃‍♂️" },
    { id: "swimming", name: "Natation", category: "sports", emoji: "🏊‍♀️" },
    { id: "cycling", name: "Cyclisme", category: "sports", emoji: "🚴‍♂️" },
    { id: "gymnastics", name: "Gymnastique", category: "sports", emoji: "🤸‍♀️" },
    { id: "golf", name: "Golf", category: "sports", emoji: "🏌️‍♂️" },
    { id: "escrime", name: "Escrime", category: "sports", emoji: "🤺" },
    { id: "contactSports", name: "Sports de contacts", category: "sports", emoji: "🥊" },
    { id: "gripSports", name: "Sports de préhensions", category: "sports", emoji: "🤼‍♂️" },
    { id: "teamSports", name: "Sports collectifs", category: "sports", emoji: "⚽" },
    { id: "racketSports", name: "Sports de raquette", category: "sports", emoji: "🎾" },
    { id: "outdoorAndMountainSports", name: "Sports de plein air et de montagne", category: "sports", emoji: "🏞️" },
    { id: "waterSports", name: "Sports nautiques", category: "sports", emoji: "🚣‍♂️" },
    { id: "motorSports", name: "Sports mécaniques", category: "sports", emoji: "🏎️" },
    { id: "precisionSports", name: "Sports de précision", category: "sports", emoji: "🎯" },
    { id: "wellnessAndRelaxationActivities", name: "Activités de bien-être et de relaxation", category: "sports", emoji: "🧘‍♂️" },
    { id: "otherSports", name: "Autres Sports", category: "sports", emoji: "" },
    { id: "boardGames", name: "Jeux de société", category: "games", emoji: "🎲" },
    { id: "videoGames", name: "Jeux vidéo", category: "games", emoji: "🎮" },
    { id: "puzzleGames", name: "Jeux de réflexion", category: "games", emoji: "🧠" },
    { id: "physicalAndSportsGames", name: "Jeux physiques et sportifs", category: "games", emoji: "🤾‍♂️" },
    { id: "rolePlayingAndImaginationGames", name: "Jeux de rôle et d'imagination", category: "games", emoji: "🧙‍♂️" },
    { id: "educational-teachingGames", name: "Jeux éducatifs - pédagogiques", category: "games", emoji: "📚" },
    { id: "family-partyGames", name: "Jeux familiaux - d’ambiance", category: "games", emoji: "👨‍👩‍👧‍👦" },
    { id: "otherGames", name: "Autres Jeux", category: "games", emoji: "" },
    { id: "birthday", name: "Anniversaire", category: "diverse", emoji: "🎂" },
    { id: "workshop", name: "Atelier", category: "diverse", emoji: "🧰" },
    { id: "volunteering", name: "Bénévolats", category: "diverse", emoji: "❤️‍🩹" },
    { id: "well-being", name: "Bien-être", category: "diverse", emoji: "🧘‍♀️" },
    { id: "DIY-Gardening", name: "Bricolage - Jardinage", category: "diverse", emoji: "🛠️" },
    { id: "sewing-embroidery", name: "Couture - Broderie", category: "diverse", emoji: "🧵" },
    { id: "conference", name: "Conférence", category: "diverse", emoji: "📢" },
    { id: "kitchen", name: "Cuisine", category: "diverse", emoji: "🍳" },
    { id: "literature", name: "Littérature", category: "diverse", emoji: "📖" },
    { id: "music", name: "Musique", category: "diverse", emoji: "🎶" },
    { id: "art", name: "Art", category: "diverse", emoji: "🎨" },
    { id: "travel", name: "Voyage", category: "diverse", emoji: "✈️" },
    { id: "otherDiverse", name: "Autre Divers", category: "diverse", emoji: "" },

];

interface WhatModalProps {
    visible: boolean;
    onClose: () => void;
}

const WhatModal: React.FC<WhatModalProps> = ({ visible, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>("outings");
    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setSelectedItems([]);
        setSelectAll(false);
    };

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
                            <MaterialIcons name="blur-on" size={24} color={isDarkMode ? "white" : "black"} />
                            <Text className={`text-lg font-bold ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>Quoi ?</Text>
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
                                <TouchableOpacity key={category.id}
                                    onPress={() => handleCategoryChange(category.id)}
                                    className="items-center space-y-1"
                                >
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

                        <View className="p-1 flex-1">
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
                            <View style={{ flex: 1, paddingBottom: 100 }}>
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
                </View>
            </GestureDetector>
        </Modal>
    );
};

export default WhatModal;
