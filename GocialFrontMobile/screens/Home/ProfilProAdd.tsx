import React, { useState, useRef, useEffect } from "react";
import { View, Image, Text, TouchableOpacity, FlatList, Dimensions, ScrollView, KeyboardAvoidingView, Platform, NativeScrollEvent, NativeSyntheticEvent, ActivityIndicator, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import ExternalMessageModal from "../Message/ExternalMessageModal";
import MoreProfilModal from "./MoreProfilModal";
import { userService } from "../../src/services/users";
import { friendService } from "../../src/services/friends";

const { width, height } = Dimensions.get("window");

const ProfilProAdd: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<any>();
    const userId = route.params?.userId;

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [friendStatus, setFriendStatus] = useState<string>("none");
    const [addLoading, setAddLoading] = useState(false);
    const [modalExternalMessageVisible, setModalExternalMessageVisible] = useState(false);
    const [modalMoreProfilVisible, setModalMoreProfilVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (!userId) return;
        (async () => {
            try {
                const [userRes, statusRes] = await Promise.all([
                    userService.getUser(userId),
                    friendService.getStatus(userId),
                ]);
                setProfile(userRes.user);
                setFriendStatus(statusRes.status || "none");
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, [userId]);

    const handleAddFriend = async () => {
        if (addLoading) return;
        setAddLoading(true);
        try {
            if (friendStatus === "none") {
                await friendService.sendRequest(userId);
                setFriendStatus("pending_sent");
                Alert.alert("Succès", "Demande d'ami envoyée !");
            } else if (friendStatus === "pending_received") {
                await friendService.acceptRequest(userId);
                setFriendStatus("friends");
                Alert.alert("Succès", "Demande acceptée !");
            }
        } catch (e) { Alert.alert("Erreur", "Impossible d'envoyer la demande"); }
        finally { setAddLoading(false); }
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    if (loading) return <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" /></View>;
    if (!profile) return <View className="flex-1 items-center justify-center"><Text className={isDarkMode ? "text-white" : "text-black"}>Profil introuvable</Text></View>;

    const displayName = profile.company_name || `${profile.first_name || ""} ${(profile.last_name || "").charAt(0)}.`.trim();
    const pseudo = profile.pseudo ? `@${profile.pseudo}` : "";
    const initials = (displayName || "?").substring(0, 2).toUpperCase();
    const images = profile.avatar_url ? [{ uri: profile.avatar_url }] : [];

    const friendButtonLabel = friendStatus === "friends" ? "Ami" : friendStatus === "pending_sent" ? "En attente" : friendStatus === "pending_received" ? "Accepter" : "Ajouter";
    const friendButtonDisabled = friendStatus === "friends" || friendStatus === "pending_sent";

    const infoData = [
        { label: "Langues", value: profile.languages || "/" },
        { label: "Secteurs d'activités", value: profile.profession || "/" },
        { label: "Horaires d'ouverture", value: "/" },
        { label: "Jours d'ouverture", value: "/" },
        { label: "Moyens de paiements", value: "/" },
    ];

    return (
        <View className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"} pb-8`}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <MoreProfilModal visible={modalMoreProfilVisible} onClose={() => setModalMoreProfilVisible(false)} />
                <ScrollView className="flex-1">
                    <View className="relative">
                        {images.length > 0 ? (
                            <FlatList ref={flatListRef} data={images} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                                keyExtractor={(_, i) => i.toString()} onScroll={handleScroll}
                                renderItem={({ item }) => <Image source={item} style={{ width, height: height / 3, resizeMode: "cover" }} />} />
                        ) : (
                            <View style={{ width, height: height / 3, backgroundColor: "#8260D2", alignItems: "center", justifyContent: "center" }}>
                                <Text style={{ fontSize: 60, color: "white", fontWeight: "bold" }}>{initials}</Text>
                            </View>
                        )}
                        <SafeAreaView className="absolute top-0 left-0 right-0">
                            <View className="flex-row justify-between items-start px-4 pt-4">
                                <TouchableOpacity onPress={() => navigation.goBack()}>
                                    <MaterialIcons name="arrow-back-ios" size={25} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setModalMoreProfilVisible(true)} className="bg-[#8260D2] px-4 py-2 rounded-lg">
                                    <Text className="text-white font-semibold">Pro</Text>
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>
                    </View>

                    <View className={`${isDarkMode ? "bg-black" : "bg-white"} px-4 pt-2`}>
                        <View className="flex-row justify-between items-start">
                            <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold text-xl`}>{displayName}</Text>
                            <Text className={`${isDarkMode ? "text-white" : "text-black"} text-lg font-bold`}>{pseudo}</Text>
                        </View>
                        <View className="flex-row mt-2">
                            {Array(5).fill(0).map((_, i) => <FontAwesome key={i} name="star" size={20} color="gold" />)}
                        </View>
                        <View className="flex-row justify-between mt-4">
                            <View className={`border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg`}>
                                <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{profile.city || "\u2014"}</Text>
                            </View>
                            <TouchableOpacity className={`border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg`}>
                                <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>Activités</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mt-8 w-full">
                        <View className="flex-row items-center justify-between px-4 mb-2">
                            <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>À Propos</Text>
                        </View>
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{profile.bio || profile.description || "Aucune description"}</Text>
                        </View>
                    </View>

                    <View className="mt-6 w-full">
                        <View className="flex-row items-center justify-between px-4 mb-2">
                            <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>Réseaux</Text>
                        </View>
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full flex-row items-center justify-between`}>
                            <TouchableOpacity className={`border ${isDarkMode ? "bg-black border-[#1A6EDE]" : "border-[#065C98] bg-white"} flex-row items-center px-3 py-2 rounded-lg`}>
                                <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"} font-medium`}>Amis</Text>
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
                            <MaterialIcons name="place" size={20} color="#8260D2" />
                            <Text className={`${isDarkMode ? "text-white" : "text-black"} font-medium ml-2`}>{profile.address || "Adresse de l'établissement"}</Text>
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

                <View className="flex-row justify-between px-6 mt-6 mb-2">
                    <TouchableOpacity
                        onPress={handleAddFriend}
                        disabled={friendButtonDisabled || addLoading}
                        className={`px-6 py-3 rounded-lg flex-1 mr-2 ${friendButtonDisabled ? "bg-gray-400" : "bg-[#34C759]"}`}>
                        <Text className="text-white font-semibold text-center">{addLoading ? "..." : friendButtonLabel}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalExternalMessageVisible(true)} className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} px-6 py-3 rounded-lg flex-1 ml-2`}>
                        <Text className="text-white font-semibold text-center">Ecrire</Text>
                    </TouchableOpacity>
                </View>
                <ExternalMessageModal
                    visible={modalExternalMessageVisible}
                    onClose={() => setModalExternalMessageVisible(false)}
                    partnerId={profile.id}
                    partnerName={displayName}
                    partnerInitials={initials}
                />
            </KeyboardAvoidingView>
        </View>
    );
};

export default ProfilProAdd;
