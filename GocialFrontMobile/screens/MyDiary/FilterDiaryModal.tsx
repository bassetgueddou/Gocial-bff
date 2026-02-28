import React, { useState, useCallback, useMemo } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { runOnJS } from "react-native-reanimated";
import { useTheme } from "../ThemeContext";

interface FilterState {
    interested: boolean;
    participating: boolean;
    awaiting: boolean;
    organizing: boolean;
    past: boolean;
    canceled: boolean;
}

interface FilterDiaryModalProps {
    visible: boolean;
    onClose: () => void;
}

interface Filter {
    label: string;
    key: keyof FilterState;
    count: number;
}

const FilterDiaryModal: React.FC<FilterDiaryModalProps> = ({ visible, onClose }) => {
    const { isDarkMode } = useTheme();

    const panGesture = Gesture.Pan().onUpdate((event) => {
        if (event.translationY > 100) {
            runOnJS(onClose)();
        }
    });

    const [filterState, setFilterState] = useState<FilterState>({
        interested: false,
        participating: false,
        awaiting: false,
        organizing: false,
        past: false,
        canceled: false,
    });

    const [allSelected, setAllSelected] = useState<boolean>(false);

    const toggleFilter = useCallback((filter: keyof FilterState) => {
        setFilterState((prev) => ({
            ...prev,
            [filter]: !prev[filter],
        }));
    }, []);

    const resetFilters = () => {
        setFilterState({
            interested: false,
            participating: false,
            awaiting: false,
            organizing: false,
            past: false,
            canceled: false,
        });
        setAllSelected(false);
    };

    const selectAllFilters = () => {
        setFilterState({
            interested: true,
            participating: true,
            awaiting: true,
            organizing: true,
            past: true,
            canceled: true,
        });
        setAllSelected(true);
    };

    const allSelectedMemo = useMemo(() => {
        return Object.values(filterState).every(Boolean);
    }, [filterState]);

    const filters: Filter[] = [
        { label: "Je suis intéressé(e)", key: "interested", count: 1 },
        { label: "Je participe", key: "participating", count: 0 },
        { label: "En attente de validation", key: "awaiting", count: 2 },
        { label: "J’organise", key: "organizing", count: 0 },
        { label: "Passées", key: "past", count: 1 },
        { label: "Annulées", key: "canceled", count: 1 },
    ];

    const activeFilterCount = useMemo(() => {
        return filters.reduce((sum, filter) => {
            return filterState[filter.key] ? sum + filter.count : sum;
        }, 0);
    }, [filterState]);

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <GestureDetector gesture={panGesture}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className={`w-full h-full ${isDarkMode ? "bg-black" : "bg-white"} rounded-t-2xl p-5`}>

                        {/* Icône et texte */}
                        <View className="flex-row items-center justify-center mb-3 mt-[5rem] space-x-2">
                            <TouchableOpacity onPress={onClose} className="absolute left-0 bottom-5">
                                <MaterialIcons name="arrow-back-ios" size={22} color={isDarkMode ? "white" : "black"} />
                            </TouchableOpacity>

                            <Text className={`relative bottom-5 text-lg font-bold ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>Filtres</Text>

                            <TouchableOpacity onPress={onClose} className="absolute right-0 bottom-5">
                                <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                            </TouchableOpacity>
                        </View>

                        {/* Liste des filtres */}
                        <View className="mb-4">
                            {filters.map((filter) => (
                                <TouchableOpacity key={filter.key} onPress={() => toggleFilter(filter.key)} className="flex-row items-center mb-2">
                                    <Text className={`text-lg flex-1 ${isDarkMode ? "text-white" : "text-black"}`}>
                                        {`${filter.label} (${filter.count})`}
                                    </Text>
                                    <View className={`w-6 h-6 rounded-full ${filterState[filter.key] ? 'bg-blue-600' : 'bg-gray-400'}`} />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Filter Actions */}
                        <View className="flex-row justify-between mt-6">
                            <TouchableOpacity
                                onPress={allSelectedMemo ? resetFilters : selectAllFilters}
                                className="px-4 py-2 bg-[#1A6EDE] rounded"
                            >
                                <Text className="font-bold text-white">
                                    {allSelectedMemo ? 'Désélectionner' : 'Tout sélectionner'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Filter Button at bottom right */}
                        <TouchableOpacity
                            onPress={() => { }}
                            className="px-4 py-2 bg-[#CAD9F2] rounded absolute bottom-[3rem] right-5"
                        >
                            <Text className="font-bold">Filtrer ({activeFilterCount})</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </GestureDetector>
        </Modal>
    );
};

export default FilterDiaryModal;
