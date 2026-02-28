import { View, Text, Pressable, TouchableOpacity, Image, ScrollView, Switch } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    GeneralParameter: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;


const NotificationToggle = ({ label }: { label: string }) => {
    const [enabled, setEnabled] = useState(false);
    const { isDarkMode } = useTheme();
    return (
        <View className="flex-row items-center justify-between py-2">
            <Text className={`text-base ${isDarkMode ? "text-white" : "text-black"}`}>{label}</Text>
            <Switch
                value={enabled}
                onValueChange={setEnabled}
                thumbColor="white"
                trackColor={{ false: "#E5E7EB", true: "green" }}
                ios_backgroundColor={isDarkMode ? "#1D1E20" : "#E5E7EB"}
                style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
            />
        </View>
    );
};

const NotificationsPerson = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    return (
        <View className={`flex-1 ${isDarkMode ? "bg-black" : "bg-gray-200"}`}>
            {/* HEADER */}
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        Notifications
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("GeneralParameter")}>
                       <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* CONTENU SCROLLABLE */}
            <View className="flex-1">
                <ScrollView className={`px-4 pt-4 pb-4 ${isDarkMode ? "bg-[#1D1E20]" : "bg-gray-200"}`}>
                    {/* Activité */}
                    <View className="mb-4">
                        <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"} mb-2`}>Activité</Text>
                        <View className={`mb-4 ${isDarkMode ? "bg-black" : "bg-white"} p-4 rounded-lg`}>
                            <NotificationToggle label="Rappels des activités" />
                            <NotificationToggle label="Une place se libère" />
                            <NotificationToggle label="Inscription à mon activité" />
                            <NotificationToggle label="Messages activités" />
                            <NotificationToggle label="Avis" />
                            <NotificationToggle label="Mise à jour" />
                        </View>
                    </View>

                    {/* Perso */}
                    <View className="mb-4">
                        <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"} mb-2`}>Perso</Text>
                        <View className={`mb-4 ${isDarkMode ? "bg-black" : "bg-white"} p-4 rounded-lg`}>
                            <NotificationToggle label="Message privé" />
                            <NotificationToggle label="Demandes d’amis" />
                            <NotificationToggle label="Invitation par message" />
                            <NotificationToggle label="Activité de mes amis" />
                        </View>
                    </View>

                    {/* Actualité */}
                    <View className="mb-4">
                        <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"} mb-2`}>Actualité</Text>
                        <View className={`mb-4 ${isDarkMode ? "bg-black" : "bg-white"} p-4 rounded-lg`}>
                            <NotificationToggle label="Suggestion" />
                            <NotificationToggle label="Nouveauté" />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default NotificationsPerson;
