import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, TextInput, ActivityIndicator } from "react-native";
import { useTheme } from "../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation, useRoute } from "@react-navigation/native";
import { activityService } from "../../src/services/activities";

type RootStackParamList = {
    ProfilPersonOverview: { userId: number };
    ProfilProHome: { userId: number };
    ProfilAssoHome: { userId: number };
};
type NavigationProp = StackNavigationProp<RootStackParamList>;

const ParticipationValidated: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<any>();
    const activityId = route.params?.activityId;
    const hostId = route.params?.hostId;

    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!activityId) { setLoading(false); return; }
        (async () => {
            try {
                const res = await activityService.getParticipants(activityId);
                setParticipants(res.validated || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, [activityId]);

    const filtered = participants.filter(p => {
        if (!search.trim()) return true;
        const name = p.user?.first_name || p.user?.company_name || "";
        return name.toLowerCase().includes(search.toLowerCase());
    });

    const navigateToProfile = (user: any) => {
        if (!user) return;
        if (user.user_type === "pro") navigation.navigate("ProfilProHome", { userId: user.id });
        else if (user.user_type === "asso") navigation.navigate("ProfilAssoHome", { userId: user.id });
        else navigation.navigate("ProfilPersonOverview", { userId: user.id });
    };

    if (loading) return <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" /></View>;

    return (
        <View className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"}`}>
            <View className={`mx-4 flex-row items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} border border-[#065C98] rounded-2xl px-3 h-10 mt-4`}>
                <MaterialIcons name="search" size={20} color={isDarkMode ? "white" : "#4A4A4A"} />
                <TextInput className={`flex-1 ml-2 ${isDarkMode ? "text-white" : "text-black"}`}
                    placeholder="Rechercher" placeholderTextColor={isDarkMode ? "gray" : "#A6A6A6"}
                    value={search} onChangeText={setSearch} />
            </View>

            {filtered.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <Text className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Aucun participant validé</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item, i) => item.user?.id?.toString() || i.toString()}
                    renderItem={({ item }) => {
                        const user = item.user;
                        if (!user) return null;
                        const displayName = user.company_name || `${user.first_name || ""} ${(user.last_name || "").charAt(0)}.`.trim();
                        const typeLabel = user.user_type === "pro" ? "Pro" : user.user_type === "asso" ? "Asso" : null;
                        const isHost = user.id === hostId;

                        return (
                            <TouchableOpacity onPress={() => navigateToProfile(user)} className="flex-row items-center justify-between px-4 py-4">
                                <View className="flex-row items-center space-x-3">
                                    {user.avatar_url ? (
                                        <Image source={{ uri: user.avatar_url }} className="w-12 h-12 rounded-full" />
                                    ) : (
                                        <View className="w-12 h-12 rounded-full bg-blue-400 items-center justify-center">
                                            <Text className="text-white font-bold">{(displayName || "?").substring(0, 2).toUpperCase()}</Text>
                                        </View>
                                    )}
                                    <View className="ml-2">
                                        <View className="flex-row mt-4">
                                            <Text className={`${isDarkMode ? "text-white" : "text-black"} font-medium`}>{displayName}</Text>
                                            {isHost && <Text className={`ml-1 relative bottom-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Hôte</Text>}
                                            {typeLabel && (
                                                <Text className={`font-medium ml-1 ${typeLabel === "Pro" ? "text-[#8260D2]" : "text-[#E8A838]"}`}>{typeLabel}</Text>
                                            )}
                                        </View>
                                        <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold`}>{user.city || ""}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                    ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#D1D5DB", marginHorizontal: 16 }} />}
                />
            )}
        </View>
    );
};

export default ParticipationValidated;
