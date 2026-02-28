import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import ParticipationValidatedHost from "../screens/Activity/ParticipationValidatedHost";
import ParticipationPendingHost from "../screens/Activity/ParticipationPendingHost";
import { useTheme } from "../screens/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LinearGradient from "react-native-linear-gradient";

const TopTabs = createMaterialTopTabNavigator();

const ParticipationHostTopTabs = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation();

    return (
        <View style={{ flex: 1 }}>

            <LinearGradient
                colors={["#004C82", "#065C98"]} // Dégradé du bleu foncé au bleu clair
                start={{ x: 0, y: 0 }} // Début du gradient en haut
                end={{ x: 1, y: 1 }} // Fin du gradient en bas
                className="flex-1 p-4"
            >
                <SafeAreaView>
                    <View className="flex-row p-4">

                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <MaterialIcons name="arrow-back-ios" size={25} color="white" />
                        </TouchableOpacity>

                        {/* Title */}
                        <View className="flex-1 items-center">
                            <Text className="text-white text-lg font-semibold relative right-4">Participation</Text>
                        </View>

                    </View>
                </SafeAreaView>
            </LinearGradient>

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
                <TopTabs.Screen name="Validé (1)" component={ParticipationValidatedHost} />
                <TopTabs.Screen name="En attente (2)" component={ParticipationPendingHost} />
            </TopTabs.Navigator>
        </View>
    );
};

export default ParticipationHostTopTabs;
