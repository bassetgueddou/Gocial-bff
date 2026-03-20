import React, { useState, useEffect, useRef } from "react";
import {
    View,
    FlatList,
    TouchableOpacity,
    Image,
    Dimensions,
    Text,
    TextInput
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../ThemeContext";
import { useFilters } from "../../src/contexts/FilterContext";
import WhatModal from "./WhatModal";
import WhereModal from "./WhereModal";
import FilterModal from "./FilterModal";
import DateModal from "./DateModal";

const { width } = Dimensions.get("window");

type FilterBarProps = {
    excludeFilters?: string[]; // e.g. ["what"]
};

const FilterBar: React.FC<FilterBarProps> = ({ excludeFilters = [] }) => {

    const filters = [
        { id: "search", icon: "search", label: "" },
        { id: "what", icon: "blur-on", label: "Quoi ?" },
        { id: "where", image: require("../../img/marker.png"), label: "Où ?" },
        { id: "date", icon: "schedule", label: "Date ?" },
        { id: "filters", icon: "tune", label: "Filtres" },
    ].filter((item) => !excludeFilters.includes(item.id));

    const { isDarkMode } = useTheme();
    const { setSearch, hasActiveFilters } = useFilters();
    const [modalWhatVisible, setModalWhatVisible] = useState(false);
    const [modalWhereVisible, setModalWhereVisible] = useState(false);
    const [modalFilterVisible, setModalFilterVisible] = useState(false);
    const [modalDateVisible, setModalDateVisible] = useState(false);
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Debounce search input -> FilterContext
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            setSearch(searchQuery.trim());
        }, 400);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [searchQuery, setSearch]);

    return (
        <View style={{ width: width, alignItems: "center", paddingVertical: 7 }}>
            <WhatModal visible={modalWhatVisible} onClose={() => setModalWhatVisible(false)} />
            <WhereModal visible={modalWhereVisible} onClose={() => setModalWhereVisible(false)} />
            <FilterModal visible={modalFilterVisible} onClose={() => setModalFilterVisible(false)} />
            <DateModal visible={modalDateVisible} onClose={() => setModalDateVisible(false)} />

            {searchVisible ? (
                <View className="px-2">
                    <View
                        style={{
                            padding: 6,
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: isDarkMode ? "#1D1E20" : "#FFFFFF",
                            borderRadius: 8,
                            width: "100%",
                            height: 40,
                            borderWidth: 1,
                            borderColor: isDarkMode ? "#444" : "#D1D1D1",
                        }}
                    >
                        <MaterialIcons name="search" size={20} color={isDarkMode ? "white" : "black"} />
                        <TextInput
                            style={{
                                flex: 1,
                                marginLeft: 8,
                                color: isDarkMode ? "white" : "black",
                            }}
                            placeholder="Rechercher..."
                            placeholderTextColor={isDarkMode ? "gray" : "black"}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        <TouchableOpacity onPress={() => {
                            setSearchVisible(false);
                            setSearchQuery("");
                            setSearch("");
                        }}>
                            <MaterialIcons name="close" size={20} color={isDarkMode ? "white" : "black"} />
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <FlatList
                    data={filters}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                    }}
                    renderItem={({ item }) => {
                        const isActive = item.id === "filters" && hasActiveFilters;
                        return (
                            <TouchableOpacity
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    backgroundColor: isActive
                                        ? (isDarkMode ? "#1A6EDE" : "#065C98")
                                        : (isDarkMode ? "#1D1E20" : "#F3F3F3"),
                                    borderRadius: 8,
                                    paddingVertical: 10,
                                    paddingHorizontal: 13,
                                    marginHorizontal: 4,
                                }}
                                onPress={() => {
                                    if (item.id === "what") {
                                        setModalWhatVisible(true);
                                    } else if (item.id === "where") {
                                        setModalWhereVisible(true);
                                    }
                                    else if (item.id === "filters") {
                                        setModalFilterVisible(true);
                                    }
                                    else if (item.id === "date") {
                                        setModalDateVisible(true);
                                    }
                                    else if (item.id === "search") {
                                        setSearchVisible(true);
                                    }
                                }}
                            >
                                {item.image ? (
                                    <Image
                                        source={item.image}
                                        style={{ width: 16, height: 16, resizeMode: "contain", tintColor: isActive ? "white" : (isDarkMode ? "white" : "black") }}
                                    />
                                ) : item.icon ? (
                                    <MaterialIcons name={item.icon} size={16} color={isActive ? "white" : (isDarkMode ? "white" : "black")} />
                                ) : null}

                                {item.label !== "" && (
                                    <Text className={`${isActive ? "text-white" : isDarkMode ? "text-white" : "text-black"} ml-1.5 text-xs font-medium`}>
                                        {item.label}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </View>
    );
};

export default FilterBar;
