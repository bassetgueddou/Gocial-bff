import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React from "react";
import { View } from "react-native";
import Activity from "../screens/Notifs/Activity";
import Request from "../screens/Notifs/Request";
import ProfileView from "../screens/Notifs/ProfileView";
import Header from "../screens/Header";
import { useTheme } from "../screens/ThemeContext";

const TopTabs = createMaterialTopTabNavigator();

const NotifsTopTabs = () => {
    const { isDarkMode } = useTheme();

    return (
        <View style={{ flex: 1 }}>
            <Header title="Notifications" />
            <TopTabs.Navigator
                screenOptions={{
                    tabBarIndicatorStyle: {
                        backgroundColor: isDarkMode ? "#1A6EDE" : "#065C98" 
                    },
                    tabBarLabelStyle: {
                        fontSize: 14, 
                        opacity: 1 
                    },
                    tabBarActiveTintColor: isDarkMode ? "white" : "#000000", 
                    tabBarInactiveTintColor: isDarkMode ? "white" : "#000000", 
                    tabBarStyle: { backgroundColor: isDarkMode ? "#1D1E20" : "white" },
                }}
            >
                <TopTabs.Screen name="Activités" component={Activity} />
                <TopTabs.Screen name="Demandes" component={Request} />
                <TopTabs.Screen name="Vues du profil" component={ProfileView} />
            </TopTabs.Navigator>
        </View>
    );
};

export default NotifsTopTabs;
