import React, { useState } from "react";
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
    ].filter((item) => !excludeFilters.includes(item.id)); // ← filtre selon les props

    const { isDarkMode } = useTheme();
    const [modalWhatVisible, setModalWhatVisible] = useState(false);
    const [modalWhereVisible, setModalWhereVisible] = useState(false);
    const [modalFilterVisible, setModalFilterVisible] = useState(false);
    const [modalDateVisible, setModalDateVisible] = useState(false);
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <View style={{ width: width, alignItems: "center", paddingVertical: 7 }}>
            {/* ✅ Modal d'activité */}
            <WhatModal visible={modalWhatVisible} onClose={() => setModalWhatVisible(false)} />
            <WhereModal visible={modalWhereVisible} onClose={() => setModalWhereVisible(false)} />
            <FilterModal visible={modalFilterVisible} onClose={() => setModalFilterVisible(false)} />
            <DateModal visible={modalDateVisible} onClose={() => setModalDateVisible(false)} />


            {/* ✅ Barre de recherche qui remplace les filtres */}
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
                            borderWidth: 1, // ✅ Ajoute une bordure
                            borderColor: isDarkMode ? "#444" : "#D1D1D1", // ✅ Gris foncé en mode sombre, gris clair en mode clair
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
                            autoFocus // Permet d'afficher le clavier immédiatement
                        />
                        <TouchableOpacity onPress={() => setSearchVisible(false)}>
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
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: isDarkMode ? "#1D1E20" : "#F3F3F3",
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
                                    style={{ width: 16, height: 16, resizeMode: "contain", tintColor: isDarkMode ? "white" : "black" }}
                                />
                            ) : item.icon ? (
                                <MaterialIcons name={item.icon} size={16} color={isDarkMode ? "white" : "black"} />
                            ) : null}

                            {item.label !== "" && (
                                <Text className={`${isDarkMode ? "text-white" : "text-black"} ml-1.5 text-xs font-medium`}>
                                    {item.label}
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

export default FilterBar;
