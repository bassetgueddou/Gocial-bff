import { View, Text, TouchableOpacity, ScrollView, Linking, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import React, { useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker, Region } from "react-native-maps";
import ShareModal from "../Home/ShareModal";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    CATitle: undefined;
    ProfilPersonPreview: undefined;
    CreateActivity: undefined;
    CARealInformation: undefined;
    CANumberParticipants: undefined;
    CARealRestriction: undefined;
    ParticipationHostTopTabs: undefined;
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
}

const eventData: EventData = {
    id: 1,
    host: {
        avatar: require("../../img/little-profil-photo.png"), // Image locale
    },
    title: "Conversation Anglais en ligne",
    date: "Dim. 12 oct. - 08:45",
    eventImage: require("../../img/billard-exemple.jpg"),
};

interface InfoItem {
    id: number;
    label: string;
    value: string;
}

const infoData: InfoItem[] = [
    { id: 1, label: "Type d’activité", value: "Accrobranche" },
    { id: 2, label: "Age des participants", value: "18-122" },
    { id: 3, label: "Types de participants ", value: "Tout le monde" },
    { id: 4, label: "Visibilité", value: "Publique" },
    { id: 5, label: "Validation des participants", value: "Manuelle" },
    { id: 6, label: "Participants non Gocial ", value: "Refusés" },
];

interface Coordinates {
    latitude: number;
    longitude: number;
}

const ModifActivityOverview: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [modalShareVisible, setModalShareVisible] = useState(false);

    const locationAddress: Coordinates = {
        latitude: 48.872,
        longitude: 2.343, // Coordonnées approximatives de 34 rue Richer, Paris
    };

    const locationAppointment: Coordinates = {
        latitude: 48.762,
        longitude: 2.140, // Coordonnées approximatives de 8 Rue Léon Schwartzenberg, Paris
    };

    // Centrage dynamique
    const midLat = (locationAddress.latitude + locationAppointment.latitude) / 2;
    const midLng = (locationAddress.longitude + locationAppointment.longitude) / 2;

    const initialRegion: Region = {
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: Math.abs(locationAddress.latitude - locationAppointment.latitude) * 4 || 0.05,
        longitudeDelta: Math.abs(locationAddress.longitude - locationAppointment.longitude) * 4 || 0.05,
    };

    interface InfoItem {
        label: string;
        value: string;
    }

    const [liked, setLiked] = useState<boolean>(false);
    const [likesCount, setLikesCount] = useState<number>(0);

    const handleLike = () => {
        setLiked(!liked);
        setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    };

    return (
        <View className="flex-1">
            {/* HEADER */}
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <ShareModal visible={modalShareVisible} onClose={() => setModalShareVisible(false)} />

                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="close" size={25} color="red" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* ScrollView contenant tout le contenu */}
            <ScrollView className={`${isDarkMode ? "bg-black" : "bg-white"}`} contentContainerStyle={{ flexGrow: 1, paddingBottom: 130 }}>

                {/* Image principale */}
                <View className="relative">
                    <TouchableOpacity onPress={() => navigation.navigate("CATitle")}>
                        <View className="relative">
                            <Image
                                source={eventData.eventImage}
                                className="w-full h-48"
                            />

                            {/* Icône d'édition en haut à droite avec fond blanc */}
                            <View className="absolute right-2 top-2 bg-white p-2 rounded-lg">
                                <MaterialIcons
                                    name="edit"
                                    size={18}
                                    color={isDarkMode ? "#1A6EDE" : "#065C98"}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>


                    {/* Image de profil superposée */}
                    <TouchableOpacity onPress={() => navigation.navigate("ProfilPersonPreview")} className="absolute -bottom-6 left-4 rounded-full">
                        <Image
                            source={eventData.host.avatar}
                            className="w-[4rem] h-[4rem] rounded-full"
                        />
                    </TouchableOpacity>
                </View>

                {/* Contenu texte */}
                <View className="mt-2 items-center">
                    <TouchableOpacity onPress={() => navigation.navigate("CATitle")} className="flex-row">
                        <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold text-lg text-center`}>
                            {eventData.title}
                        </Text>
                        <MaterialIcons name="edit" size={18} color={isDarkMode ? "#1A6EDE" : "#065C98"} className="relative left-1" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("CARealInformation")} className="flex-row">
                        <Text className={`${isDarkMode ? "text-white" : "text-black"} text-base mt-1`}>
                            {eventData.date}
                        </Text>
                        <MaterialIcons name="edit" size={18} color={isDarkMode ? "#1A6EDE" : "#065C98"} className="relative left-1" />
                    </TouchableOpacity>
                </View>

                {/* Informations (Ville, Âge, Activités) */}
                <View className="flex-row items-start justify-center px-[3rem] mt-4">
                    <TouchableOpacity onPress={() => navigation.navigate("CARealInformation")} className={`items-center flex-row border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg mr-6`}>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>Paris</Text>
                        <MaterialIcons name="edit" size={18} color={isDarkMode ? "#1A6EDE" : "#065C98"} className="relative left-1" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("CANumberParticipants")} className={`items-center flex-row border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg`}>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>0/5</Text>
                        <MaterialIcons name="edit" size={18} color={isDarkMode ? "#1A6EDE" : "#065C98"} className="relative left-1" />
                    </TouchableOpacity>

                    {/* <TouchableOpacity className={`border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg`}>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>Gratuit</Text>
                    </TouchableOpacity> */}
                </View>

                <View className="flex-row justify-end gap-x-1">
                    <Pressable
                        onPress={handleLike}
                        className={`w-[10%] flex-row items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"} rounded-xl p-2`}
                        style={({ pressed }) => [
                            { opacity: pressed ? 0.6 : 1 },
                        ]}
                    >
                        <MaterialIcons
                            name={liked ? "favorite" : "favorite-border"}
                            size={13}
                            color={liked ? "red" : isDarkMode ? "white" : "black"}
                        />
                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`} style={{ minWidth: 16, textAlign: "center" }}>
                            {likesCount}
                        </Text>
                    </Pressable>

                    <TouchableOpacity onPress={() => setModalShareVisible(true)} className={`w-[12%] items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"}  rounded-xl p-[0.7rem]`}>
                        <FontAwesome name="share" size={13} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>

                <View className={`p-4 ${isDarkMode ? "bg-black" : "bg-white"}`}>
                    {/* Texte haut */}
                    <TouchableOpacity onPress={() => navigation.navigate("CANumberParticipants")} className="flex-row">
                        <Text className={`text-base mb-2 ${isDarkMode ? "text-white" : ""}`}>1/5 Participant  <Text>(0 en attente)</Text></Text>
                        <MaterialIcons name="edit" size={18} color={isDarkMode ? "#1A6EDE" : "#065C98"} className="relative left-1" />
                    </TouchableOpacity>

                    {/* Ligne avatar + bouton */}
                    <View className="flex-row mb-2">
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        >
                            {/* Avatar */}
                            <TouchableOpacity onPress={() => navigation.navigate("ProfilPersonPreview")}>
                                <Image
                                    source={require("../../img/little-profil-photo.png")} // Remplace par ton chemin
                                    className="w-10 h-10 rounded-full"
                                />
                            </TouchableOpacity>

                        </ScrollView>

                        {/* Bouton bleu avec flèche */}
                        <TouchableOpacity onPress={() => navigation.navigate("ParticipationHostTopTabs")} className={`ml-2 w-[2.45rem] h-[2.45rem] rounded-full ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} justify-center items-center`}>
                            <MaterialIcons name="arrow-forward-ios" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Ligne bas */}
                    <TouchableOpacity onPress={() => navigation.navigate("CANumberParticipants")} className="flex-row">
                        <Text className={`text-sm ${isDarkMode ? "text-white" : ""}`}>
                            + 2 Participants hors Gocial seront avec Alain
                        </Text>
                        <MaterialIcons name="edit" size={18} color={isDarkMode ? "#1A6EDE" : "#065C98"} className="relative left-1" />
                    </TouchableOpacity>
                </View>

                <View className={`mt-2 w-full mb-4`}>
                    <View className="flex-row items-center justify-between px-4 mb-2">
                        <TouchableOpacity onPress={() => navigation.navigate("CATitle")} className="flex-row">
                            <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>
                                Description
                            </Text>
                            <MaterialIcons name="edit" size={18} color={isDarkMode ? "#1A6EDE" : "#065C98"} className="relative left-1" />
                        </TouchableOpacity>
                    </View>

                    <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>Discutons de l’actualité du jour en anglais, dans un esprit conviviale. Tout les niveaux sont les bienvenus.</Text>
                    </View>
                </View>

                {/* Carte avec Marqueur */}
                <View className="h-60 w-full mt-2">
                    <MapView
                        style={{ flex: 1 }}
                        initialRegion={initialRegion}
                    >
                        <Marker coordinate={locationAddress}>
                            <View className="items-center">
                                {/* Bulle d'info */}
                                <View className="bg-white p-2 rounded-lg shadow-md mb-0">
                                    <Text className="font-semibold text-xs text-black">
                                        34 rue Richer, 75009 Paris, France
                                    </Text>
                                    <Text className="text-xs text-gray-600">Environ 20km</Text>
                                </View>

                                {/* Flèche blanche avec l'icône "south" */}
                                <MaterialIcons name="south" size={28} color="white" className="-mt-1" />

                                {/* Icône de localisation */}
                                <MaterialIcons name="location-pin" size={30} color="#C3AE79" />
                            </View>
                        </Marker>

                        <Marker coordinate={locationAppointment}>
                            <View className="items-center">
                                {/* Bulle d'info */}
                                <View className="bg-white p-2 rounded-lg shadow-md mb-0">
                                    <Text className="font-semibold text-xs text-black">
                                        38 Rue Léon Schwartzenberg, 75010 Paris, France
                                    </Text>
                                    <Text className="text-xs text-gray-600">Environ 20km</Text>
                                </View>

                                {/* Flèche blanche avec l'icône "south" */}
                                <MaterialIcons name="south" size={28} color="white" className="-mt-1" />

                                {/* Icône de localisation */}
                                <MaterialIcons name="location-pin" size={30} color="#828799" />
                            </View>
                        </Marker>
                    </MapView>
                </View>

                <View className={`px-4 py-6 ${isDarkMode ? "bg-black" : "bg-white"}`}>
                    <View className="flex-row justify-between">
                        {/* Bloc gauche : Adresse du lieu */}
                        <View className="items-start w-[48%]">
                            <View className="flex-row items-center mb-3">
                                <MaterialIcons name="location-pin" size={20} color="#C3AE79" />
                                <TouchableOpacity onPress={() => navigation.navigate("CARealInformation")} className="flex-row">
                                    <Text className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                        Adresse du lieu
                                    </Text>
                                    <MaterialIcons name="edit" size={18} color={isDarkMode ? "#1A6EDE" : "#065C98"} className="relative left-1" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity className="bg-[#C3AE79] rounded-2xl w-[80%] h-14 justify-center items-center">
                                <Text className="text-white font-semibold text-center leading-tight text-base">
                                    Itinéraire{"\n"}lieu
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Bloc droit : Point de rendez-vous */}
                        <View className="items-start w-[48%]">
                            <View className="flex-row items-center mb-3">
                                <MaterialIcons name="location-pin" size={20} color="#7C7E91" />
                                <TouchableOpacity onPress={() => navigation.navigate("CARealInformation")} className="flex-row">
                                    <Text className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                        Point de rendez-vous
                                    </Text>
                                    <MaterialIcons name="edit" size={18} color={isDarkMode ? "#1A6EDE" : "#065C98"} className="relative left-1" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity className="bg-[#7C7E91] rounded-2xl w-[80%] h-14 justify-center items-center relative left-[1.5rem]">
                                <Text className="text-white font-semibold text-center leading-tight text-base">
                                    Itinéraire{"\n"}rendez-vous
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View className="mt-6 w-full">
                    {/* En-tête */}
                    <View className="flex-row items-center justify-between px-4 mb-2">
                        <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>En savoir plus</Text>
                    </View>

                    {/* Liste des infos */}
                    <View className={`${isDarkMode ? "bg-black" : "bg-white"} rounded-lg`}>
                        {infoData.map((item, index) => {
                            const getTargetScreen = (id: number): keyof RootStackParamList => {
                                switch (id) {
                                    case 1:
                                        return "CreateActivity";
                                    case 2:
                                        return "CARealRestriction";
                                    case 3:
                                        return "CARealRestriction";
                                    case 4:
                                        return "CARealRestriction";
                                    case 5:
                                        return "CARealRestriction";
                                    case 6:
                                        return "CARealRestriction";
                                    default:
                                        return "CreateActivity"; // Fallback
                                }
                            };

                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => navigation.navigate(getTargetScreen(item.id))}
                                >
                                    <MaterialIcons
                                        name="edit"
                                        size={18}
                                        color={isDarkMode ? "#1A6EDE" : "#065C98"}
                                        className="self-end relative right-1"
                                    />
                                    <View className="mt-2">
                                        <View
                                            className={`flex-row justify-between items-center py-3 px-4 ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"
                                                } rounded-lg`}
                                        >
                                            <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{item.label}</Text>
                                            <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{item.value}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View className="px-2 mt-8">
                    <TouchableOpacity
                        className={`px-8 py-3 w-[60%] ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"
                            } rounded-xl flex-row items-center`}
                    >
                        <Text className="text-white font-bold">Plus de modifications</Text>
                        <MaterialIcons className="relative left-4" name="arrow-forward" size={22} color="white" />
                    </TouchableOpacity>
                </View>


            </ScrollView>

            <View className={`absolute bottom-0 left-0 right-0 ${isDarkMode ? 'bg-black' : 'bg-white'} 
                    px-4 py-4 flex-row justify-between items-center`}
                style={{ height: 80 }} >
                <TouchableOpacity className={`px-8 py-3 border border-[#F00020] rounded-lg`}>
                    <Text className={`text-[#F00020] font-bold`}>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity className={`px-8 py-3 ${isDarkMode ? 'bg-[#1A6EDE]' : 'bg-[#065C98]'} rounded-lg`}>
                    <Text className="text-white font-bold">Enregistrer</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

export default ModifActivityOverview;
