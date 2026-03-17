import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useTheme } from "../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FilterFriendsPersonModal from "./FilterFriendsPersonModal";
import FilterFriendsProAsso from "./FilterFriendsProAssoModal";
import React, { useState, useEffect, useCallback } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { userService } from "../../src/services/users";

type RootStackParamList = {
    ProfilPersonOverview: { userId: number };
    ProfilProAdd: { userId: number };
    ProfilAssoAdd: { userId: number };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const FriendsPerson: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [activeTab, setActiveTab] = useState<"person" | "proasso">("person");
    const [modalPersonVisible, setModalPersonVisible] = useState(false);
    const [modalProAssoVisible, setModalProAssoVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const bgColor = isDarkMode ? "bg-black" : "bg-white";

    const searchUsers = useCallback(async () => {
        if (searchQuery.length < 2) {
            setUsers([]);
            return;
        }
        setLoading(true);
        try {
            const type = activeTab === "proasso" ? "pro" : "person";
            const result = await userService.searchUsers(searchQuery, type);
            setUsers(result.users || []);
        } catch {
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, activeTab]);

    useEffect(() => {
        const timer = setTimeout(searchUsers, 400);
        return () => clearTimeout(timer);
    }, [searchUsers]);

    const initials = (user: any) => {
        const f = (user.first_name || "")[0] || "";
        const l = (user.last_name || "")[0] || "";
        return (f + l).toUpperCase() || "?";
    };

    const navigateToProfile = (user: any) => {
        if (activeTab === "person") {
            navigation.navigate("ProfilPersonOverview", { userId: user.id });
        } else if (user.user_type === "pro") {
            navigation.navigate("ProfilProAdd", { userId: user.id });
        } else {
            navigation.navigate("ProfilAssoAdd", { userId: user.id });
        }
    };

    return (
        <View className={`flex-1 ${bgColor}`}>
            <View className={`flex-row justify-around ${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} mt-2`} style={{ boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1)" }}>
                <TouchableOpacity
                    onPress={() => { setActiveTab("person"); setUsers([]); setSearchQuery(""); }}
                    className={`flex-1 py-2 items-center w-[50%] ${activeTab === "person" ? "bg-[#065C98]" : isDarkMode ? "bg-[#1D1E20]" : ""}`}
                >
                    <Text className={`text-lg ${activeTab === "person" ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>Personne</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => { setActiveTab("proasso"); setUsers([]); setSearchQuery(""); }}
                    className={`flex-1 py-2 items-center w-[50%] ${activeTab === "proasso" ? "bg-[#065C98]" : isDarkMode ? "bg-[#1D1E20]" : ""}`}
                >
                    <Text className={`text-lg ${activeTab === "proasso" ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>Pro/Asso</Text>
                </TouchableOpacity>
            </View>

            <FilterFriendsPersonModal visible={modalPersonVisible} onClose={() => setModalPersonVisible(false)} />
            <FilterFriendsProAsso visible={modalProAssoVisible} onClose={() => setModalProAssoVisible(false)} />

            <View className="flex-row items-center mx-4 space-x-2 mt-4">
                <View className={`flex-1 flex-row items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"} rounded-2xl px-3 h-10`}>
                    <MaterialIcons name="search" size={20} color={isDarkMode ? "white" : "#4A4A4A"} />
                    <TextInput
                        className={`flex-1 ml-2 ${isDarkMode ? "text-white" : "text-black"}`}
                        placeholder={activeTab === "person" ? "Mathilde J., @mathilde" : "LeSuperEndroit, @lesuperendroit"}
                        placeholderTextColor="#A6A6A6"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity
                    onPress={() => activeTab === "person" ? setModalPersonVisible(true) : setModalProAssoVisible(true)}
                    className={`ml-2 flex-row items-center space-x-1 px-3 py-2 ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"} rounded-lg`}
                >
                    <MaterialIcons name="tune" size={16} color={isDarkMode ? "white" : "black"} />
                    <Text className={`${isDarkMode ? "text-white" : "text-black"} font-medium`}>Filtres</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#065C98" />
                </View>
            ) : (
                <ScrollView>
                    <View className="flex flex-wrap flex-row justify-center p-1">
                        {users.length === 0 && searchQuery.length >= 2 ? (
                            <View className="items-center justify-center py-10 w-full">
                                <Text className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Aucun resultat</Text>
                            </View>
                        ) : (
                            users.map((user, index) => (
                                <TouchableOpacity
                                    key={user.id || index}
                                    onPress={() => navigateToProfile(user)}
                                    className="relative w-[48%] h-64 m-1 rounded-lg overflow-hidden shadow-lg"
                                >
                                    {user.avatar_url ? (
                                        <Image source={{ uri: user.avatar_url }} className="w-full h-full" resizeMode="cover" />
                                    ) : (
                                        <View className={`w-full h-full items-center justify-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-gray-200"}`}>
                                            <Text className="text-4xl font-bold text-[#065C98]">{initials(user)}</Text>
                                        </View>
                                    )}
                                    {(user.user_type === "pro" || user.user_type === "asso") && (
                                        <View className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center ${user.user_type === "pro" ? "bg-[#8260D2]" : "bg-[#2C8500]"}`}>
                                            <Text className="text-white font-bold text-xs">{user.user_type === "pro" ? "Pro" : "Asso"}</Text>
                                        </View>
                                    )}
                                    <View className="absolute bottom-2 left-2">
                                        <Text className="text-white font-bold">{user.pseudo || `${user.first_name || ""} ${user.last_name || ""}`.trim()}</Text>
                                        <Text className="text-white text-xs font-bold">{user.city || ""}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                    {searchQuery.length < 2 && (
                        <View className="items-center justify-center py-10">
                            <Text className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Tapez au moins 2 caracteres pour rechercher
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

export default FriendsPerson;
