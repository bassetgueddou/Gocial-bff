import React, { useState, useEffect, useCallback, useRef } from "react";
import { Image, AppState } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeTopTabs from "./HomeTopTabs";
import NotifsTopTabs from "./NotifsTopTabs";
import { useTheme } from "../screens/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FriendsTopTabs from "./FriendsTopTabs";
import MyDiary from "../screens/MyDiary/MyDiary";
import CreateActivity from "../screens/Plus/CreateActivity";
import { notificationService } from "../src/services/notifications";
import { messageService } from "../src/services/messages";

const Tab = createBottomTabNavigator();

const POLL_INTERVAL = 30000; // 30 seconds

const BottomTabNavigator = () => {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [notifUnread, setNotifUnread] = useState(0);
  const [msgUnread, setMsgUnread] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUnreadCounts = useCallback(async () => {
    const [notifResult, msgResult] = await Promise.allSettled([
      notificationService.getUnreadCount(),
      messageService.getUnreadCount(),
    ]);

    if (notifResult.status === 'fulfilled') {
      setNotifUnread(notifResult.value.unread || 0);
    }
    if (msgResult.status === 'fulfilled') {
      setMsgUnread(msgResult.value.total_unread || 0);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCounts();

    intervalRef.current = setInterval(fetchUnreadCounts, POLL_INTERVAL);

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        fetchUnreadCounts();
      }
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      subscription.remove();
    };
  }, [fetchUnreadCounts]);

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
      <Tab.Screen
        name="Amis"
        component={FriendsTopTabs}
        options={{
          headerShown: false,
          tabBarBadge: msgUnread > 0 ? msgUnread : undefined,
          tabBarBadgeStyle: msgUnread > 0 ? { backgroundColor: '#FF4D4D', color: 'white', fontSize: 10, minWidth: 18, height: 18, borderRadius: 9 } : undefined,
        }}
      />
      <Tab.Screen
        name="Notifs"
        component={NotifsTopTabs}
        options={{
          headerShown: false,
          tabBarBadge: notifUnread > 0 ? notifUnread : undefined,
          tabBarBadgeStyle: notifUnread > 0 ? { backgroundColor: '#FF4D4D', color: 'white', fontSize: 10, minWidth: 18, height: 18, borderRadius: 9 } : undefined,
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
