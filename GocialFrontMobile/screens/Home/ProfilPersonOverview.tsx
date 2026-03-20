import React, { useState, useRef, useEffect } from "react";
import { View, Image, Text, TouchableOpacity, FlatList, Dimensions, ScrollView, KeyboardAvoidingView, Platform, NativeScrollEvent, NativeSyntheticEvent, ActivityIndicator } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import MoreProfilModal from "./MoreProfilModal";
import ExternalMessageModal from "../Message/ExternalMessageModal";
import Toast from "react-native-toast-message";
import { userService } from "../../src/services/users";
import { friendService } from "../../src/services/friends";

const { width, height } = Dimensions.get("window");

const ProfilPersonOverview: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<Record<string, { userId?: number }>, string>>();
    const userId = route.params?.userId;

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [friendshipStatus, setFriendshipStatus] = useState<string | null>(null);
    const [friendshipId, setFriendshipId] = useState<number | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const [modalMoreProfilVisible, setModalMoreProfilVisible] = useState(false);
    const [modalExternalMessageVisible, setModalExternalMessageVisible] = useState(false);

    useEffect(() => {
        if (!userId) return;
        const fetchUser = async () => {
            try {
                setLoading(true);
                const data = await userService.getUser(userId);
                setUser(data.user || data);
                setFriendshipStatus(data.friendship_status || null);
                setFriendshipId(data.friendship_id || null);
            } catch (err) {
                Toast.show({ type: "error", text1: "Erreur", text2: "Impossible de charger le profil.", position: "top", topOffset: 60 });
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    const getInitials = (): string => {
        if (!user) return "?";
        const f = user.first_name || user.pseudo || "";
        const l = user.last_name || "";
        if (f && l) return (f[0] + l[0]).toUpperCase();
        return (f.slice(0, 2) || "??").toUpperCase();
    };

    const getName = (): string => {
        if (!user) return "";
        if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name[0]}.`;
        return user.pseudo || "Utilisateur";
    };

    const handleFriendAction = async () => {
        if (!userId) return;
        try {
            if (friendshipStatus === "friends" && friendshipId) {
                await friendService.removeFriend(friendshipId);
                setFriendshipStatus(null);
                setFriendshipId(null);
                Toast.show({ type: "error", text1: "Ami supprimé", text2: "Cette personne a été retirée de tes amis.", position: "top", topOffset: 60 });
            } else {
                await friendService.sendRequest(userId);
                setFriendshipStatus("pending_sent");
                Toast.show({ type: "success", text1: "Demande envoyée", text2: "Ta demande d'ami a été envoyée.", position: "top", topOffset: 60 });
            }
        } catch {
            Toast.show({ type: "error", text1: "Erreur", position: "top", topOffset: 60 });
        }
    };

    const getFriendButtonText = (): string => {
        if (friendshipStatus === "friends") return "Supprimer";
        if (friendshipStatus === "pending_sent") return "En attente";
        if (friendshipStatus === "pending_received") return "Accepter";
        return "Ajouter";
    };

    const getFriendButtonColor = (): string => {
        if (friendshipStatus === "friends") return "bg-[#FF0000]";
        if (friendshipStatus === "pending_sent") return "bg-gray-500";
        return "bg-green-500";
    };

    if (loading) {
        return (
            <View className={`flex-1 items-center justify-center ${isDarkMode ? "bg-black" : "bg-white"}`}>
                <ActivityIndicator size="large" color="#065C98" />
            </View>
        );
    }

    if (!user) {
        return (
            <View className={`flex-1 items-center justify-center ${isDarkMode ? "bg-black" : "bg-white"}`}>
                <Text className={`${isDarkMode ? "text-white" : "text-black"} text-lg`}>Profil introuvable</Text>
            </View>
        );
    }

    const images = user.avatar_url ? [{ uri: user.avatar_url }] : [];

    const infoData = [
        { label: "Langues", value: user.languages || "/" },
        { label: "Passions", value: user.passions || "/" },
        { label: "Profession", value: user.profession || "/" },
        { label: "Études", value: user.studies || "/" },
        { label: "École", value: user.school || "/" },
        { label: "Alcool", value: user.alcohol || "/" },
        { label: "Tabac", value: user.tobacco || "/" },
        { label: "Alimentation", value: user.diet || "/" },
    ];

    return (
        <View className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"} pb-8`}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <MoreProfilModal visible={modalMoreProfilVisible} onClose={() => setModalMoreProfilVisible(false)} />

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
                                    <Image source={item} style={{ width: width, height: height / 3, resizeMode: "cover" }} />
                                )}
                            />
                        ) : (
                            <View style={{ width: width, height: height / 3 }} className="bg-[#9BD3E8] items-center justify-center">
                                <Text className="text-5xl font-bold text-black">{getInitials()}</Text>
                            </View>
                        )}

                        <SafeAreaView className="absolute top-0 left-0 right-0">
                            <View className="flex-row justify-between items-center px-4 pt-4">
                                <TouchableOpacity onPress={() => navigation.goBack()}>
                                    <MaterialIcons name="arrow-back-ios" size={25} color="black" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setModalMoreProfilVisible(true)}>
                                    <MaterialIcons name="more-horiz" size={30} color="black" />
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>

                        {images.length > 1 && (
                            <View className="absolute bottom-6 left-0 right-0 flex-row justify-center">
                                {images.map((_: any, index: number) => (
                                    <View key={index} style={{ height: 3, width: 12, backgroundColor: currentIndex === index ? "white" : "rgba(255,255,255,0.5)", marginHorizontal: 4, borderRadius: 4 }} />
                                ))}
                            </View>
                        )}
                    </View>

                    <View className={`${isDarkMode ? "bg-black" : "bg-white"} px-4 pt-2`}>
                        <View className="flex-row justify-between items-start">
                            <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold text-xl`}>{getName()}</Text>
                            <Text className={`${isDarkMode ? "text-white" : "text-black"} text-lg font-bold`}>@{user.pseudo || ""}</Text>
                        </View>

                        <View className="flex-row items-center mt-2">
                            <View className="bg-green-600 px-3 py-[0.2rem] rounded-lg">
                                <Text className="text-white font-semibold text-sm">{user.presence_rate || 100}% Présence</Text>
                            </View>
                            <View className="flex-row ml-3">
                                {Array(5).fill(0).map((_, index) => (
                                    <FontAwesome key={index} name="star" size={20} color={index < (user.rating || 0) ? "gold" : "gray"} />
                                ))}
                            </View>
                        </View>

                        <View className="flex-row justify-between mt-4">
                            <View className={`border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg`}>
                                <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{user.city || "---"}</Text>
                            </View>
                            {user.age && (
                                <View className={`border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg`}>
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{user.age} ans</Text>
                                </View>
                            )}
                            <View className={`border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg`}>
                                <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{user.activities_count || 0} Activités</Text>
                            </View>
                        </View>
                    </View>

                    <View className="mt-8 w-full">
                        <View className="flex-row items-center justify-between px-4 mb-2">
                            <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>À Propos</Text>
                        </View>
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{user.bio || "Aucune description"}</Text>
                        </View>
                    </View>

                    <View className="mt-6 w-full">
                        <View className="flex-row items-center justify-between px-4 mb-2">
                            <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>Réseaux</Text>
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

                    <View className="mt-6 w-full">
                        <View className="flex-row items-center justify-between px-4 mb-2">
                            <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>En savoir plus</Text>
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
                    </View>
                </ScrollView>

                <View className="flex-row justify-between mx-5 mt-2">
                    <TouchableOpacity onPress={handleFriendAction} className={`${getFriendButtonColor()} px-6 py-3 rounded-lg w-[40%]`}>
                        <Text className="text-white font-semibold text-center">{getFriendButtonText()}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setModalExternalMessageVisible(true)} className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} px-6 py-3 rounded-lg w-[40%]`}>
                        <Text className="text-white font-semibold text-center">Écrire</Text>
                    </TouchableOpacity>
                </View>
                <ExternalMessageModal
                    visible={modalExternalMessageVisible}
                    onClose={() => setModalExternalMessageVisible(false)}
                    partnerId={userId || 0}
                    partnerName={getName()}
                    partnerInitials={getInitials()}
                />
            </KeyboardAvoidingView>
        </View>
    );
};

export default ProfilPersonOverview;
