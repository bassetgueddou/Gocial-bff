import React, { useState, useRef } from "react";
import { View, Image, Text, TouchableOpacity, FlatList, Dimensions, ScrollView, KeyboardAvoidingView, Platform, NativeScrollEvent, NativeSyntheticEvent, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../../src/contexts/AuthContext";

const { width, height } = Dimensions.get("window");

const ProfilAsso: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<any>();
    const { user } = useAuth();

    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    if (!user) return <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" /></View>;

    const displayName = user.company_name || `${user.first_name || ""} ${(user.last_name || "").charAt(0)}.`.trim();
    const pseudo = user.pseudo ? `@${user.pseudo}` : "";
    const initials = (displayName || "?").substring(0, 2).toUpperCase();
    const images = user.avatar_url ? [{ uri: user.avatar_url }] : [];

    const infoData = [
        { label: "Langues", value: (user as any).languages || "/" },
        { label: "Secteurs d'activités", value: (user as any).profession || "/" },
        { label: "Horaires d'ouverture", value: "/" },
        { label: "Jours d'ouverture", value: "/" },
        { label: "Moyens de paiements", value: "/" },
    ];

    return (
        <View className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"} pb-8`}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView className="flex-1">
                    <View className="relative">
                        {images.length > 0 ? (
                            <FlatList
                                ref={flatListRef}
                                data={images}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(_, index) => index.toString()}
                                onScroll={handleScroll}
                                renderItem={({ item }) => (
                                    <Image source={item} style={{ width, height: height / 3, resizeMode: "cover" }} />
                                )}
                            />
                        ) : (
                            <View style={{ width, height: height / 3, backgroundColor: "#E8A838", alignItems: "center", justifyContent: "center" }}>
                                <Text style={{ fontSize: 60, color: "white", fontWeight: "bold" }}>{initials}</Text>
                            </View>
                        )}
                        <SafeAreaView className="absolute top-0 left-0 right-0">
                            <View className="flex-row justify-between items-start px-4 pt-4">
                                <TouchableOpacity onPress={() => navigation.goBack()}>
                                    <MaterialIcons name="arrow-back-ios" size={25} color="white" />
                                </TouchableOpacity>
                                <View className="flex-col items-end space-y-2">
                                    <TouchableOpacity className="bg-[#E8A838] px-4 py-2 rounded-lg">
                                        <Text className="text-white font-semibold">Asso</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => navigation.navigate("EditIdentity")} className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} flex-row items-center px-4 py-2 rounded-lg mt-1`}>
                                        <MaterialIcons name="edit" size={18} color="white" />
                                        <Text className="text-white font-semibold ml-2">Modifier</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </SafeAreaView>
                    </View>

                    <View className={`${isDarkMode ? "bg-black" : "bg-white"} px-4 pt-2`}>
                        <View className="flex-row justify-between items-start">
                            <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold text-xl`}>{displayName}</Text>
                            <Text className={`${isDarkMode ? "text-white" : "text-black"} text-lg font-bold`}>{pseudo}</Text>
                        </View>
                        <View className="flex-row mt-2">
                            {Array(5).fill(0).map((_, index) => (
                                <FontAwesome key={index} name="star" size={20} color="gold" />
                            ))}
                        </View>
                        <View className="flex-row justify-between mt-4">
                            <View className={`border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg`}>
                                <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{user.city || "\u2014"}</Text>
                            </View>
                            <TouchableOpacity className={`border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg`}>
                                <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>Activités</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mt-8 w-full">
                        <View className="flex-row items-center justify-between px-4 mb-2">
                            <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>À Propos</Text>
                            <TouchableOpacity onPress={() => navigation.navigate("EditAbout")} className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} flex-row items-center px-4 py-2 rounded-lg`}>
                                <MaterialIcons name="edit" size={18} color="white" />
                                <Text className="text-white font-semibold ml-2">Modifier</Text>
                            </TouchableOpacity>
                        </View>
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{user.bio || user.description || "Aucune description"}</Text>
                        </View>
                    </View>

                    <View className="mt-6 w-full">
                        <View className="flex-row items-center justify-between px-4 mb-2">
                            <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>Réseaux</Text>
                            <TouchableOpacity onPress={() => navigation.navigate("EditSocialNetworks")} className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} flex-row items-center px-4 py-2 rounded-lg`}>
                                <MaterialIcons name="edit" size={18} color="white" />
                                <Text className="text-white font-semibold ml-2">Modifier</Text>
                            </TouchableOpacity>
                        </View>
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full flex-row items-center justify-between`}>
                            <TouchableOpacity className={`border ${isDarkMode ? "bg-black border-[#1A6EDE]" : "border-[#065C98] bg-white"} flex-row items-center px-3 py-2 rounded-lg`}>
                                <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"} font-medium`}>Mes amis</Text>
                            </TouchableOpacity>
                            <View className="flex-row items-center space-x-3">
                                <Image source={require("../../img/instagram-social.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} className="h-8 w-8 mr-2" />
                                <Image source={require("../../img/tiktok-social.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} className="h-8 w-8" />
                                <Image source={require("../../img/facebook-social.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} className="h-7 w-7 mr-1" />
                                <Image source={require("../../img/snapchat-social.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} className="h-8 w-8" />
                            </View>
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between px-4 mb-2 mt-4">
                        <Text className={`font-bold text-xl px-4 pt-4 ${isDarkMode ? "text-white" : "text-black"}`}>Etablissement</Text>
                    </View>
                    <View className="p-4">
                        <View className="flex-row items-center mb-3">
                            <MaterialIcons name="place" size={20} color={isDarkMode ? "white" : "black"} />
                            <Text className={`${isDarkMode ? "text-white" : "text-black"} font-medium ml-2`}>{user.address || "Adresse de l'établissement"}</Text>
                        </View>
                    </View>

                    <View className="mt-6 w-full">
                        <View className="flex-row items-center justify-between px-4 mb-2">
                            <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>En savoir plus</Text>
                            <TouchableOpacity onPress={() => navigation.navigate("EditLearnMore")} className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} flex-row items-center px-4 py-2 rounded-lg`}>
                                <MaterialIcons name="edit" size={18} color="white" />
                                <Text className="text-white font-semibold ml-2">Modifier</Text>
                            </TouchableOpacity>
                        </View>
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

                        <TouchableOpacity onPress={() => navigation.navigate("ProfilAssoPreview")} className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} px-6 py-3 rounded-lg mt-6 w-[90%] self-center`}>
                            <Text className="text-white font-semibold text-center">Aperçu</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default ProfilAsso;
