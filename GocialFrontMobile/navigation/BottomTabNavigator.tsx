import React from "react";
import { Image, TouchableOpacity, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeTopTabs from "./HomeTopTabs";
import NotifsTopTabs from "./NotifsTopTabs";
import { useTheme } from "../screens/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FriendsTopTabs from "./FriendsTopTabs";
import MyDiary from "../screens/MyDiary/MyDiary";
import CreateActivity from "../screens/Plus/CreateActivity";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();


  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconSource;

          if (route.name === "Accueil") {
            iconSource =  
            (focused
                ? require("../img/home-full.png") // Mode clair + sélectionné
                : require("../img/home.png") // Mode clair + non sélectionné
              );
          } else if (route.name === "Agenda") {
            iconSource = (focused
                ? require("../img/mydiary-full.png") // Mode clair + sélectionné
                : require("../img/mydiary.png") // Mode clair + non sélectionné
              );
          } else if (route.name === "+") {
            iconSource = (
                require("../img/plus.png") // Mode clair + non sélectionné
              );
          } else if (route.name === "Amis") {
            iconSource = (focused
                ? require("../img/friends-full.png") // Mode clair + sélectionné
                : require("../img/friends.png") // Mode clair + non sélectionné
              );
          } else if (route.name === "Notifs") {
            iconSource = (focused
                ? require("../img/notifs-full.png") // Mode clair + sélectionné
                : require("../img/notifs.png") // Mode clair + non sélectionné
              );
          }

          return <Image
            source={iconSource}
            style={{
              width: route.name === "+" ? 31 : 24,
              height: route.name === "+" ? 31 : 24,
              tintColor: isDarkMode ? "white" : "black"
            }}
          />;
        },
        tabBarActiveTintColor: isDarkMode ? "white" : "black",
        tabBarStyle: { backgroundColor: isDarkMode ? "black" : "white", height: 55 + insets.bottom, paddingBottom: insets.bottom },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
      })}
    >
      <Tab.Screen name="Accueil" component={HomeTopTabs} options={{ headerShown: false }} />
      <Tab.Screen name="Agenda" component={MyDiary} options={{ headerShown: false }} />
      <Tab.Screen name="+" component={CreateActivity} options={{ headerShown: false, tabBarLabel: () => null,}} />
      <Tab.Screen name="Amis" component={FriendsTopTabs} options={{ headerShown: false }} />
      <Tab.Screen name="Notifs" component={NotifsTopTabs} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;