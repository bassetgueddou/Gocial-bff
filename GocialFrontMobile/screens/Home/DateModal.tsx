import React, { useState, useMemo } from "react";
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
import { useFilters } from "../../src/contexts/FilterContext";
import EventCardReal from "./EventCardReal";
import type { Activity } from "../../src/types";

const { width, height } = Dimensions.get("window");

interface DateModalProps {
  visible: boolean;
  onClose: () => void;
  activities?: Activity[];
}

const DateModal: React.FC<DateModalProps> = ({ visible, onClose, activities = [] }) => {
  const { isDarkMode } = useTheme();
  const { setDateRange } = useFilters();

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

  // Extraire les jours ayant une activite pour un mois donne
  const getEventDaysForMonth = (m: number, y: number): number[] => {
    const days = new Set<number>();
    activities.forEach((a) => {
      const d = new Date(a.date);
      if (d.getMonth() === m && d.getFullYear() === y) {
        days.add(d.getDate());
      }
    });
    return Array.from(days);
  };

  // Filtrer les activites du jour selectionne
  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const d = new Date(a.date);
      return (
        d.getDate() === selectedDay &&
        d.getMonth() === selectedMonth &&
        d.getFullYear() === selectedYear
      );
    });
  }, [activities, selectedDay, selectedMonth, selectedYear]);

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

            {/* Activites du jour */}
            <View className="mx-[-20px] px-0">
              {filteredActivities.length === 0 ? (
                <Text className={`text-center mt-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Aucune activité ce jour-là
                </Text>
              ) : (
                filteredActivities.map((a) => {
                  const host = a.host;
                  const initials = host?.first_name
                    ? `${host.first_name.charAt(0)}${(host.last_name || "").charAt(0)}`.toUpperCase()
                    : "?";
                  const dateObj = new Date(a.date);
                  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
                  const months = ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];
                  const formattedDate = `${days[dateObj.getDay()]}. ${dateObj.getDate()} ${months[dateObj.getMonth()]}. - ${dateObj.getHours().toString().padStart(2, "0")}:${dateObj.getMinutes().toString().padStart(2, "0")}`;

                  return (
                    <EventCardReal
                      key={a.id}
                      id={a.id}
                      title={a.title}
                      date={formattedDate}
                      location={a.city || a.address || ""}
                      category={a.category}
                      image={a.image_url ? { uri: a.image_url } : require("../../img/billard-exemple.jpg")}
                      currentParticipants={a.current_participants}
                      totalParticipants={a.max_participants}
                      userInitials={initials}
                      hostId={host?.id}
                    />
                  );
                })
              )}
            </View>

            {/* Boutons en bas */}
            <View className={`absolute bottom-6 left-0 right-0 ${isDarkMode ? "bg-black" : "bg-white"} p-4 flex-row justify-between`}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedDay(today.getDate());
                  setSelectedMonth(today.getMonth());
                  setSelectedYear(today.getFullYear());
                  setDateRange(null, null);
                  onClose();
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
                onPress={() => {
                  // Build YYYY-MM-DD from selected day
                  const m = String(selectedMonth + 1).padStart(2, '0');
                  const d = String(selectedDay).padStart(2, '0');
                  const dateStr = `${selectedYear}-${m}-${d}`;
                  setDateRange(dateStr, null);
                  onClose();
                }}
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
