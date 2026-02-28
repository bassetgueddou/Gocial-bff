import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, TextInput } from "react-native";
import { useTheme } from "../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

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
    image: any; // ou ImageSourcePropType si tu veux être plus strict
};

type ProAsso = {
    id: string;
    name: string;
    city: string;
    image: any; // ou ImageSourcePropType si tu veux être plus strict
    type: "Pro" | "Asso";
}


// Données des utilisateurs
const Person: User[] = [
    { id: '1', name: 'Sophie L.', age: 24, city: 'Paris 18', image: require('../../img/little-profil-photo.png') },
    { id: '2', name: 'Sophie L.', age: 24, city: 'Paris 18', image: require('../../img/little-profil-photo.png') },
];

const ProAsso: ProAsso[] = [
    { id: '3', name: 'Le Froggy Bar', city: 'Lyon', image: require('../../img/little-profil-photo.png'), type: 'Pro' },
];

const allParticipants = [...Person, ...ProAsso];


const ParticipationValidated: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    return (
        <View className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"}`}>


            {/* Barre de recherche */}
            <View className={`mx-4 flex-row items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} border border-[#065C98] rounded-2xl px-3 h-10 mt-4`}>
                <MaterialIcons name="search" size={20} color={isDarkMode ? "white" : "#4A4A4A"} />
                <TextInput
                    className={`flex-1 ml-2 ${isDarkMode ? "text-white" : "text-black"}`}
                    placeholder="Rechercher"
                    placeholderTextColor={isDarkMode ? "gray" : "#A6A6A6"}
                    autoFocus
                />
            </View>

            {/* Affichage de la liste des utilisateurs en fonction de l'onglet sélectionné */}
            <FlatList
                data={allParticipants}
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
                                <View className="flex-row mt-4">
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"} font-medium`}>
                                        {item.name}
                                        {('age' in item) && ` ${item.age} ans`}
                                    </Text>

                                    {/* Une seule personne doit être hôte et l'hôte ne doit pas avoir de bouton "retiré"  */}
                                    {!('type' in item) && (
                                        <Text className="ml-1 relative bottom-2">Hôte</Text>
                                    )}

                                    {'type' in item && (
                                        <Text className={`font-medium ml-1 ${item.type === 'Pro' ? 'text-[#8260D2]' : 'text-[#008F29]'}`}>
                                            {item.type}
                                        </Text>
                                    )}

                                    {('type' in item) && (
                                        <Text className="ml-1 relative bottom-2">Hôte</Text>
                                    )}
                                </View>
                                <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold`}>{item.city}</Text>
                            </View>
                        </View>

                    </TouchableOpacity>
                )}
                // Séparateur entre les items
                ItemSeparatorComponent={() => (
                    <View style={{ height: 1, backgroundColor: '#D1D5DB', marginHorizontal: 16 }} />
                )}
            />
        </View>
    );
};

export default ParticipationValidated;
