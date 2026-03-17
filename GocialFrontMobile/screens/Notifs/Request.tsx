import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, FlatList, Dimensions, ActivityIndicator } from "react-native";
import { useTheme } from "../../screens/ThemeContext";
import ExternalMessageModal from "../Message/ExternalMessageModal";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import DeleteFriendRequestModal from "./DeleteFriendRequestModal";
import { useFriends } from "../../src/hooks/useFriends";

type RootStackParamList = {
    ProfilPersonOverview: { userId: number };
};
type NavigationProp = StackNavigationProp<RootStackParamList>;

const SCREEN_WIDTH = Dimensions.get("window").width;

const Request: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { requests, loading, acceptRequest, rejectRequest, cancelRequest, refresh } = useFriends();

    const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
    const [modalExternalMessageVisible, setModalExternalMessageVisible] = useState(false);
    const [deleteFriendRequestModalVisible, setDeleteFriendRequestModalVisible] = useState(false);
    const [selectedUserName, setSelectedUserName] = useState("");
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedPartner, setSelectedPartner] = useState<{ id: number; name: string; initials: string } | null>(null);

    const received = requests?.received || [];
    const sent = requests?.sent || [];

    const getInitials = (user: any): string => {
        const first = user?.first_name || user?.pseudo || "";
        const last = user?.last_name || "";
        if (first && last) return (first[0] + last[0]).toUpperCase();
        return (first.slice(0, 2) || "??").toUpperCase();
    };

    const getUserName = (user: any): string => {
        if (user?.first_name && user?.last_name) return `${user.first_name} ${user.last_name[0]}.`;
        return user?.pseudo || "Utilisateur";
    };

    const handleAccept = async (requestId: number, userName: string) => {
        try {
            await acceptRequest(requestId);
            Toast.show({ type: "success", text1: "Demande acceptée", text2: `${userName} est maintenant dans vos amis.`, visibilityTime: 2500, position: "top", topOffset: 60 });
            refresh();
        } catch {
            Toast.show({ type: "error", text1: "Erreur", position: "top", topOffset: 60 });
        }
    };

    const handleReject = async (requestId: number) => {
        try {
            await rejectRequest(requestId);
            Toast.show({ type: "success", text1: "Demande refusée", visibilityTime: 2500, position: "top", topOffset: 60 });
            refresh();
        } catch {
            Toast.show({ type: "error", text1: "Erreur", position: "top", topOffset: 60 });
        }
    };

    const handleCancelSent = async () => {
        if (selectedUserId) {
            try {
                await cancelRequest(selectedUserId);
                Toast.show({ type: "success", text1: "Demande supprimée", text2: `${selectedUserName} a été retiré(e) de vos demandes.`, visibilityTime: 2500, position: "top", topOffset: 60 });
                refresh();
            } catch {
                Toast.show({ type: "error", text1: "Erreur", position: "top", topOffset: 60 });
            }
        }
        setDeleteFriendRequestModalVisible(false);
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
            {selectedPartner && (
                <ExternalMessageModal
                    visible={modalExternalMessageVisible}
                    onClose={() => { setModalExternalMessageVisible(false); setSelectedPartner(null); }}
                    partnerId={selectedPartner.id}
                    partnerName={selectedPartner.name}
                    partnerInitials={selectedPartner.initials}
                />
            )}

            <View className={`flex-row justify-around ${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} mt-2`}>
                <TouchableOpacity onPress={() => setActiveTab("received")} className={`flex-1 py-2 items-center ${activeTab === "received" ? "bg-[#065C98]" : isDarkMode ? "bg-[#1D1E20]" : ""}`}>
                    <Text className={`text-lg ${activeTab === "received" ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>Recues ({received.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab("sent")} className={`flex-1 py-2 items-center ${activeTab === "sent" ? "bg-[#065C98]" : isDarkMode ? "bg-[#1D1E20]" : ""}`}>
                    <Text className={`text-lg ${activeTab === "sent" ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>Envoyees ({sent.length})</Text>
                </TouchableOpacity>
            </View>

            {activeTab === "received" ? (
                received.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <Text className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} text-lg`}>Aucune demande recue</Text>
                    </View>
                ) : (
                    <ScrollView horizontal pagingEnabled={false} snapToInterval={SCREEN_WIDTH * 0.85 + 16} decelerationRate="fast" showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, marginTop: 20 }}>
                        {received.map((req: any) => {
                            const user = req.user || req.sender || req;
                            const name = getUserName(user);
                            const initials = getInitials(user);
                            return (
                                <View key={req.id || user.id}>
                                    <TouchableOpacity onPress={() => navigation.navigate("ProfilPersonOverview", { userId: user.id })} className="items-center" style={{ width: SCREEN_WIDTH * 0.85, marginRight: 8 }}>
                                        <View className="rounded-3xl overflow-hidden bg-white shadow-lg w-[85%]">
                                            <View className="relative w-full h-[30rem]">
                                                {user.avatar_url ? (
                                                    <Image source={{ uri: user.avatar_url }} className="w-full h-full" resizeMode="cover" />
                                                ) : (
                                                    <View className="w-full h-full bg-[#9BD3E8] items-center justify-center">
                                                        <Text className="text-6xl font-bold text-black">{initials}</Text>
                                                    </View>
                                                )}
                                                <View className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-black/40">
                                                    <Text className="text-white text-2xl font-bold">{name}</Text>
                                                    {user.city && <Text className="text-white text-xl font-bold">{user.city}</Text>}
                                                </View>
                                            </View>
                                        </View>
                                        <View className="flex-row justify-center w-full mt-6 gap-x-12">
                                            <TouchableOpacity onPress={() => handleReject(req.id)} className="w-[35%] rounded-full border border-red-500 py-2 items-center">
                                                <Text className="text-red-500 font-semibold">Refuser</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleAccept(req.id, name)} className={`w-[35%] rounded-full border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} py-2 items-center`}>
                                                <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"} font-semibold`}>Accepter</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </ScrollView>
                )
            ) : (
                sent.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <Text className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} text-lg`}>Aucune demande envoyee</Text>
                    </View>
                ) : (
                    <FlatList
                        data={sent}
                        keyExtractor={(item: any) => String(item.id || item.user?.id)}
                        renderItem={({ item }: { item: any }) => {
                            const user = item.user || item.receiver || item;
                            const name = getUserName(user);
                            const initials = getInitials(user);
                            return (
                                <TouchableOpacity onPress={() => navigation.navigate("ProfilPersonOverview", { userId: user.id })} className="flex-row items-center justify-between px-4 py-4">
                                    <View className="flex-row items-center space-x-3">
                                        {user.avatar_url ? (
                                            <Image source={{ uri: user.avatar_url }} className="w-12 h-12 rounded-full" resizeMode="cover" />
                                        ) : (
                                            <View className="w-12 h-12 rounded-full bg-[#9BD3E8] items-center justify-center">
                                                <Text className="text-black font-bold">{initials}</Text>
                                            </View>
                                        )}
                                        <View className="ml-2">
                                            <Text className={`${isDarkMode ? "text-white" : "text-black"} font-medium`}>{name}</Text>
                                            {user.city && <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold`}>{user.city}</Text>}
                                        </View>
                                    </View>
                                    <TouchableOpacity className="bg-red-500 px-3 py-2 rounded-full" onPress={() => { setSelectedUserName(name); setSelectedUserId(item.id); setDeleteFriendRequestModalVisible(true); }}>
                                        <Text className="text-white text-sm font-medium">Supprimer</Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            );
                        }}
                        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#D1D5DB", marginHorizontal: 16 }} />}
                    />
                )
            )}

            <DeleteFriendRequestModal
                visible={deleteFriendRequestModalVisible}
                name={selectedUserName}
                onCancel={() => setDeleteFriendRequestModalVisible(false)}
                onConfirm={handleCancelSent}
            />
        </View>
    );
};

export default Request;
