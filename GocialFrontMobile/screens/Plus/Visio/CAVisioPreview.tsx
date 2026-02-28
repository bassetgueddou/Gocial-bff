import { View, Text, TouchableOpacity, ScrollView, Linking, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import React, { useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    CATitle: undefined;
    Main: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Host {
    avatar: any; // Utilisation de `any` pour `require()` des images locales
}

interface Visio {
    url: string;
}

interface EventData {
    id: number;
    host: Host;
    title: string;
    date: string;
    eventImage: any;
    visio: Visio;
}

const eventData: EventData = {
    id: 1,
    host: {
        avatar: require("../../../img/little-profil-photo.png"), // Image locale
    },
    title: "Conversation Anglais en ligne",
    date: "Dim. 12 oct. - 08:45",
    eventImage: require("../../../img/billard-exemple.jpg"),
    visio: {
        url: "https://visio.com/mon_visio"
    },
};

interface InfoItem {
    label: string;
    value: string;
}

const infoData: InfoItem[] = [
    { label: "Type d’activité", value: "Billard" },
    { label: "Age des participants", value: "18-122" },
    { label: "Types de participants ", value: "Tout le monde" },
    { label: "Visibilité", value: "Publique" },
    { label: "Validation des participants", value: "Manuelle" },
    { label: "Participants non Gocial ", value: "Refusés" },
];

const handleOpenLink = () => {
    Linking.openURL(eventData.visio.url);
};

const CAVisioPreview: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    return (
        <View className="flex-1">
            {/* HEADER */}
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        Aperçu
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Main")}>
                        <MaterialIcons name="close" size={25} color="red" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* ScrollView contenant tout le contenu */}
            <ScrollView className={`${isDarkMode ? "bg-black" : "bg-white"} min-h-screen`} contentContainerStyle={{ paddingBottom: 300 }}>

                {/* Image principale */}
                <View className="relative">
                    <Image
                        source={eventData.eventImage}
                        className="w-full h-48"
                    />

                    {/* Image de profil superposée */}
                    <View className="absolute -bottom-6 left-4 rounded-full">
                        <Image
                            source={eventData.host.avatar}
                            className="w-[4rem] h-[4rem] rounded-full"
                        />
                    </View>
                </View>

                {/* Contenu texte */}
                <View className="mt-2 items-center">
                    <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold text-lg text-center`}>
                        {eventData.title}
                    </Text>
                    <Text className={`${isDarkMode ? "text-white" : "text-black"} text-base mt-1`}>
                        {eventData.date}
                    </Text>
                </View>

                {/* Informations (Ville, Âge, Activités) */}
                <View className="flex-row items-start justify-center mt-4 px-[3rem]">
                    <TouchableOpacity className={`w-[25%] items-center border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg mr-6`}>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>Visio</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className={`w-[25%] items-center border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg`}>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>0/5</Text>
                    </TouchableOpacity>

                    {/* <TouchableOpacity className={`border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg`}>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>Gratuit</Text>
                    </TouchableOpacity> */}
                </View>

                <TouchableOpacity onPress={handleOpenLink} className="flex-row items-center space-x-2 mt-5 mb-2 px-2">
                    {/* Icône */}
                    <FontAwesome name="external-link" size={18} color="black" className="mr-1 relative top-[0.1rem]" />

                    {/* Lien */}
                    <Text className="underline text-black text-base">{eventData.visio.url}</Text>
                </TouchableOpacity>

                <View className={`p-4 ${isDarkMode ? "bg-black" : "bg-white"}`}>
                    {/* Texte haut */}
                    <Text className={`text-base mb-2 ${isDarkMode ? "text-white" : ""}`}>1/5 Participant  <Text>(0 en attente)</Text></Text>

                    {/* Ligne avatar + bouton */}
                    <View className="flex-row items-center space-x-4 mb-2">
                        {/* Avatar */}
                        <Image
                            source={require("../../../img/little-profil-photo.png")} // Remplace par ton chemin
                            className="w-10 h-10 rounded-full"
                        />

                        {/* Bouton bleu avec flèche */}
                        <TouchableOpacity className={`ml-2 w-[2.45rem] h-[2.45rem] rounded-full ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} justify-center items-center`}>
                            <MaterialIcons name="arrow-forward-ios" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Ligne bas */}
                    <Text className={`text-sm ${isDarkMode ? "text-white" : ""}`}>
                        + 2 Participants hors Gocial seront avec Alain
                    </Text>
                </View>

                <View className={`mt-2 w-full`}>
                    <View className="flex-row items-center justify-between px-4 mb-2">
                        <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>
                            Description
                        </Text>
                    </View>

                    <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>Discutons de l’actualité du jour en anglais, dans un esprit conviviale. Tout les niveaux sont les bienvenus.</Text>
                    </View>
                </View>

                <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full mt-6 items-center`}>
                    <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>Pas d'adresse</Text>
                </View>

                <View className="mt-6 w-full">
                    {/* En-tête */}
                    <View className="flex-row items-center justify-between px-4 mb-2">
                        <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>En savoir plus</Text>
                    </View>

                    {/* Liste des infos */}
                    <View className={`${isDarkMode ? "bg-black" : "bg-white"} rounded-lg`}>
                        {infoData.map((item, index) => (
                            <View key={index} className="mt-2">
                                <View className={`flex-row justify-between items-center py-3 px-4 ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} rounded-lg`}>
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{item.label}</Text>
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{item.value}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>

            <View className={`absolute bottom-0 left-0 right-0 ${isDarkMode ? 'bg-black' : 'bg-white'} 
                    px-4 py-4 flex-row justify-between items-center`}
                style={{ height: 80 }} >
                <TouchableOpacity className={`px-8 py-3 border ${isDarkMode ? 'border-[#1A6EDE]' : 'border-[#065C98]'} rounded-lg`}>
                    <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"} font-bold`}>Modifier</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        Toast.show({
                            type: 'success',
                            text1: 'Évènement publié 🎉',
                            text2: 'Ton évènement est à présent en ligne.',
                            position: 'top',
                            topOffset: 60,
                        });

                        setTimeout(() => navigation.navigate("Main"), 2000);
                    }}
                    className={`px-8 py-3 ${isDarkMode ? 'bg-[#1A6EDE]' : 'bg-[#065C98]'} rounded-lg`}>
                    <Text className="text-white font-bold">Publier</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

export default CAVisioPreview;
