import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useTheme } from "../../screens/ThemeContext";
import { BlurView } from "@react-native-community/blur";
import GhostModeModal from "./GhostModeModal";
import FriendRequestModal from "./FriendRequestModal";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useNotifications } from "../../src/hooks/useNotifications";
import { useFriends } from "../../src/hooks/useFriends";
import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

type RootStackParamList = {
    ProfilProAdd: { userId: number };
    ProfilAssoAdd: { userId: number };
    ProfilPersonOverview: { userId: number };
};
type NavigationProp = StackNavigationProp<RootStackParamList>;

const ProfileView: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { notifications, loading } = useNotifications();
    const { sendRequest } = useFriends();
    const [ghostModeModalVisible, setGhostModeModalVisible] = useState(false);
    const [friendRequestModalVisible, setFriendRequestModeModalVisible] = useState(false);
    const [selectedUserName, setSelectedUserName] = useState("");
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const profileViewNotifs = notifications.filter(
        (n) => n.type?.includes("profile_view") || n.type?.includes("view")
    );

    const getInitials = (name?: string): string => {
        if (!name) return "?";
        const parts = name.split(" ");
        return parts.map((p) => p[0] || "").join("").toUpperCase().slice(0, 2);
    };

    const handleSendFriendRequest = async () => {
        if (selectedUserId) {
            try {
                await sendRequest(selectedUserId);
                Toast.show({ type: "success", text1: `Demande envoyée à ${selectedUserName}`, text2: "Votre demande d'ami a été envoyée avec succès.", visibilityTime: 2500, position: "top", topOffset: 60 });
            } catch {
                Toast.show({ type: "error", text1: "Erreur", text2: "Impossible d'envoyer la demande.", position: "top", topOffset: 60 });
            }
        }
        setFriendRequestModeModalVisible(false);
    };

    if (loading) {
        return (
            <View className={`flex-1 items-center justify-center ${isDarkMode ? "bg-black" : "bg-white"}`}>
                <ActivityIndicator size="large" color="#065C98" />
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"}`}>
            <GhostModeModal visible={ghostModeModalVisible} onClose={() => setGhostModeModalVisible(false)} />
            <FriendRequestModal
                name={selectedUserName}
                visible={friendRequestModalVisible}
                onClose={() => setFriendRequestModeModalVisible(false)}
                onConfirm={handleSendFriendRequest}
            />
            <TouchableOpacity onPress={() => setGhostModeModalVisible(true)} className="flex-row justify-end px-4 mt-2">
                <Image source={require("../../img/ghost.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} className="h-10 w-10" />
            </TouchableOpacity>

            {profileViewNotifs.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <Text className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} text-lg`}>Aucune vue de profil</Text>
                </View>
            ) : (
                <FlatList
                    data={profileViewNotifs}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => {
                        const actor = item.actor;
                        const name = actor?.pseudo || "Utilisateur";
                        const initials = getInitials(name);
                        return (
                            <TouchableOpacity
                                onPress={() => actor?.id && navigation.navigate("ProfilPersonOverview", { userId: actor.id })}
                                className="flex-row items-center justify-between px-4 py-3"
                            >
                                <View className="flex-row items-center space-x-3">
                                    {actor?.avatar_url ? (
                                        <BlurView blurType="light" blurAmount={15} reducedTransparencyFallbackColor="white" style={{ borderRadius: 20, alignSelf: "flex-start" }}>
                                            <Image source={{ uri: actor.avatar_url }} className="w-12 h-12 rounded-full" resizeMode="cover" />
                                        </BlurView>
                                    ) : (
                                        <BlurView blurType="light" blurAmount={15} reducedTransparencyFallbackColor="white" style={{ borderRadius: 20, alignSelf: "flex-start" }}>
                                            <View className="w-12 h-12 rounded-full bg-[#9BD3E8] items-center justify-center">
                                                <Text className="text-black font-bold">{initials}</Text>
                                            </View>
                                        </BlurView>
                                    )}
                                    <View className="ml-2">
                                        <BlurView blurType="light" blurAmount={15} reducedTransparencyFallbackColor="white" style={{ borderRadius: 8, alignSelf: "flex-start" }}>
                                            <Text className={`${isDarkMode ? "text-white" : "text-black"} font-medium`}>{name}</Text>
                                        </BlurView>
                                        <Text className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{dayjs(item.created_at).format("D MMM - HH:mm")}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedUserName(name);
                                        setSelectedUserId(actor?.id || null);
                                        setFriendRequestModeModalVisible(true);
                                    }}
                                    className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-gray-200"} px-3 py-2 rounded-full`}
                                >
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"} text-sm font-medium`}>Demander en ami</Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        );
                    }}
                    ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#D1D5DB", marginHorizontal: 16 }} />}
                />
            )}
        </View>
    );
};

export default ProfileView;
