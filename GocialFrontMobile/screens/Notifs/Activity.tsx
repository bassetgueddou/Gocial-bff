import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTheme } from "../../screens/ThemeContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { useNotifications } from "../../src/hooks/useNotifications";
import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

type RootStackParamList = {
    ProfilPersonOverview: { userId: number };
    ActivityOverview: { activityId: number };
    HostEvaluation: undefined;
    ParticipantEvaluation: undefined;
};
type NavigationProp = StackNavigationProp<RootStackParamList>;

const Activity = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { notifications, loading, markAsRead } = useNotifications();

    const activityNotifs = notifications.filter(
        (n) => n.type?.includes("activity") || n.type?.includes("participation") || n.type?.includes("evaluation") || n.type?.includes("like")
    );

    const getInitials = (name?: string): string => {
        if (!name) return "?";
        const parts = name.split(" ");
        return parts.map((p) => p[0] || "").join("").toUpperCase().slice(0, 2);
    };

    const formatDate = (dateStr: string): string => {
        const d = dayjs(dateStr);
        const now = dayjs();
        if (d.isSame(now, "day")) return "Aujourd'hui " + d.format("HH:mm");
        if (d.isSame(now, "year")) return d.format("D MMM - HH:mm");
        return d.format("D MMM YYYY - HH:mm");
    };

    const handlePress = (notif: any) => {
        if (!notif.is_read) markAsRead(notif.id);
        const data = notif.data || {};
        if (notif.type?.includes("evaluation") && notif.type?.includes("host")) {
            navigation.navigate("HostEvaluation");
        } else if (notif.type?.includes("evaluation")) {
            navigation.navigate("ParticipantEvaluation");
        } else if (data.activity_id) {
            navigation.navigate("ActivityOverview", { activityId: data.activity_id as number });
        }
    };

    if (loading) {
        return (
            <View className={`flex-1 items-center justify-center ${isDarkMode ? "bg-black" : "bg-white"}`}>
                <ActivityIndicator size="large" color="#065C98" />
            </View>
        );
    }

    if (activityNotifs.length === 0) {
        return (
            <View className={`flex-1 items-center justify-center ${isDarkMode ? "bg-black" : "bg-white"}`}>
                <Text className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} text-lg`}>Aucune notification</Text>
            </View>
        );
    }

    return (
        <View>
            <ScrollView className={`p-4 ${isDarkMode ? "bg-black" : "bg-white"}`}>
                {activityNotifs.map((notif) => (
                    <View key={notif.id} className="mb-4">
                        <TouchableOpacity onPress={() => handlePress(notif)} className="flex-row items-start">
                            {notif.actor?.avatar_url ? (
                                <TouchableOpacity onPress={() => notif.actor?.id && navigation.navigate("ProfilPersonOverview", { userId: notif.actor.id })}>
                                    <Image source={{ uri: notif.actor.avatar_url }} className="w-10 h-10 rounded-full mr-3 relative top-2" />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={() => notif.actor?.id && navigation.navigate("ProfilPersonOverview", { userId: notif.actor.id })}>
                                    <View className="w-10 h-10 rounded-full bg-[#9BD3E8] mr-3 relative top-2 items-center justify-center">
                                        <Text className="text-black font-bold text-sm">{getInitials(notif.actor?.pseudo)}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            <View className="flex-1">
                                <Text className={`text-base ${isDarkMode ? "text-white" : "text-black"} ${!notif.is_read ? "font-bold" : ""}`}>
                                    {notif.actor?.pseudo ? (
                                        <Text className={`font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>{notif.actor.pseudo} </Text>
                                    ) : null}
                                    {notif.title}
                                </Text>
                                {notif.body ? (
                                    <Text className={`text-sm mt-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{notif.body}</Text>
                                ) : null}
                                <Text className={`text-xs mt-1 self-end text-right ${isDarkMode ? "text-white" : "text-gray-500"}`}>{formatDate(notif.created_at)}</Text>
                            </View>
                            {!notif.is_read && <View className="w-2 h-2 rounded-full bg-[#1A6EDE] mt-3 ml-2" />}
                        </TouchableOpacity>
                        <View className="h-[1px] bg-gray-300 mt-3" />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default Activity;
