import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from "../../screens/ThemeContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    ProfilPersonOverview: undefined;
    ProfilProHome: undefined;
    ProfilAssoHome: undefined;
    ProfilProAdd: undefined;
    ProfilAssoAdd: undefined;
    ActivityOverview: undefined;
    HostEvaluation: undefined;
    ParticipantEvaluation: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

const notifications = [
    { id: 1, idNotif: 1, name: 'Julien L.', message: 'souhaite participer à ton activité', activity: 'Conversation Anglais en ligne', extra: 'le', time: '05/10/2024 à 08:45', date: '1 oct - 18:59', avatar: require("../../img/little-profil-photo.png") },
    { id: 2, idNotif: 1, message: 'Ton activité', activity: 'Conversation Anglais en ligne', extra: 'commence dans', time: '2 heures 🔥', date: '1 oct - 18:59', avatar: require("../../img/little-profil-photo.png") },
    { id: 3, idNotif: 1, message: 'Ton activité', activity: 'Conversation Anglais en ligne', extra: ', c’est pour', time: 'demain 😎', date: '1 oct - 18:59', avatar: require("../../img/little-profil-photo.png") },
    { id: 4, idNotif: 1, message: 'Les participants à ton activité', activity: 'Conversation Anglais en ligne', extra: 'du', time: '5/10/2024 à 21:30', extra2: 'ont été évalués automatiquement 🌟', date: '1 oct - 18:59', avatar: require("../../img/little-profil-photo.png") },
    { id: 5, idNotif: 1, name: 'Julien L.', message: 'a évalué et laissé un commentaire à ton activité', activity: 'Conversation Anglais en ligne', extra: 'du', time: '5/10/2024 à 21:30 🌟', date: '1 oct - 18:59', avatar: require("../../img/little-profil-photo.png") },
    { id: 6, idNotif: 1, name: 'Julien L.', message: 'à évalué ton activité', activity: 'Conversation Anglais en ligne', extra: 'du', time: '5/10/2024 à 21:30 🌟', date: '1 oct - 18:59', avatar: require("../../img/little-profil-photo.png") },
    { id: 7, idNotif: 2, message: 'Souhaites-tu évaluer les participants de ton activité', activity: 'Conversation Anglais en ligne', extra: 'du', time: '5/10/2024 à 21:30 🌟', date: '1 oct - 18:59', avatar: require("../../img/little-profil-photo.png") },
    { id: 8, idNotif: 3, message: 'Souhaites-tu évaluer l\'hôte de l\'activité', activity: 'Conversation Anglais en ligne', extra: 'du', time: '5/10/2024 à 21:30 🌟', date: '1 oct - 18:59', avatar: require("../../img/little-profil-photo.png") }

];

const Activity = () => {
    const { isDarkMode } = useTheme();

    const navigation = useNavigation<NavigationProp>();

    return (
        <View>
            <ScrollView className={`p-4 ${isDarkMode ? "bg-black" : "bg-white"}`}>
                {notifications.map((notif) => (
                    <View key={notif.id} className="mb-4">
                        <TouchableOpacity onPress={() => {
                            if (notif.idNotif === 2) {
                                navigation.navigate("HostEvaluation");
                            } else if (notif.idNotif === 3) {
                                navigation.navigate("ParticipantEvaluation");
                            } else {
                                navigation.navigate("ActivityOverview");
                            }
                        }}
                            className="flex-row items-start">

                            {/* en fonction du type de profil (ProfilPersonOverview/ProfileProHome/ProfilAssoHome/ProfilProAdd/ProfilAssoAdd tu rajoutes) il faut rajouter le bon lien de profile */}
                            <TouchableOpacity onPress={() => navigation.navigate("ProfilPersonOverview")}>
                                <Image source={notif.avatar} className="w-10 h-10 rounded-full mr-3 relative top-2" />
                            </TouchableOpacity>
                            <View className="flex-1">
                                <Text className={`text-base ${isDarkMode ? "text-white" : "text-black"}`}>
                                    <Text className={`font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>{notif.name} </Text>
                                    {notif.message}<Text className={`${isDarkMode ? "text-[#2676DF]" : "text-blue-600"}`}> {notif.activity}</Text> {notif.extra} <Text className={`${isDarkMode ? "text-[#2676DF]" : "text-blue-600"}`}>{notif.time}</Text> {notif.extra2}
                                </Text>
                                <Text className={`text-xs mt-1 self-end text-right ${isDarkMode ? "text-white" : "text-gray-500"}`}>{notif.date}</Text>
                            </View>
                        </TouchableOpacity>
                        <View className="h-[1px] bg-gray-300 mt-3" />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default Activity;
