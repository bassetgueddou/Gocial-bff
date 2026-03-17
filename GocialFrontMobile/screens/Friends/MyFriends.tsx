import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, TextInput, ActivityIndicator } from "react-native";
import { useTheme } from "../../screens/ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import DeleteConfirmFriendModal from "./DeleteConfirmFriendModal";
import { useFriends } from "../../src/hooks/useFriends";

type RootStackParamList = {
    ProfilPersonOverview: { userId: number };
    ProfilProHome: { userId: number };
    ProfilAssoHome: { userId: number };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const MyFriends: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { friends, blocked, loading, removeFriend, unblockUser, refresh } = useFriends();

    const [deleteConfirmFriendModalVisible, setDeleteConfirmFriendModalVisible] = useState(false);
    const [selectedName, setSelectedName] = useState("");
    const [selectedId, setSelectedId] = useState<number>(0);
    const [actionLabel, setActionLabel] = useState<"supprimer" | "débloquer">("supprimer");
    const [activeTab, setActiveTab] = useState<"person" | "proasso" | "blocked">("person");
    const [searchQuery, setSearchQuery] = useState("");

    // Filter friends by tab and search
    const personFriends = friends.filter((f: any) => {
        const u = f.user || f;
        return (!u.user_type || u.user_type === "person") &&
            (u.first_name || u.pseudo || "").toLowerCase().includes(searchQuery.toLowerCase());
    });

    const proAssoFriends = friends.filter((f: any) => {
        const u = f.user || f;
        return (u.user_type === "pro" || u.user_type === "asso") &&
            (u.first_name || u.pseudo || "").toLowerCase().includes(searchQuery.toLowerCase());
    });

    const filteredBlocked = blocked.filter((b: any) => {
        const u = b.user || b;
        return (u.first_name || u.pseudo || "").toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getUsers = () => {
        switch (activeTab) {
            case "person": return personFriends;
            case "proasso": return proAssoFriends;
            case "blocked": return filteredBlocked;
            default: return [];
        }
    };

    const getUserInfo = (item: any) => {
        const u = item.user || item;
        return {
            id: u.id,
            friendshipId: item.friendship_id || item.id,
            name: u.pseudo || `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Utilisateur",
            city: u.city || "",
            avatarUrl: u.avatar_url,
            userType: u.user_type || "person",
        };
    };

    const handleConfirmAction = useCallback(async () => {
        setDeleteConfirmFriendModalVisible(false);
        try {
            if (actionLabel === "supprimer") {
                await removeFriend(selectedId);
                Toast.show({
                    type: "success",
                    text1: "Ami supprime",
                    text2: `${selectedName} a bien ete supprime(e) de vos amis.`,
                    visibilityTime: 2000,
                    position: "top",
                    topOffset: 60,
                });
            } else {
                await unblockUser(selectedId);
                Toast.show({
                    type: "success",
                    text1: "Utilisateur debloque",
                    text2: `${selectedName} a bien ete debloque(e).`,
                    visibilityTime: 2000,
                    position: "top",
                    topOffset: 60,
                });
            }
            refresh();
        } catch {
            Toast.show({ type: "error", text1: "Erreur", text2: "Action impossible.", position: "top", topOffset: 60 });
        }
    }, [actionLabel, selectedId, selectedName, removeFriend, unblockUser, refresh]);

    const navigateToProfile = (info: ReturnType<typeof getUserInfo>) => {
        if (info.userType === "pro") {
            navigation.navigate("ProfilProHome", { userId: info.id });
        } else if (info.userType === "asso") {
            navigation.navigate("ProfilAssoHome", { userId: info.id });
        } else {
            navigation.navigate("ProfilPersonOverview", { userId: info.id });
        }
    };

    const initials = (name: string) => {
        const parts = name.split(" ");
        return (parts[0]?.[0] || "").toUpperCase() + (parts[1]?.[0] || "").toUpperCase() || "?";
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
            <View className={`flex-row justify-around ${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} mt-2`} style={{ boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1)" }}>
                <TouchableOpacity onPress={() => setActiveTab("person")} className={`flex-1 py-2 items-center ${activeTab === "person" ? "bg-[#065C98]" : isDarkMode ? "bg-[#1D1E20]" : ""}`}>
                    <Text className={`text-lg ${activeTab === "person" ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>Personne</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab("proasso")} className={`flex-1 py-2 items-center ${activeTab === "proasso" ? "bg-[#065C98]" : isDarkMode ? "bg-[#1D1E20]" : ""}`}>
                    <Text className={`text-lg ${activeTab === "proasso" ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>Pro/Asso</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab("blocked")} className={`flex-1 py-2 items-center ${activeTab === "blocked" ? "bg-[#065C98]" : isDarkMode ? "bg-[#1D1E20]" : ""}`}>
                    <Text className={`text-lg ${activeTab === "blocked" ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>Bloque</Text>
                </TouchableOpacity>
            </View>

            <View className={`mx-4 flex-row items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} border border-[#065C98] rounded-2xl px-3 h-10 mt-4`}>
                <MaterialIcons name="search" size={20} color={isDarkMode ? "white" : "#4A4A4A"} />
                <TextInput
                    className={`flex-1 ml-2 ${isDarkMode ? "text-white" : "text-black"}`}
                    placeholder={activeTab === "person" ? "Rechercher une personne" : activeTab === "proasso" ? "Rechercher un Pro/Asso" : "Rechercher"}
                    placeholderTextColor={isDarkMode ? "gray" : "#A6A6A6"}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={getUsers()}
                keyExtractor={(item: any) => String(item.friendship_id || item.id || Math.random())}
                renderItem={({ item }) => {
                    const info = getUserInfo(item);
                    return (
                        <TouchableOpacity onPress={() => navigateToProfile(info)} className="flex-row items-center justify-between px-4 py-4">
                            <View className="flex-row items-center space-x-3">
                                {info.avatarUrl ? (
                                    <Image source={{ uri: info.avatarUrl }} className="w-12 h-12 rounded-full" resizeMode="cover" />
                                ) : (
                                    <View className="w-12 h-12 rounded-full bg-[#065C98] items-center justify-center">
                                        <Text className="text-white font-bold">{initials(info.name)}</Text>
                                    </View>
                                )}
                                <View className="ml-2">
                                    <View className="flex-row">
                                        <Text className={`${isDarkMode ? "text-white" : "text-black"} font-medium`}>
                                            {info.name}
                                        </Text>
                                        {(info.userType === "pro" || info.userType === "asso") && (
                                            <Text className={`font-medium ml-1 ${info.userType === "pro" ? "text-[#8260D2]" : "text-[#008F29]"}`}>
                                                {info.userType === "pro" ? "Pro" : "Asso"}
                                            </Text>
                                        )}
                                    </View>
                                    {info.city ? <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold`}>{info.city}</Text> : null}
                                </View>
                            </View>

                            <TouchableOpacity
                                className="bg-red-500 px-3 py-2 rounded-full"
                                onPress={() => {
                                    setSelectedName(info.name);
                                    setSelectedId(activeTab === "blocked" ? info.id : info.friendshipId);
                                    setActionLabel(activeTab === "blocked" ? "débloquer" : "supprimer");
                                    setDeleteConfirmFriendModalVisible(true);
                                }}
                            >
                                <Text className="text-white text-sm font-medium">
                                    {activeTab === "blocked" ? "Débloquer" : "Supprimer"}
                                </Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    );
                }}
                ItemSeparatorComponent={() => (
                    <View style={{ height: 1, backgroundColor: "#D1D5DB", marginHorizontal: 16 }} />
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center py-10">
                        <Text className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Aucun resultat</Text>
                    </View>
                }
            />

            <DeleteConfirmFriendModal
                visible={deleteConfirmFriendModalVisible}
                name={selectedName}
                actionLabel={actionLabel}
                onCancel={() => setDeleteConfirmFriendModalVisible(false)}
                onConfirm={handleConfirmAction}
            />
        </View>
    );
};

export default MyFriends;
