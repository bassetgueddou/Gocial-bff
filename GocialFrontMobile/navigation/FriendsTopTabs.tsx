import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React from "react";
import { View } from "react-native";
import MyFriends from "../screens/Friends/MyFriends";
import FriendsPerson from "../screens/Friends/Discoveries";
import Header from "../screens/Header";
import { useTheme } from "../screens/ThemeContext";

const TopTabs = createMaterialTopTabNavigator();

const FriendsTopTabs = () => {
    const { isDarkMode } = useTheme();

    return (
        <View style={{ flex: 1 }}>
            <Header title="Amis" />
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
                <TopTabs.Screen name="Mes Amis" component={MyFriends} />
                <TopTabs.Screen name="Découvertes" component={FriendsPerson} />
            </TopTabs.Navigator>
        </View>
    );
};

export default FriendsTopTabs;
