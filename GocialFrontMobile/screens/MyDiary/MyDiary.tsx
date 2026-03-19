import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Image } from "react-native";
import { Calendar } from "react-native-calendars";
import { useTheme } from "../ThemeContext";
import HeaderMyDiary from "./HeaderMyDiary";
import { activityService } from "../../src/services/activities";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import type { Activity } from "../../src/types";
import Ionicons from "react-native-vector-icons/Ionicons";
import dayjs from "dayjs";

type DiaryFilter = "all" | "participations" | "liked";

type RootStackParamList = {
    ActivityOverview: { activityId: number };
};
type NavigationProp = StackNavigationProp<RootStackParamList>;

const MyDiary: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [participatingActivities, setParticipatingActivities] = useState<Activity[]>([]);
    const [hostedActivities, setHostedActivities] = useState<Activity[]>([]);
    const [likedActivities, setLikedActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<DiaryFilter>("all");
    const [selectedDay, setSelectedDay] = useState<string>(
        new Date().toISOString().split("T")[0]
    );

    const fetchEvents = useCallback(async () => {
        try {
            const [participatingRes, hostingRes, likedRes] = await Promise.all([
                activityService.getMyParticipations(1, "validated", true),
                activityService.getHostedActivities(1, true),
                activityService.getLikedActivities(1),
            ]);
            setParticipatingActivities(participatingRes.activities || []);
            setHostedActivities(hostingRes.activities || []);
            setLikedActivities(likedRes.activities || []);
        } catch (e) {
            console.error("Error fetching diary events:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchEvents();
    }, [fetchEvents]);

    // Build markedDates for react-native-calendars
    const markedDates = useMemo(() => {
        const marks: Record<string, any> = {};

        const addDot = (dateStr: string, color: string) => {
            const day = dateStr.split("T")[0];
            if (!marks[day]) marks[day] = { dots: [] };
            if (!marks[day].dots) marks[day].dots = [];
            if (!marks[day].dots.find((d: any) => d.color === color)) {
                marks[day].dots.push({ color });
            }
        };

        [...participatingActivities, ...hostedActivities].forEach((a) => {
            if (a.date) addDot(a.date, "#065C98");
        });

        likedActivities.forEach((a) => {
            if (a.date) addDot(a.date, "#FF4D4D");
        });

        if (selectedDay) {
            marks[selectedDay] = {
                ...(marks[selectedDay] || {}),
                selected: true,
                selectedColor: "#065C98",
            };
        }

        return marks;
    }, [participatingActivities, hostedActivities, likedActivities, selectedDay]);

    // Activities to display for the selected day + filter
    const activitiesForDay = useMemo(() => {
        let pool: Activity[] = [];

        if (filter === "all") {
            const allMap = new Map<number, Activity>();
            [...participatingActivities, ...hostedActivities, ...likedActivities].forEach((a) => {
                if (!allMap.has(a.id)) allMap.set(a.id, a);
            });
            pool = Array.from(allMap.values());
        } else if (filter === "participations") {
            const allMap = new Map<number, Activity>();
            [...participatingActivities, ...hostedActivities].forEach((a) => {
                if (!allMap.has(a.id)) allMap.set(a.id, a);
            });
            pool = Array.from(allMap.values());
        } else {
            pool = likedActivities;
        }

        return pool.filter((a) => {
            if (!a.date) return false;
            return a.date.split("T")[0] === selectedDay;
        });
    }, [filter, selectedDay, participatingActivities, hostedActivities, likedActivities]);

    const renderEmptyState = () => {
        let message = "Aucune activité ce jour";
        let subMessage = "Explorez les événements !";

        if (filter === "liked") {
            message = "Vous n'avez pas encore liké d'activité.";
            subMessage = "Découvrez des activités et likez-les !";
        } else if (filter === "participations") {
            message = "Vous ne participez à aucune activité.";
            subMessage = "Rejoignez une activité près de chez vous !";
        }

        return (
            <View className="items-center py-10">
                <Ionicons
                    name="calendar-outline"
                    size={48}
                    color={isDarkMode ? "#4B5563" : "#D1D5DB"}
                />
                <Text className={`mt-3 text-base font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {message}
                </Text>
                <Text className={`text-sm mt-1 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>
                    {subMessage}
                </Text>
            </View>
        );
    };

    return (
        <View className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"}`}>
            <HeaderMyDiary title="Mon Agenda" filter={filter} onFilterChange={setFilter} />

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#065C98"
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Calendrier react-native-calendars */}
                <Calendar
                    markingType="multi-dot"
                    markedDates={markedDates}
                    onDayPress={(day) => setSelectedDay(day.dateString)}
                    theme={{
                        arrowColor: "#065C98",
                        todayTextColor: "#065C98",
                        selectedDayBackgroundColor: "#065C98",
                        selectedDayTextColor: "white",
                        dotColor: "#065C98",
                        calendarBackground: isDarkMode ? "#000000" : "#ffffff",
                        dayTextColor: isDarkMode ? "#ffffff" : "#000000",
                        textDisabledColor: isDarkMode ? "#4B5563" : "#d9e1e8",
                        monthTextColor: isDarkMode ? "#ffffff" : "#000000",
                        textMonthFontWeight: "bold",
                        textDayFontSize: 14,
                        textMonthFontSize: 16,
                    }}
                />

                {/* Filtre chips */}
                <View className="flex-row gap-2 px-5 py-3">
                    {(["all", "participations", "liked"] as DiaryFilter[]).map((f) => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full ${
                                filter === f
                                    ? "bg-[#065C98]"
                                    : isDarkMode
                                        ? "bg-[#1D1E20]"
                                        : "bg-[#F2F5FA]"
                            }`}
                        >
                            <Text
                                className={`text-sm font-medium ${
                                    filter === f
                                        ? "text-white"
                                        : isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                }`}
                            >
                                {f === "all" ? "Tout" : f === "participations" ? "Participations" : "Likées"}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Titre du jour sélectionné */}
                <View className="px-5 mb-3">
                    <Text className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        {dayjs(selectedDay).format("dddd D MMMM YYYY")}
                    </Text>
                </View>

                {/* Liste activités ou loading / empty state */}
                {loading ? (
                    <View className="items-center py-10">
                        <ActivityIndicator size="large" color="#065C98" />
                    </View>
                ) : activitiesForDay.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <View className="px-5 pb-8">
                        {activitiesForDay.map((activity) => {
                            const host = activity.host;
                            const hasAvatar = host && (host as any).avatar_url;
                            const displayName = host?.pseudo || host?.first_name || "Hôte";
                            const initial = displayName[0]?.toUpperCase() ?? "?";
                            const timeStr = activity.date
                                ? dayjs(activity.date).format("HH:mm")
                                : "";

                            return (
                                <TouchableOpacity
                                    key={activity.id}
                                    onPress={() =>
                                        navigation.navigate("ActivityOverview", {
                                            activityId: activity.id,
                                        })
                                    }
                                    className={`rounded-xl p-4 mb-3 ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"}`}
                                >
                                    <View className="flex-row items-start">
                                        {/* Heure */}
                                        <View className="w-14 mr-3 items-center pt-1">
                                            <Text className={`text-sm font-bold ${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"}`}>
                                                {timeStr}
                                            </Text>
                                        </View>

                                        {/* Infos activité */}
                                        <View className="flex-1">
                                            <Text
                                                className={`text-base font-semibold mb-1 ${isDarkMode ? "text-white" : "text-black"}`}
                                                numberOfLines={1}
                                            >
                                                {activity.title}
                                            </Text>

                                            {/* Lieu ou Visio */}
                                            <View className="flex-row items-center mb-2">
                                                <Ionicons
                                                    name={activity.activity_type === "visio" ? "videocam-outline" : "location-outline"}
                                                    size={13}
                                                    color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                                                    style={{ marginRight: 4 }}
                                                />
                                                <Text
                                                    className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                                                    numberOfLines={1}
                                                >
                                                    {activity.activity_type === "visio"
                                                        ? "Visioconférence"
                                                        : activity.city || activity.address || activity.location || "Lieu non précisé"}
                                                </Text>
                                            </View>

                                            {/* Hôte */}
                                            <View className="flex-row items-center">
                                                {hasAvatar ? (
                                                    <Image
                                                        source={{ uri: (host as any).avatar_url }}
                                                        style={{ width: 20, height: 20, borderRadius: 10, marginRight: 6 }}
                                                    />
                                                ) : (
                                                    <View
                                                        style={{
                                                            width: 20,
                                                            height: 20,
                                                            borderRadius: 10,
                                                            backgroundColor: "#065C98",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            marginRight: 6,
                                                        }}
                                                    >
                                                        <Text style={{ color: "white", fontSize: 9, fontWeight: "bold" }}>
                                                            {initial}
                                                        </Text>
                                                    </View>
                                                )}
                                                <Text className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                    {displayName}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Miniature image activité */}
                                        {activity.image_url ? (
                                            <Image
                                                source={{ uri: activity.image_url }}
                                                style={{ width: 56, height: 56, borderRadius: 10, marginLeft: 10 }}
                                            />
                                        ) : null}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default MyDiary;
