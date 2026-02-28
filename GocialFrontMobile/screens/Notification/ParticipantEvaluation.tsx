import { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    ActivityOverview: undefined;

};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Host {
    id: number;
    name: string;
    age: number;
    avatar: any; // Utilisation de `any` pour `require()` des images locales
    rating: number;
}

interface EventData {
    id: number;
    host: Host;
    title: string;
    date: string;
    eventImage: any;
}

const eventData: EventData = {
    id: 1,
    host: {
        id: 1,
        name: "Julien L.",
        age: 28,
        avatar: require("../../img/little-profil-photo.png"), // Image locale
        rating: 4
    },
    title: "Conversation Anglais en ligne",
    date: "Dim. 12 oct. - 08:45",
    eventImage: require("../../img/billard-exemple.jpg"),
};


const ParticipantEvaluation: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [presence, setPresence] = useState<{ [key: number]: string }>({});
    const [ratings, setRatings] = useState<{ [key: number]: number }>({});

    const handlePresence = (id: number, value: string) => {
        setPresence(prev => ({ ...prev, [id]: value }));
    };

    const handleRating = (id: number, rating: number) => {
        setRatings(prev => ({ ...prev, [id]: rating }));
    };

    return (
        <View className="flex-1">
            {/* HEADER */}
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        Evaluation
                    </Text>
                    <TouchableOpacity>
                        <MaterialIcons name="close" size={25} color="red" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* ScrollView contenant tout le contenu */}
            <ScrollView className={`p-0 ${isDarkMode ? "bg-black" : "bg-white"} min-h-screen`} contentContainerStyle={{ paddingBottom: 170 }}>

                {/* 📌 Carte de l'événement */}
                <TouchableOpacity onPress={() => navigation.navigate("ActivityOverview")} className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} rounded-2xl shadow-lg p-4 mx-4`}
                    style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 5, // Pour Android
                    }}>
                    {/* Image principale */}
                    <View className="relative">
                        <Image
                            source={eventData.eventImage}
                            className="w-full h-48 rounded-lg"
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
                    <View className="mt-8 items-center">
                        <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold text-lg text-center`}>
                            {eventData.title}
                        </Text>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"} text-base mt-1`}>
                            {eventData.date}
                        </Text>
                    </View>



                </TouchableOpacity>

                {/* 📌 Liste d'évaluation des participants */}
                <View className="mt-6">
                    <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F2F2]"} rounded-lg p-4 mb-4`}>
                        <View className="flex-row items-start">
                            {/* Image de profil */}
                            <Image source={eventData.host.avatar} className="w-12 h-12 rounded-full mr-3" />

                            {/* Informations (Nom + Âge + Note) */}
                            <View className="flex-1">
                                {/* Nom et âge */}
                                <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"} font-bold text-lg`}>
                                    {eventData.host.name} <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"}`}>{eventData.host.age} ans</Text>
                                </Text>

                                {/* Note interactive */}
                                <View className="flex-row items-center mt-2">
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"} text-base font-semibold mr-3`}>Note</Text>
                                    {Array(5).fill(0).map((_, index) => (
                                        <TouchableOpacity key={index} onPress={() => handleRating(eventData.host.id, index + 1)}>
                                            <MaterialIcons
                                                name="star-rate"
                                                size={22}
                                                color={index < (ratings[eventData.host.id] || eventData.host.rating) ? "gold" : "gray"}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View className={`absolute bottom-6 left-0 right-0 ${isDarkMode ? "bg-black" : "bg-white"} p-4 flex-row justify-between`}>
                <TouchableOpacity className={`px-8 py-3 border ${isDarkMode ? "border-[#FF4D4D]" : "border-[#FF4D4D]"} rounded-lg`}>
                    <Text className="text-[#FF4D4D] font-bold">Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity className={`px-8 py-3 ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} rounded-lg`}>
                    <Text className="text-white font-bold">Publier</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ParticipantEvaluation;
