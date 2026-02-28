import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../ThemeContext";
import EventCardReal from "../Home/EventCardReal";
import HeaderMyDiary from "./HeaderMyDiary";

const MyDiary: React.FC = () => {
    const { isDarkMode } = useTheme();

    const events = [
        {
            id: 1,
            title: "Soirée à B&CO",
            date: "Mar. 25 mars. - 08:45",
            location: "Versailles",
            category: "Jeu",
            image: require("../../img/billard-exemple.jpg"),
            currentParticipants: 1,
            totalParticipants: 10,
            userInitials: "EL",
        },
        {
            id: 2,
            title: "Soirée à B&CO",
            date: "Mar. 30 mars. - 08:45",
            location: "Versailles",
            category: "Jeu",
            image: require("../../img/billard-exemple.jpg"),
            currentParticipants: 1,
            totalParticipants: 10,
            userInitials: "EL",
        },
        {
            id: 3,
            title: "Soirée à B&CO",
            date: "Mar. 30 mars. - 08:45",
            location: "Versailles",
            category: "Jeu",
            image: require("../../img/billard-exemple.jpg"),
            currentParticipants: 1,
            totalParticipants: 10,
            userInitials: "EL",
        },
        {
            id: 4,
            title: "Soirée à B&CO",
            date: "Mar. 30 mars. - 08:45",
            location: "Versailles",
            category: "Jeu",
            image: require("../../img/billard-exemple.jpg"),
            currentParticipants: 1,
            totalParticipants: 10,
            userInitials: "EL",
        },
        {
            id: 5,
            title: "Soirée à B&CO",
            date: "Mar. 30 mars. - 08:45",
            location: "Versailles",
            category: "Jeu",
            image: require("../../img/billard-exemple.jpg"),
            currentParticipants: 1,
            totalParticipants: 10,
            userInitials: "EL",
        },
    ];

    const today = new Date();
    const [month, setMonth] = useState<number>(today.getMonth());
    const [year, setYear] = useState<number>(today.getFullYear());
    const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
    const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());

    const goToPreviousMonth = () => {
        if (month === 0) {
            setMonth(11);
            setYear((prev) => prev - 1);
        } else {
            setMonth((prev) => prev - 1);
        }
    };

    const goToNextMonth = () => {
        if (month === 11) {
            setMonth(0);
            setYear((prev) => prev + 1);
        } else {
            setMonth((prev) => prev + 1);
        }
    };

    const monthNames = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
    ];
    const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

    const firstDay = new Date(year, month, 1);
    const firstDayOffset: number = (firstDay.getDay() + 6) % 7;
    const totalDays: number = new Date(year, month + 1, 0).getDate();

    // 🔍 Fonction pour extraire date d'un event (jour/mois)
    const parseEventDate = (
        eventDateStr: string
    ): { day: number; month: number; year: number } | null => {
        const regex = /(\d{1,2})\s+([a-zéû]+)\./i; // ex: "25 mars."
        const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

        const match = eventDateStr.match(regex);
        if (!match) return null;

        const day = parseInt(match[1], 10);
        const monthStr = match[2].toLowerCase();
        const monthIndex = months.indexOf(monthStr);
        const year = today.getFullYear(); // À adapter si tu ajoutes des années plus tard

        if (day && monthIndex >= 0) {
            return { day, month: monthIndex, year };
        }

        return null;
    };

    // 📅 Affiche un point sous les jours ayant un event
    const getEventDaysForMonth = (month: number, year: number): number[] => {
        return events
            .map((event) => {
                const parsed = parseEventDate(event.date);
                if (
                    parsed &&
                    parsed.month === month &&
                    parsed.year === year
                ) {
                    return parsed.day;
                }
                return null;
            })
            .filter((day): day is number => day !== null);
    };

    // 🔎 Filtre les événements du jour sélectionné
    const filteredEvents = events.filter((event) => {
        const parsed = parseEventDate(event.date);
        return (
            parsed &&
            parsed.day === selectedDay &&
            parsed.month === selectedMonth &&
            parsed.year === selectedYear
        );
    });

    return (
        <View className={`${isDarkMode ? "bg-black" : "bg-white"} flex-1`} >
            <HeaderMyDiary title="Mon Agenda" />

            <View className="p-5">
                {/* Calendrier */}
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
                            <Text
                                key={index}
                                style={{ width: "14.28%" }}
                                className={`text-center font-semibold ${isDarkMode ? "text-white" : ""}`}
                            >
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
                            const isSelected =
                                dayNum === selectedDay &&
                                month === selectedMonth &&
                                year === selectedYear;

                            const isToday =
                                dayNum === today.getDate() &&
                                month === today.getMonth() &&
                                year === today.getFullYear();

                            const eventDays = getEventDaysForMonth(month, year);
                            const hasEvent = eventDays.includes(dayNum);

                            return (
                                <TouchableOpacity
                                    key={dayNum}
                                    style={{ width: "14.28%" }}
                                    className="flex items-center justify-center"
                                    onPress={() => {
                                        setSelectedDay(dayNum);
                                        setSelectedMonth(month);
                                        setSelectedYear(year);
                                    }}
                                >
                                    <View
                                        className={`w-10 h-10 items-center justify-center rounded-full ${isSelected
                                            ? isToday ? "bg-[#175ABC]" : "bg-[#CAD9F2]"
                                            : isToday
                                                ? "bg-[#175ABC]"
                                                : ""
                                            }`}
                                    >
                                        <Text
                                            className={`text-lg font-bold text-center ${isSelected
                                                ? isToday ? "text-white" : "text-[#175ABC]"
                                                : isToday
                                                    ? "text-white"
                                                    : isDarkMode
                                                        ? "text-white"
                                                        : ""
                                                }`}
                                        >
                                            {dayNum}
                                        </Text>
                                    </View>
                                    {hasEvent && (
                                        <View
                                            className={`w-5 h-1 rounded-full ${isSelected ? isToday ? "bg-white" : "bg-[#1A6EDE]" : isToday ? "bg-white" : "bg-[#1A6EDE]"
                                                } relative bottom-[0.6rem]`}
                                        />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>


            {/* EventCardReal */}
            <ScrollView className="mx-[-20px] px-5" contentContainerStyle={{ flexGrow: 1 }}>
                {filteredEvents.map((event) => (
                    <EventCardReal
                        key={event.id}
                        id={event.id}
                        title={event.title}
                        date={event.date}
                        location={event.location}
                        category={event.category}
                        image={event.image}
                        currentParticipants={event.currentParticipants}
                        totalParticipants={event.totalParticipants}
                        userInitials={event.userInitials}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

export default MyDiary;
