import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { runOnJS } from "react-native-reanimated";
import { useTheme } from "../ThemeContext";
import EventCardReal from "./EventCardReal";

const { width, height } = Dimensions.get("window");

interface DateModalProps {
  visible: boolean;
  onClose: () => void;
}

const DateModal: React.FC<DateModalProps> = ({ visible, onClose }) => {
  const { isDarkMode } = useTheme();

  const events = [
    {
      id: 1,
      title: "Soirée à B&CO",
      date: "Mar. 25 mars. - 08:45",
      location: "Versailles (12km)",
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

  const panGesture = Gesture.Pan().onUpdate((event) => {
    if (event.translationY > 100) {
      runOnJS(onClose)();
    }
  });

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
    <Modal visible={visible} animationType="slide" transparent>
      <GestureDetector gesture={panGesture}>
        <View className="flex-1 justify-end bg-black/50">
          <View className={`w-full h-[92%] ${isDarkMode ? "bg-black" : "bg-white"} rounded-t-2xl p-5`}>
            {/* Barre pour glisser */}
            <View className="items-center mb-3">
              <View className="w-10 h-1 bg-gray-400 rounded-full" />
            </View>

            <View className="flex-row items-center justify-center mb-3 space-x-2">
              <MaterialIcons name="schedule" size={20} color={isDarkMode ? "white" : "black"} />
              <Text
                className={`text-lg font-bold ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>
                Date
              </Text>
            </View>

            <View className="flex-row items-center justify-center mb-3 space-x-2">
              <Text
                className={`text-lg font-bold ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>
                A partir du...
              </Text>
            </View>

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
                    className={`text-center font-semibold ${isDarkMode ? "text-white" : ""
                      }`}
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
                        className={`w-10 h-10 items-center justify-center rounded-full ${isSelected ? "bg-[#175ABC]" : ""
                          }`}
                      >
                        <Text
                          className={`text-lg font-bold text-center ${isSelected
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
                          className={`w-5 h-1 rounded-full ${isSelected ? "bg-white" : "bg-[#1A6EDE]"
                            } relative bottom-[0.6rem]`}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* EventCardReal */}
            <View className="mx-[-20px] px-0">
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
            </View>

            {/* Boutons en bas */}
            <View className={`absolute bottom-6 left-0 right-0 ${isDarkMode ? "bg-black" : "bg-white"} p-4 flex-row justify-between`}>
              <TouchableOpacity
                onPress={() => {
                  // Réinitialiser la date à aujourd'hui
                  setSelectedDay(today.getDate());
                  setSelectedMonth(today.getMonth());
                  setSelectedYear(today.getFullYear());
                }}
                className={`border px-5 py-2 rounded-lg ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"
                  }`}
              >
                <Text
                  className={`text-base ${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"
                    }`}
                >
                  Réinitialiser
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                className={`px-5 py-2 rounded-lg flex-row items-center justify-center ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"
                  }`}
              >
                <MaterialIcons name="search" size={20} color="white" />
                <Text className="text-white text-base ml-2">Rechercher</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </GestureDetector>
    </Modal>
  );
};

export default DateModal;
