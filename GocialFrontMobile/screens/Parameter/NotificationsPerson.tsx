import { View, Text, TouchableOpacity, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../../src/contexts/AuthContext";
import { userService } from "../../src/services/users";
import Toast from "react-native-toast-message";

type RootStackParamList = {
    GeneralParameter: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

type NotifField = 'notif_new_activity' | 'notif_friend_request' | 'notif_messages' | 'notif_participation' | 'notif_push_enabled';

interface NotificationToggleProps {
    label: string;
    value: boolean;
    field: NotifField;
    onToggle: (field: NotifField, newValue: boolean) => Promise<void>;
}

const NotificationToggle = ({ label, value, field, onToggle }: NotificationToggleProps) => {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);

    const handleToggle = async (newValue: boolean) => {
        if (loading) return;
        setLoading(true);
        try {
            await onToggle(field, newValue);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-row items-center justify-between py-2">
            <Text className={`text-base flex-1 mr-2 ${isDarkMode ? "text-white" : "text-black"}`}>{label}</Text>
            {loading ? (
                <ActivityIndicator size="small" color={isDarkMode ? "#1A6EDE" : "#065C98"} />
            ) : (
                <Switch
                    value={value}
                    onValueChange={handleToggle}
                    thumbColor="white"
                    trackColor={{ false: "#E5E7EB", true: "green" }}
                    ios_backgroundColor={isDarkMode ? "#1D1E20" : "#E5E7EB"}
                    style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                />
            )}
        </View>
    );
};

const NotificationsPerson = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { user, refreshUser } = useAuth();

    const handleToggle = useCallback(async (field: NotifField, newValue: boolean) => {
        try {
            await userService.updateProfile({ [field]: newValue });
            await refreshUser();
            Toast.show({
                type: 'success',
                text1: 'Préférence mise à jour',
                position: 'top',
                topOffset: 60,
            });
        } catch {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: 'Impossible de mettre à jour la préférence',
                position: 'top',
                topOffset: 60,
            });
        }
    }, [refreshUser]);

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
                            <NotificationToggle
                                label="Nouvelles activités"
                                value={user?.notif_new_activity ?? true}
                                field="notif_new_activity"
                                onToggle={handleToggle}
                            />
                            <NotificationToggle
                                label="Participations"
                                value={user?.notif_participation ?? true}
                                field="notif_participation"
                                onToggle={handleToggle}
                            />
                        </View>
                    </View>

                    {/* Perso */}
                    <View className="mb-4">
                        <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"} mb-2`}>Perso</Text>
                        <View className={`mb-4 ${isDarkMode ? "bg-black" : "bg-white"} p-4 rounded-lg`}>
                            <NotificationToggle
                                label="Messages privés"
                                value={user?.notif_messages ?? true}
                                field="notif_messages"
                                onToggle={handleToggle}
                            />
                            <NotificationToggle
                                label="Demandes d'amis"
                                value={user?.notif_friend_request ?? true}
                                field="notif_friend_request"
                                onToggle={handleToggle}
                            />
                        </View>
                    </View>

                    {/* Général */}
                    <View className="mb-4">
                        <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"} mb-2`}>Général</Text>
                        <View className={`mb-4 ${isDarkMode ? "bg-black" : "bg-white"} p-4 rounded-lg`}>
                            <NotificationToggle
                                label="Notifications push"
                                value={user?.notif_push_enabled ?? true}
                                field="notif_push_enabled"
                                onToggle={handleToggle}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default NotificationsPerson;
