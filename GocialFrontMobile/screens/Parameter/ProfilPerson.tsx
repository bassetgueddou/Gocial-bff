import React, { useState, useRef } from "react";
import { View, Image, Text, TouchableOpacity, FlatList, Dimensions, ScrollView, KeyboardAvoidingView, Platform, NativeScrollEvent, NativeSyntheticEvent, } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    ProfilPersonPreview: undefined;
    EditLearnMore: undefined;
    EditAbout: undefined;
    EditIdentity: undefined;
    EditSocialNetworks: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get("window");

const images = [
    require("../../img/profile-picture-exemple.jpg"), // Image 1
    require("../../img/profile-picture-exemple.jpg"), // Image 2 (remplace par une autre)
];


const ProfilPerson: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    interface InfoItem {
        label: string;
        value: string;
    }

    const infoData: InfoItem[] = [
        { label: "Langues", value: "Français, Anglais" },
        { label: "Passions", value: "/" },
        { label: "Profession", value: "/" },
        { label: "Etudes", value: "/" },
        { label: "Université / Lycée", value: "/" },
        { label: "Alcool", value: "/" },
        { label: "Tabac", value: "/" },
        { label: "Alimentation", value: "/" },
        { label: "Enfants", value: "/" },
    ];

    return (
        <View className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"} pb-8`}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView className="flex-1">

                    {/* Carrousel d'images */}
                    <View className="relative">
                        <FlatList
                            ref={flatListRef}
                            data={images}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(_, index) => index.toString()}
                            onScroll={handleScroll}
                            renderItem={({ item }) => (
                                <Image
                                    source={item}
                                    style={{ width: width, height: height / 3, resizeMode: "cover" }}
                                />
                            )}
                        />

                        {/* SafeArea pour protéger les boutons */}
                        <SafeAreaView className="absolute top-0 left-0 right-0">
                            <View className="flex-row justify-between items-center px-4 pt-4">
                                {/* Bouton de retour */}
                                <TouchableOpacity onPress={() => navigation.goBack()}>
                                    <MaterialIcons name="arrow-back-ios" size={25} color="black" />
                                </TouchableOpacity>

                                {/* Bouton Modifier */}
                                <TouchableOpacity className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"}  flex-row items-center px-4 py-2 rounded-lg`}>
                                    <MaterialIcons name="edit" size={18} color="white" />
                                    <Text className="text-white font-semibold ml-2">Modifier</Text>
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>

                        {/* Indicateurs de pagination dynamiques */}
                        <View className="absolute bottom-6 left-0 right-0 flex-row justify-center">
                            {images.map((_, index) => (
                                <View
                                    key={index}
                                    style={{
                                        height: 3,
                                        width: 12,
                                        backgroundColor: currentIndex === index ? "white" : "rgba(255, 255, 255, 0.5)",
                                        marginHorizontal: 4,
                                        borderRadius: 4,
                                    }}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Conteneur Profil */}
                    <View className={`${isDarkMode ? "bg-black" : "bg-white"} px-4 pt-2`}>

                        {/* Bouton Modifier */}
                        <View className="flex-row justify-between mb-1">
                            <TouchableOpacity onPress={() => navigation.navigate("EditIdentity")} className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"}  flex-row items-center px-4 py-2 rounded-lg`}>
                                <MaterialIcons name="edit" size={18} color="white" />
                                <Text className="text-white font-semibold ml-2 text-base">Modifier</Text>
                            </TouchableOpacity>

                            <TouchableOpacity className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"}  flex-row items-center px-4 py-2 rounded-lg`}>
                                <MaterialIcons name="edit" size={18} color="white" />
                                <Text className="text-white font-semibold ml-2 text-base">Modifier</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Nom et Modifier */}
                        <View className="flex-row justify-between items-start">
                            <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold text-xl`}>Sophie L.</Text>
                            <Text className={`${isDarkMode ? "text-white" : "text-black"} text-lg font-bold`}>@sophiel119</Text>
                        </View>

                        {/* Présence et Étoiles */}
                        <View className="flex-row items-center mt-2">
                            <View className="bg-green-600 px-3 py-[0.2rem] rounded-lg">
                                <Text className="text-white font-semibold text-sm">100% Présence</Text>
                            </View>

                            {/* Étoiles */}
                            <View className="flex-row ml-3">
                                {Array(5).fill(0).map((_, index) => (
                                    <FontAwesome key={index} name="star" size={20} color="gold" />
                                ))}
                            </View>
                        </View>

                        {/* Informations (Ville, Âge, Activités) */}
                        <View className="flex-row justify-between mt-4">
                            <View className={`border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg`}>
                                <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>Paris 18</Text>
                            </View>

                            <View className="border border-[#065C98] px-4 py-2 rounded-lg">
                                <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>24 ans</Text>
                            </View>

                            <TouchableOpacity className="border border-[#065C98] px-4 py-2 rounded-lg">
                                <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>2 Activités</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className={`mt-8 w-full`}>
                        <View className="flex-row items-center justify-between px-4 mb-2">
                            <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>
                                À Propos
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("EditAbout")} className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} flex-row items-center px-4 py-2 rounded-lg`}>
                                <MaterialIcons name="edit" size={18} color="white" />
                                <Text className="text-white font-semibold ml-2">Modifier</Text>
                            </TouchableOpacity>
                        </View>

                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>Salut, c’est parti pour Gosial ! </Text>
                        </View>
                    </View>

                    <View className={`mt-6 w-full`}>
                        <View className="flex-row items-center justify-between px-4 mb-2">
                            <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>
                                Réseaux
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("EditSocialNetworks")} className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} flex-row items-center px-4 py-2 rounded-lg`}>
                                <MaterialIcons name="edit" size={18} color="white" />
                                <Text className="text-white font-semibold ml-2">Modifier</Text>
                            </TouchableOpacity>
                        </View>

                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full flex-row items-center justify-between`}>
                            {/* Bouton "Mes amis" */}
                            <TouchableOpacity className={`border ${isDarkMode ? "bg-black border-[#1A6EDE] text-[#1A6EDE]" : "border-[#065C98] bg-white"} flex-row items-center px-3 py-2 rounded-lg w-auto`}>
                                <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"} font-medium`}>Mes amis</Text>
                            </TouchableOpacity>

                            {/* Icônes des réseaux sociaux */}
                            <View className="flex-row items-center space-x-3">
                                <TouchableOpacity>
                                    <Image source={require("../../img/instagram-social.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} className="h-8 w-8 mr-2" />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Image source={require("../../img/tiktok-social.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} className="h-8 w-8" />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Image source={require("../../img/facebook-social.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} className="h-7 w-7 mr-1" />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Image source={require("../../img/snapchat-social.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} className="h-8 w-8" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View className="mt-6 w-full">
                        {/* En-tête */}
                        <View className="flex-row items-center justify-between px-4 mb-2">
                            <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>En savoir plus</Text>

                            <TouchableOpacity onPress={() => navigation.navigate("EditLearnMore")} className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"}  flex-row items-center px-4 py-2 rounded-lg`}>
                                <MaterialIcons name="edit" size={18} color="white" />
                                <Text className="text-white font-semibold ml-2">Modifier</Text>
                            </TouchableOpacity>
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

                        {/* Bouton Aperçu */}
                        <TouchableOpacity onPress={() => navigation.navigate("ProfilPersonPreview")} className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} px-6 py-3 rounded-lg mt-6 w-[90%] self-center`}>
                            <Text className="text-white font-semibold text-center">Aperçu</Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default ProfilPerson;
