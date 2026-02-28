import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, FlatList, Dimensions } from "react-native";
import { useTheme } from "../../screens/ThemeContext";
import ExternalMessageModal from "../Message/ExternalMessageModal";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import DeleteFriendRequestModal from "./DeleteFriendRequestModal";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    ProfilPersonOverview: undefined;
    ProfilProHome: undefined;
    ProfilAssoHome: undefined;
    ProfilProAdd: undefined;
    ProfilAssoAdd: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;


type User = {
    id: string;
    name: string;
    age: number;
    city: string;
    hobby: string;
    image: any;
};

// Données des utilisateurs
const receivedUsers: User[] = [
    {
        id: '1',
        name: 'Sophie L.',
        age: 24, city: 'Paris 18',
        hobby: 'Accrobranche 🧗‍♀️',
        image: require('../../img/profile-picture-exemple.jpg')
    },
    {
        id: '2',
        name: 'Emma R.',
        age: 26, city: 'Lyon',
        hobby: 'Peinture 🖌️',
        image: require('../../img/profile-picture-exemple.jpg')
    },
];

const acceptedUsers: User[] = [
    {
        id: '3',
        name: 'Lucas M.',
        age: 27,
        city: 'Marseille',
        hobby: 'Randonnée 🏔️',
        image: require('../../img/little-profil-photo.png')
    },
];

const sentUsers: User[] = [
    {
        id: '4',
        name: 'Léa D.',
        age: 25,
        city: 'Nice',
        hobby: 'Photographie 📸',
        image: require('../../img/little-profil-photo.png')
    },
];

const SCREEN_WIDTH = Dimensions.get('window').width;

const Request: React.FC = () => {
    const { isDarkMode } = useTheme();

    const navigation = useNavigation<NavigationProp>();

    const [activeTab, setActiveTab] = useState<"received" | "accepted" | "sent">("received");

    const [modalExternalMessageVisible, setModalExternalMessageVisible] = useState(false);
    const [deleteFriendRequestModalVisible, setDeleteFriendRequestModalVisible] = useState(false);
    const [selectedUserName, setSelectedUserName] = useState("");

    // Fonction pour récupérer les données selon l'onglet actif
    const getUsers = () => {
        switch (activeTab) {
            case "received":
                return receivedUsers;
            case "accepted":
                return acceptedUsers;
            case "sent":
                return sentUsers;
            default:
                return [];
        }
    };

    return (
        <View className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"}`}>
            <ExternalMessageModal visible={modalExternalMessageVisible} onClose={() => setModalExternalMessageVisible(false)} />

            {/* Navigation entre les vues */}
            <View className={`flex-row justify-around ${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} mt-2`} style={{ boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <TouchableOpacity onPress={() => setActiveTab("received")} className={`flex-1 py-2 items-center ${activeTab === "received" ? "bg-[#065C98]" : isDarkMode ? "bg-[#1D1E20]" : ""}`}>
                    <Text className={`text-lg ${activeTab === "received" ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>Reçues</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab("accepted")} className={`flex-1 py-2 items-center ${activeTab === "accepted" ? "bg-[#065C98]" : isDarkMode ? "bg-[#1D1E20]" : ""}`}>
                    <Text className={`text-lg ${activeTab === "accepted" ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>Acceptées</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab("sent")} className={`flex-1 py-2 items-center ${activeTab === "sent" ? "bg-[#065C98]" : isDarkMode ? "bg-[#1D1E20" : ""}`}>
                    <Text className={`text-lg ${activeTab === "sent" ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>Envoyées</Text>
                </TouchableOpacity>
            </View>

            {/* Vue des demandes reçues (style carrousel) */}
            {activeTab === "received" ? (
                <ScrollView
                    horizontal
                    pagingEnabled={false}
                    snapToInterval={SCREEN_WIDTH * 0.85 + 16}
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        marginTop: 20,
                    }}
                >
                    {receivedUsers.map((profile) => (
                        <View key={profile.id}>

                            {/* en fonction si c'est "personne" "pro" ou "asso" (ProfilProAdd et ProfilAssoAdd tu rajoutes) il faut rajouter le bon lien de profile */}
                            <TouchableOpacity onPress={() => navigation.navigate("ProfilPersonOverview")} className="items-center" style={{ width: SCREEN_WIDTH * 0.85, marginRight: 8 }}>
                                <View className="rounded-3xl overflow-hidden bg-white shadow-lg w-[85%]">
                                    <View className="relative w-full h-[30rem]">
                                        <Image
                                            source={profile.image}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                        <View className="absolute bottom-0 left-0 right-0 px-4 py-3">
                                            <Text className="text-white text-2xl font-bold">{profile.name}</Text>
                                            <Text className="text-white text-xl font-bold">
                                                {profile.age} ans {profile.city}
                                            </Text>
                                            <Text className="text-white text-xl font-bold">❤️ {profile.hobby}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View className="flex-row justify-center w-full mt-6 gap-x-12">
                                    <TouchableOpacity className="w-[35%] rounded-full border border-red-500 py-2 items-center">
                                        <Text className="text-red-500 font-semibold">Refuser</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`w-[35%] rounded-full border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} py-2 items-center`}
                                        onPress={() => {
                                            Toast.show({
                                                type: "success",
                                                text1: "Demande acceptée ✅",
                                                text2: `${profile.name} est maintenant dans vos amis.`,
                                                visibilityTime: 2500,
                                                position: 'top',
                                                topOffset: 60,
                                            });
                                        }}
                                    >
                                        <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"} font-semibold`}>Accepter</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            ) : (
                // Vue pour "Acceptées" et "Envoyées" (liste simple)
                <FlatList
                    data={getUsers()}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (

                        // en fonction si c'est "personne" "pro" ou "asso" (ProfilProHome et ProfilAssoHome tu rajoutes) il faut rajouter le bon lien de profile 
                        <TouchableOpacity onPress={() => {
                            navigation.navigate("ProfilPersonOverview");
                        }} className="flex-row items-center justify-between px-4 py-4">
                            {/* Avatar + Infos */}
                            <View className="flex-row items-center space-x-3">
                                <Image source={item.image} className="w-12 h-12 rounded-full" resizeMode="cover" />
                                <View className='ml-2'>
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"} font-medium`}>
                                        {item.name} {item.age} ans
                                    </Text>
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold`}>{item.city}</Text>
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"}`}><Text className='text-xs'>❤️</Text> {item.hobby}</Text>
                                </View>
                            </View>

                            {/* Bouton */}
                            {activeTab === "sent" ? (
                                <TouchableOpacity
                                    className="bg-red-500 px-3 py-2 rounded-full"
                                    onPress={() => {
                                        setSelectedUserName(item.name);
                                        setDeleteFriendRequestModalVisible(true);
                                    }}
                                >
                                    <Text className="text-white text-sm font-medium">Supprimer</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={() => setModalExternalMessageVisible(true)} className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-gray-200"} px-3 py-2 rounded-full`}>
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"} text-sm font-medium`}>Message</Text>
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 1, backgroundColor: '#D1D5DB', marginHorizontal: 16 }} />
                    )}
                />
            )}

            <DeleteFriendRequestModal
                visible={deleteFriendRequestModalVisible}
                name={selectedUserName}
                onCancel={() => setDeleteFriendRequestModalVisible(false)}
                onConfirm={() => {
                    setDeleteFriendRequestModalVisible(false);
                    Toast.show({
                        type: "success",
                        text1: "Demande supprimée 🗑️",
                        text2: `${selectedUserName} a été retiré(e) de vos demandes.`,
                        visibilityTime: 2500,
                        position: 'top',
                        topOffset: 60,
                    });
                }}
            />

        </View>
    );
};

export default Request;
