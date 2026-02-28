import { View, Text, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { ImageSourcePropType } from "react-native";
import { useTheme } from "../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FilterFriendsPersonModal from './FilterFriendsPersonModal';
import FilterFriendsProAsso from './FilterFriendsProAssoModal';
import React, { useState } from 'react';
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

type RootStackParamList = {
    ProfilPersonOverview: undefined;
    ProfilProAdd: undefined;
    ProfilAssoAdd: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

type User = {
    id: string;
    name: string;
    age?: number;
    location: string;
    hobby: string;
    image: ImageSourcePropType;
    type?: "Pro" | "Asso";
};

const personUsers: User[] = [
    {
        id: "1",
        name: "Sophie L.",
        age: 24,
        location: "Paris 18",
        hobby: "Accrobranche 🧗‍♀️",
        image: require("../../img/little-profil-photo.png"),
    },
];

const proAssoUsers: User[] = [
    {
        id: "2",
        name: "LeSuperEndroit",
        location: "Paris 18",
        hobby: "Concerts 🎶",
        image: require("../../img/little-profil-photo.png"),
        type: "Pro",
    },
    {
        id: "3",
        name: "AssoCool",
        location: "Paris 18",
        hobby: "Écologie 🌿",
        image: require("../../img/little-profil-photo.png"),
        type: "Asso",
    },
];

const FriendsPerson: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [activeTab, setActiveTab] = useState<"person" | "proasso">("person");
    const [modalPersonVisible, setModalPersonVisible] = useState(false);
    const [modalProAssoVisible, setModalProAssoVisible] = useState(false);

    const bgColor = isDarkMode ? "bg-black" : "bg-white";

    return (
        <View className={`flex-1 ${bgColor}`}>
            {/* Boutons de navigation entre vues */}
            <View className={`flex-row justify-around ${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} mt-2`} style={{ boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <TouchableOpacity
                    onPress={() => setActiveTab("person")}
                    className={`flex-1 py-2 items-center w-[50%] ${activeTab === "person" ? "bg-[#065C98]" : isDarkMode ? "bg-[#1D1E20" : ""}`}
                >
                    <Text className={`text-lg ${activeTab === "person" ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>Personne</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab("proasso")}
                    className={`flex-1 py-2 items-center w-[50%] ${activeTab === "proasso" ? "bg-[#065C98]" : isDarkMode ? "bg-[#1D1E20]" : ""}`}
                >
                    <Text className={`text-lg ${activeTab === "proasso" ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>Pro/Asso</Text>
                </TouchableOpacity>
            </View>

            {/* Modals */}
            <FilterFriendsPersonModal visible={modalPersonVisible} onClose={() => setModalPersonVisible(false)} />
            <FilterFriendsProAsso visible={modalProAssoVisible} onClose={() => setModalProAssoVisible(false)} />

            {/* Barre de recherche + Filtres */}
            <View className="flex-row items-center mx-4 space-x-2 mt-4">
                <View className={`flex-1 flex-row items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"} rounded-2xl px-3 h-10`}>
                    <MaterialIcons name="search" size={20} color={isDarkMode ? "white" : "#4A4A4A"} />
                    <TextInput
                        className={`flex-1 ml-2 ${isDarkMode ? "text-white" : "text-black"}`}
                        placeholder={activeTab === "person" ? "Mathilde J., @mathilde" : "LeSuperEndroit, @lesuperendroit"}
                        placeholderTextColor="#A6A6A6"
                    />
                </View>
                <TouchableOpacity
                    onPress={() => activeTab === "person" ? setModalPersonVisible(true) : setModalProAssoVisible(true)}
                    className={`ml-2 flex-row items-center space-x-1 px-3 py-2 ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"} rounded-lg`}
                >
                    <MaterialIcons name="tune" size={16} color={isDarkMode ? "white" : "black"} />
                    <Text className={`${isDarkMode ? "text-white" : "text-black"} font-medium`}>Filtres</Text>
                </TouchableOpacity>
            </View>

            {/* Cartes des utilisateurs */}
            <ScrollView>
                <View className="flex flex-wrap flex-row justify-center p-1">
                    {(activeTab === "person" ? personUsers : proAssoUsers).map((user, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() =>
                                activeTab === "person"
                                    ? navigation.navigate("ProfilPersonOverview")
                                    : user.type === "Pro"
                                        ? navigation.navigate("ProfilProAdd")
                                        : navigation.navigate("ProfilAssoAdd")
                            }
                            className="relative w-[48%] h-64 m-1 rounded-lg overflow-hidden shadow-lg"
                        >
                            <Image source={user.image} className="w-full h-full" />
                            {activeTab === "proasso" && (
                                <View className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center ${user.type === 'Pro' ? 'bg-[#8260D2]' : 'bg-[#2C8500]'}`}>
                                    <Text className="text-white font-bold text-xs">{user.type}</Text>
                                </View>
                            )}
                            <View className="absolute bottom-2 left-2">
                                <Text className="text-white font-bold">{user.name}</Text>
                                <Text className="text-white text-xs font-bold">{activeTab === "person" ? `${user.age} ans ${user.location}` : user.location}</Text>
                                <Text className="text-white text-xs font-bold">❤️ {user.hobby}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

export default FriendsPerson;
