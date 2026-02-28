import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from "../../screens/ThemeContext";
import { BlurView } from '@react-native-community/blur';
import GhostModeModal from './GhostModeModal';
import FriendRequestModal from './FriendRequestModal';
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    ProfilProAdd: undefined;
    ProfilAssoAdd: undefined;
    ProfilPersonOverview: undefined;
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
    hobby: string;
    image: any; // ou ImageSourcePropType si tu veux être plus strict
    type: "Pro" | "Asso";
}


const user: User[] = [
    {
        id: '1',
        name: 'Sophie L.',
        age: 24,
        city: 'Paris 18',
        image: require('../../img/little-profil-photo.png'),
    },
    {
        id: '2',
        name: 'Emma R.',
        age: 26,
        city: 'Paris 18',
        image: require('../../img/little-profil-photo.png'),
    },
];

const proAsso: ProAsso[] = [
    {
        id: '3',
        name: 'Le Froggy Bar',
        city: 'Lyon',
        hobby: 'Peinture 🖌️',
        image: require('../../img/little-profil-photo.png'),
        type: 'Pro'
    },
    {
        id: '4',
        name: 'Le Froggy Bar',
        city: 'Lyon',
        hobby: 'Peinture 🖌️',
        image: require('../../img/little-profil-photo.png'),
        type: 'Asso'
    },
];

type CombinedItem =
    | (User & { itemType: 'user' })
    | (ProAsso & { itemType: 'proAsso' });


const ProfileView: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [ghostModeModalVisible, setGhostModeModalVisible] = useState(false);
    const [friendRequestModalVisible, setFriendRequestModeModalVisible] = useState(false);
    const [selectedUserName, setSelectedUserName] = useState("");

    // Fusion des données
    const combinedData: CombinedItem[] = [
        ...user.map(user => ({ ...user, itemType: 'user' as const })),
        ...proAsso.map(proAsso => ({ ...proAsso, itemType: 'proAsso' as const })),
    ];


    return (
        <View className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"}`}>

            <GhostModeModal visible={ghostModeModalVisible} onClose={() => setGhostModeModalVisible(false)} />

            <FriendRequestModal
                name={selectedUserName}
                visible={friendRequestModalVisible}
                onClose={() => setFriendRequestModeModalVisible(false)}
                onConfirm={() => {
                    Toast.show({
                        type: "success",
                        text1: `Demande envoyée ${ "à " + selectedUserName || ""} ✅`,
                        text2: `Votre demande d’ami a été envoyée avec succès.`,
                        visibilityTime: 2500,
                        position: 'top',
                        topOffset: 60,
                    });
                    setFriendRequestModeModalVisible(false);
                }}
            />

            <TouchableOpacity onPress={() => setGhostModeModalVisible(true)}
                className='flex-row justify-end px-4 mt-2'
            >
                <Image source={require("../../img/ghost.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} className='h-10 w-10' />
            </TouchableOpacity>

            <FlatList
                data={combinedData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => {
                        if (item.itemType === 'user') {
                            navigation.navigate("ProfilPersonOverview");
                        } else if (item.type === 'Pro') {
                            navigation.navigate("ProfilProAdd");
                        } else {
                            navigation.navigate("ProfilAssoAdd");
                        }
                    }} className="flex-row items-center justify-between px-4 py-3">
                        {/* Left: Avatar + Infos */}
                        <View className="flex-row items-center space-x-3">
                            <BlurView
                                blurType="light"
                                blurAmount={15}
                                reducedTransparencyFallbackColor="white"
                                style={{
                                    borderRadius: 20, // très léger pour éviter un effet trop carré
                                    alignSelf: 'flex-start',
                                }}
                            >
                                <Image
                                    source={item.image}
                                    className="w-12 h-12 rounded-full"
                                    resizeMode="cover"
                                />
                            </BlurView>


                            <View className='ml-2'>
                                <BlurView
                                    blurType="light"
                                    blurAmount={15}
                                    reducedTransparencyFallbackColor="white"
                                    style={{
                                        borderRadius: 8, // très léger pour éviter un effet trop carré
                                        alignSelf: 'flex-start',
                                    }}
                                >
                                    {item.itemType === 'user' ? (
                                        <>
                                            <Text className={`${isDarkMode ? "text-white" : "text-black"} font-medium`}>
                                                {item.name}  {item.age} ans
                                            </Text>

                                        </>
                                    ) : (
                                        <>
                                            <View className="flex-row">
                                                <Text className={`${isDarkMode ? "text-white" : "text-black"} font-medium`}>
                                                    {item.name}
                                                </Text>
                                                <Text className={`font-medium ml-1 ${item.type === 'Pro' ? 'text-[#8260D2]' : 'text-[#008F29]'}`}>
                                                    {item.type}
                                                </Text>
                                            </View>
                                        </>
                                    )}

                                </BlurView>
                                <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold`}>{item.city}</Text>
                            </View>
                        </View>

                        {/* Right: Bouton */}
                        <TouchableOpacity onPress={() => {
                            setSelectedUserName(item.name);
                            setFriendRequestModeModalVisible(true);
                        }}
                            className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-gray-200"} px-3 py-2 rounded-full`}
                        >
                            <Text className={`${isDarkMode ? "text-white" : "text-black"} text-sm font-medium`}>Demander en ami</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}

                // Séparer d'un trait gris chaque user
                ItemSeparatorComponent={() => (
                    <View style={{ height: 1, backgroundColor: '#D1D5DB', marginHorizontal: 16 }} />
                )}
            />
        </View>
    );
};

export default ProfileView;
