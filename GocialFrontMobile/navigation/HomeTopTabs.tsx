import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React from "react";
import { View } from "react-native";
import HomeMap from "../screens/Home/HomeMap";
import HomeReal from "../screens/Home/HomeReal";
import HomeVisio from "../screens/Home/HomeVisio";
import Header from "../screens/Header";
import { useTheme } from "../screens/ThemeContext";

const TopTabs = createMaterialTopTabNavigator();

const HomeTopTabs = () => {
    const { isDarkMode } = useTheme();

    return (
        <View style={{ flex: 1 }}>
            <Header title="Activités" />
            <TopTabs.Navigator
                screenOptions={{
                    tabBarIndicatorStyle: {
                        backgroundColor: isDarkMode ? "#1A6EDE" : "#065C98" // Couleur du trait sous l'onglet actif
                    },
                    tabBarLabelStyle: {
                        fontSize: 14, // Ajustez la taille si nécessaire
                        opacity: 1 // Assurez-vous que le texte est complètement opaque
                    },
                    tabBarActiveTintColor: isDarkMode ? "white" : "#000000", // Couleur du texte actif
                    tabBarInactiveTintColor: isDarkMode ? "white" : "#000000", // Couleur du texte inactif, évite l'effet de transparence
                    tabBarStyle: { backgroundColor: isDarkMode ? "#1D1E20" : "white"},
                }}
            >
                <TopTabs.Screen name="Carte" component={HomeMap} />
                <TopTabs.Screen name="Réel" component={HomeReal} />
                <TopTabs.Screen name="Visio" component={HomeVisio} />
            </TopTabs.Navigator>
        </View>
    );
};

export default HomeTopTabs;
