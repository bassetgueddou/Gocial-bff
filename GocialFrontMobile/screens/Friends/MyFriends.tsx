import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, TextInput } from "react-native";
import { useTheme } from "../../screens/ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import Toast from 'react-native-toast-message';
import DeleteConfirmFriendModal from "./DeleteConfirmFriendModal";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    ProfilPersonOverview: undefined;
    ProfilProHome: undefined;
    ProfilAssoHome: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

type User = {
    id: string;
    name: string;
    age: number;
    city: string;
    hobby: string;
    image: any; // ou ImageSourcePropType si tu veux être plus strict
};

type ProAsso = {
    id: string;
    name: string;
    city: string;
    hobby: string;
    image: any; // ou ImageSourcePropType si tu veux être plus strict
    type: "Pro" | "Asso";
}


// Données des utilisateurs
const Person: User[] = [
    { id: '1', name: 'Sophie L.', age: 24, city: 'Paris 18', hobby: 'Accrobranche 🧗‍♀️', image: require('../../img/little-profil-photo.png') },
];

const ProAsso: ProAsso[] = [
    { id: '2', name: 'Le Froggy Bar', city: 'Lyon', hobby: 'Peinture 🖌️', image: require('../../img/little-profil-photo.png'), type: 'Pro' },
];

type BlockedUser = User | ProAsso;

const Blocked: BlockedUser[] = [
    { id: '3', name: 'Lucas M.', age: 27, city: 'Marseille', hobby: 'Randonnée 🏔️', image: require('../../img/little-profil-photo.png') },
    { id: '4', name: 'Boxing Club', city: 'Lyon', hobby: 'Peinture 🖌️', image: require('../../img/little-profil-photo.png'), type: 'Pro' },
    { id: '5', name: 'Basket Ball Club', city: 'Lyon', hobby: 'Peinture 🖌️', image: require('../../img/little-profil-photo.png'), type: 'Asso' },
];

const MyFriends: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [deleteConfirmFriendModalVisible, setDeleteConfirmFriendModalVisible] = useState(false);
    const [selectedName, setSelectedName] = useState("");
    const [actionLabel, setActionLabel] = useState<"supprimer" | "débloquer">("supprimer");

    const [activeTab, setActiveTab] = useState<"person" | "proasso" | "blocked">("person");

    // Sélection des données en fonction de l'onglet actif
    const getUsers = () => {
        switch (activeTab) {
            case "person":
                return Person;
            case "proasso":
                return ProAsso;
            case "blocked":
                return Blocked;
            default:
                return [];
        }
    };

    return (
        <View className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"}`}>
            {/* Navigation entre les vues */}
            <View className={`flex-row justify-around ${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} mt-2`} style={{ boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <TouchableOpacity onPress={() => setActiveTab("person")} className={`flex-1 py-2 items-center ${activeTab === "person" ? "bg-[#065C98]" : isDarkMode ? "bg-[#1D1E20]" : ""}`}>
                    <Text className={`text-lg ${activeTab === "person" ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>Personne</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab("proasso")} className={`flex-1 py-2 items-center ${activeTab === "proasso" ? "bg-[#065C98]" : isDarkMode ? "bg-[#1D1E20]" : ""}`}>
                    <Text className={`text-lg ${activeTab === "proasso" ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>Pro/Asso</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab("blocked")} className={`flex-1 py-2 items-center ${activeTab === "blocked" ? "bg-[#065C98]" : isDarkMode ? "bg-[#1D1E20]" : ""}`}>
                    <Text className={`text-lg ${activeTab === "blocked" ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>Bloqué</Text>
                </TouchableOpacity>
            </View>

            {/* Barre de recherche */}
            <View className={`mx-4 flex-row items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} border border-[#065C98] rounded-2xl px-3 h-10 mt-4`}>
                <MaterialIcons name="search" size={20} color={isDarkMode ? "white" : "#4A4A4A"} />
                <TextInput
                    className={`flex-1 ml-2 ${isDarkMode ? "text-white" : "text-black"}`}
                    placeholder={activeTab === "person" ? "Rechercher une personne" : activeTab === "proasso" ? "Rechercher un Pro/Asso" : "Rechercher"}
                    placeholderTextColor={isDarkMode ? "gray" : "#A6A6A6"}
                    autoFocus
                />
            </View>

            {/* Affichage de la liste des utilisateurs en fonction de l'onglet sélectionné */}
            <FlatList
                data={getUsers()}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => {
                        if ('type' in item) {
                            if (item.type === "Pro") {
                                navigation.navigate("ProfilProHome");
                            } else if (item.type === "Asso") {
                                navigation.navigate("ProfilAssoHome");
                            }
                        } else {
                            navigation.navigate("ProfilPersonOverview");
                        }
                    }} className="flex-row items-center justify-between px-4 py-4">
                        {/* Avatar + Infos */}
                        <View className="flex-row items-center space-x-3">
                            <Image source={item.image} className="w-12 h-12 rounded-full" resizeMode="cover" />
                            <View className='ml-2'>
                                <View className="flex-row">
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"} font-medium`}>
                                        {item.name}
                                        {('age' in item) && ` ${item.age} ans`}
                                    </Text>
                                    {'type' in item && (
                                        <Text className={`font-medium ml-1 ${item.type === 'Pro' ? 'text-[#8260D2]' : 'text-[#008F29]'}`}>
                                            {item.type}
                                        </Text>
                                    )}
                                </View>
                                <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold`}>{item.city}</Text>
                                <Text className={`${isDarkMode ? "text-white" : "text-black"}`}><Text className='text-xs'>❤️</Text> {item.hobby}</Text>
                            </View>
                        </View>

                        {/* Bouton */}
                        <TouchableOpacity
                            className="bg-red-500 px-3 py-2 rounded-full"
                            onPress={() => {
                                setSelectedName(item.name);
                                setActionLabel(activeTab === "blocked" ? "débloquer" : "supprimer");
                                setDeleteConfirmFriendModalVisible(true);
                            }}
                        >
                            <Text className="text-white text-sm font-medium">
                                {activeTab === "blocked" ? "Débloquer" : "Supprimer"}
                            </Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                // Séparateur entre les items
                ItemSeparatorComponent={() => (
                    <View style={{ height: 1, backgroundColor: '#D1D5DB', marginHorizontal: 16 }} />
                )}
            />
            <DeleteConfirmFriendModal
                visible={deleteConfirmFriendModalVisible}
                name={selectedName}
                actionLabel={actionLabel}
                onCancel={() => setDeleteConfirmFriendModalVisible(false)}
                onConfirm={() => {
                    setDeleteConfirmFriendModalVisible(false);

                    const message =
                    actionLabel === "supprimer"
                        ? `${selectedName} a bien été supprimé(e) de vos amis.`
                        : `${selectedName} a bien été débloqué(e).`

                    Toast.show({
                        type: "success",
                        text1: actionLabel === "supprimer" ? "Ami supprimé 🗑️" : "Utilisateur débloqué",
                        text2: message,
                        visibilityTime: 2000,
                        position: 'top',
                        topOffset: 60,
                    });
                }}
            />

        </View>
    );
};

export default MyFriends;
