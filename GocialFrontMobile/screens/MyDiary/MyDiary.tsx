import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../ThemeContext";
import EventCardReal from "../Home/EventCardReal";
import HeaderMyDiary from "./HeaderMyDiary";
import { activityService } from "../../src/services/activities";
import { useAuth } from "../../src/contexts/AuthContext";
import dayjs from "dayjs";

const MyDiary: React.FC = () => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();

    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const today = new Date();
    const [month, setMonth] = useState<number>(today.getMonth());
    const [year, setYear] = useState<number>(today.getFullYear());
    const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
    const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());

    const fetchEvents = useCallback(async () => {
        try {
            const [participatingRes, hostingRes] = await Promise.all([
                activityService.getMyParticipations(1, "validated", true),
                activityService.getHostedActivities(1, true),
            ]);
            const combined = [
                ...(participatingRes.activities || []),
                ...(hostingRes.activities || []),
            ];
            // Deduplicate by id
            const unique = Array.from(new Map(combined.map(a => [a.id, a])).values());
            setEvents(unique);
        } catch (e) {
            console.error("Error fetching diary events:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const goToPreviousMonth = () => {
        if (month === 0) { setMonth(11); setYear((prev) => prev - 1); }
        else { setMonth((prev) => prev - 1); }
    };

    const goToNextMonth = () => {
        if (month === 11) { setMonth(0); setYear((prev) => prev + 1); }
        else { setMonth((prev) => prev + 1); }
    };

    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

    const firstDay = new Date(year, month, 1);
    const firstDayOffset: number = (firstDay.getDay() + 6) % 7;
    const totalDays: number = new Date(year, month + 1, 0).getDate();

    const initials = user
        ? `${(user.first_name || "").charAt(0)}${(user.last_name || "").charAt(0)}`.toUpperCase() || "?"
        : "?";

    const getEventDaysForMonth = (m: number, y: number): number[] => {
        return events
            .filter(e => {
                if (!e.date && !e.start_date) return false;
                const d = dayjs(e.date || e.start_date);
                return d.month() === m && d.year() === y;
            })
            .map(e => dayjs(e.date || e.start_date).date());
    };

    const filteredEvents = events.filter(e => {
        if (!e.date && !e.start_date) return false;
        const d = dayjs(e.date || e.start_date);
        return d.date() === selectedDay && d.month() === selectedMonth && d.year() === selectedYear;
    });

    return (
        <View className={`${isDarkMode ? "bg-black" : "bg-white"} flex-1`}>
            <HeaderMyDiary title="Mon Agenda" />

            <View className="p-5">
                <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"} p-4 rounded-lg mb-4`}>
                    <View className="flex-row justify-between items-center mb-6">
                        <TouchableOpacity onPress={goToPreviousMonth}>
                            <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                        </TouchableOpacity>
                        <Text className={`font-bold ${isDarkMode ? "text-white" : ""}`}>
                            {`${monthNames[month]} ${year}`}
                        </Text>
                        <TouchableOpacity onPress={goToNextMonth}>
                            <MaterialIcons name="arrow-forward-ios" size={25} color={isDarkMode ? "white" : "black"} />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row">
                        {weekDays.map((day, index) => (
                            <Text key={index} style={{ width: "14.28%" }} className={`text-center font-semibold ${isDarkMode ? "text-white" : ""}`}>
                                {day}
                            </Text>
                        ))}
                    </View>

                    <View className="flex flex-wrap flex-row">
                        {Array.from({ length: firstDayOffset }).map((_, index) => (
                            <View key={`empty-${index}`} style={{ width: "14.28%" }} />
                        ))}

                        {Array.from({ length: totalDays }).map((_, index) => {
                            const dayNum = index + 1;
                            const isSelected = dayNum === selectedDay && month === selectedMonth && year === selectedYear;
                            const isToday = dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                            const eventDays = getEventDaysForMonth(month, year);
                            const hasEvent = eventDays.includes(dayNum);

                            return (
                                <TouchableOpacity key={dayNum} style={{ width: "14.28%" }} className="flex items-center justify-center"
                                    onPress={() => { setSelectedDay(dayNum); setSelectedMonth(month); setSelectedYear(year); }}>
                                    <View className={`w-10 h-10 items-center justify-center rounded-full ${isSelected ? isToday ? "bg-[#175ABC]" : "bg-[#CAD9F2]" : isToday ? "bg-[#175ABC]" : ""}`}>
                                        <Text className={`text-lg font-bold text-center ${isSelected ? isToday ? "text-white" : "text-[#175ABC]" : isToday ? "text-white" : isDarkMode ? "text-white" : ""}`}>
                                            {dayNum}
                                        </Text>
                                    </View>
                                    {hasEvent && (
                                        <View className={`w-5 h-1 rounded-full ${isSelected ? isToday ? "bg-white" : "bg-[#1A6EDE]" : isToday ? "bg-white" : "bg-[#1A6EDE]"} relative bottom-[0.6rem]`} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" className="mt-8" />
            ) : (
                <ScrollView className="mx-[-20px] px-5" contentContainerStyle={{ flexGrow: 1 }}>
                    {filteredEvents.length === 0 ? (
                        <View className="items-center mt-8">
                            <Text className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Aucune activité ce jour</Text>
                        </View>
                    ) : (
                        filteredEvents.map((event) => (
                            <EventCardReal
                                key={event.id}
                                id={event.id}
                                title={event.title || "Activité"}
                                date={dayjs(event.date || event.start_date).format("ddd DD MMM - HH:mm")}
                                location={event.location || event.city || ""}
                                category={event.category || ""}
                                image={event.image_url ? { uri: event.image_url } : require("../../img/billard-exemple.jpg")}
                                currentParticipants={event.current_participants || 0}
                                totalParticipants={event.max_participants || 0}
                                userInitials={initials}
                                hostId={event.host_id}
                                isLiked={event.is_liked || false}
                                likesCount={event.likes_count || 0}
                                onToggleLike={async () => {
                                    try {
                                        if (event.is_liked) {
                                            await activityService.unlikeActivity(event.id);
                                        } else {
                                            await activityService.likeActivity(event.id);
                                        }
                                        fetchEvents();
                                    } catch (e) { console.error(e); }
                                }}
                            />
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
};

export default MyDiary;
