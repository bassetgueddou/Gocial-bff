import React, { useCallback } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useTheme } from "../ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";

type DiaryFilter = "all" | "participations" | "liked";

interface FilterDiaryModalProps {
    visible: boolean;
    onClose: () => void;
    filter: DiaryFilter;
    onFilterChange: (f: DiaryFilter) => void;
}

const FILTERS: { key: DiaryFilter; label: string; icon: string; description: string }[] = [
    {
        key: "all",
        label: "Tout",
        icon: "calendar-outline",
        description: "Toutes vos activités",
    },
    {
        key: "participations",
        label: "Participations",
        icon: "people-outline",
        description: "Activités auxquelles vous participez ou organisez",
    },
    {
        key: "liked",
        label: "Likées",
        icon: "heart-outline",
        description: "Activités que vous avez likées",
    },
];

const FilterDiaryModal: React.FC<FilterDiaryModalProps> = ({
    visible,
    onClose,
    filter,
    onFilterChange,
}) => {
    const { isDarkMode } = useTheme();

    const panGesture = Gesture.Pan().onUpdate((event) => {
        if (event.translationY > 100) {
            runOnJS(onClose)();
        }
    });

    const handleSelect = useCallback(
        (f: DiaryFilter) => {
            onFilterChange(f);
            onClose();
        },
        [onFilterChange, onClose]
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <GestureDetector gesture={panGesture}>
                <View className="flex-1 justify-end bg-black/50">
                    <View
                        className={`w-full rounded-t-3xl p-6 ${isDarkMode ? "bg-[#111111]" : "bg-white"}`}
                    >
                        {/* Drag handle */}
                        <View className="items-center mb-5">
                            <View
                                className={`w-10 h-1 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                            />
                        </View>

                        {/* Titre */}
                        <View className="flex-row items-center justify-between mb-6">
                            <Text
                                className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-black"}`}
                            >
                                Filtrer l'agenda
                            </Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Options de filtre */}
                        <View className="gap-3 mb-8">
                            {FILTERS.map((f) => {
                                const isActive = filter === f.key;
                                return (
                                    <TouchableOpacity
                                        key={f.key}
                                        onPress={() => handleSelect(f.key)}
                                        className={`flex-row items-center p-4 rounded-xl border ${
                                            isActive
                                                ? "bg-[#065C98] border-[#065C98]"
                                                : isDarkMode
                                                    ? "bg-[#1D1E20] border-gray-700"
                                                    : "bg-[#F2F5FA] border-gray-200"
                                        }`}
                                    >
                                        <Ionicons
                                            name={f.icon as any}
                                            size={22}
                                            color={isActive ? "#ffffff" : isDarkMode ? "#9CA3AF" : "#6B7280"}
                                            style={{ marginRight: 14 }}
                                        />
                                        <View className="flex-1">
                                            <Text
                                                className={`text-base font-semibold ${
                                                    isActive
                                                        ? "text-white"
                                                        : isDarkMode
                                                            ? "text-white"
                                                            : "text-black"
                                                }`}
                                            >
                                                {f.label}
                                            </Text>
                                            <Text
                                                className={`text-xs mt-0.5 ${
                                                    isActive
                                                        ? "text-blue-100"
                                                        : isDarkMode
                                                            ? "text-gray-500"
                                                            : "text-gray-400"
                                                }`}
                                            >
                                                {f.description}
                                            </Text>
                                        </View>
                                        {isActive && (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={22}
                                                color="#ffffff"
                                            />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </GestureDetector>
        </Modal>
    );
};

export default FilterDiaryModal;
