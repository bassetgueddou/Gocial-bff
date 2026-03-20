import { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Pressable, Vibration, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import Icon from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import moment from "moment";
import ShareModal from "../Home/ShareModal";
import { useAuth } from "../../src/contexts/AuthContext";
import { userService } from "../../src/services/users";
import { activityService } from "../../src/services/activities";
import { API_URL } from "../../src/config";
import type { Activity } from "../../src/types";
import Toast from "react-native-toast-message";

const fallbackImage = require("../../img/billard-exemple.jpg");

const EventCard: React.FC = () => {
    const [modalShareVisible, setModalShareVisible] = useState(false);
    const { isDarkMode } = useTheme();

    const [upcomingActivities, setUpcomingActivities] = useState<Activity[]>([]);
    const [pastActivities, setPastActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    // Track visibility per activity
    const [visibilityMap, setVisibilityMap] = useState<Record<number, boolean>>({});

    const abortRef = useRef<AbortController | null>(null);

    const fetchActivities = useCallback(async () => {
        if (abortRef.current) {
            abortRef.current.abort();
        }
        abortRef.current = new AbortController();

        try {
            setLoading(true);
            const [upcomingResult, pastResult] = await Promise.allSettled([
                activityService.getHostedActivities(1, false),
                activityService.getHostedActivities(1, true),
            ]);

            const upcoming = upcomingResult.status === "fulfilled"
                ? upcomingResult.value.activities.filter((a) => !a.is_past)
                : [];
            const allWithPast = pastResult.status === "fulfilled"
                ? pastResult.value.activities
                : [];
            const past = allWithPast.filter((a) => a.is_past);

            setUpcomingActivities(upcoming);
            setPastActivities(past);
        } catch {
            // Silent fail — empty state will show
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivities();

        return () => {
            if (abortRef.current) {
                abortRef.current.abort();
            }
        };
    }, [fetchActivities]);

    const handleLike = useCallback(async (activity: Activity) => {
        const optimistic = (prev: Activity[]) =>
            prev.map((a) =>
                a.id === activity.id
                    ? {
                          ...a,
                          is_liked: !a.is_liked,
                          likes_count: a.is_liked
                              ? (a.likes_count || 1) - 1
                              : (a.likes_count || 0) + 1,
                      }
                    : a,
            );

        setUpcomingActivities(optimistic);
        setPastActivities(optimistic);
        Vibration.vibrate(50);

        try {
            if (activity.is_liked) {
                await activityService.unlikeActivity(activity.id);
            } else {
                await activityService.likeActivity(activity.id);
            }
        } catch {
            // Revert on failure
            fetchActivities();
        }
    }, [fetchActivities]);

    const handleDelete = useCallback((activityId: number) => {
        Alert.alert(
            "Supprimer l'activité",
            "Êtes-vous sûr de vouloir supprimer cette activité ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await activityService.deleteActivity(activityId);
                            setPastActivities((prev) => prev.filter((a) => a.id !== activityId));
                            Toast.show({ type: "success", text1: "Activité supprimée", position: "top", topOffset: 60 });
                        } catch {
                            Toast.show({ type: "error", text1: "Erreur", text2: "Impossible de supprimer l'activité", position: "top", topOffset: 60 });
                        }
                    },
                },
            ],
        );
    }, []);

    const toggleVisibility = useCallback((activityId: number) => {
        setVisibilityMap((prev) => ({ ...prev, [activityId]: !prev[activityId] }));
    }, []);

    const formatDate = (dateStr: string): string => {
        const m = moment(dateStr);
        return m.isValid() ? m.format("ddd D MMM - HH:mm") : dateStr;
    };

    const getActivityImage = (activity: Activity) => {
        return activity.image_url ? { uri: `${API_URL}${activity.image_url}` } : fallbackImage;
    };

    const getInitials = (activity: Activity): string => {
        const host = activity.host;
        if (!host) return "?";
        const first = host.first_name?.[0] || "";
        const last = host.last_name?.[0] || "";
        return (first + last).toUpperCase() || "?";
    };

    const renderActivityCard = (activity: Activity, isPast: boolean) => (
        <TouchableOpacity
            key={activity.id}
            className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} rounded-lg shadow-md p-4 w-full mt-4`}
            style={{
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.9,
                shadowRadius: 4,
                elevation: 4,
            }}
        >
            <View className="flex-row items-start">
                {/* Event Image */}
                <Image className="h-[98px] w-[130px] rounded-lg" source={getActivityImage(activity)} />

                {/* Event Details */}
                <View className="ml-4 flex-1">
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`} numberOfLines={1}>
                        {activity.title}
                    </Text>
                    <Text className={isDarkMode ? "text-white" : "text-black"}>
                        {formatDate(activity.date)}
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <Image source={require("../../img/videoconference.png")} className="h-4 w-4" />
                        <Text className={`ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>
                            {activity.activity_type === "visio" ? "Visio" : "Réel"}
                        </Text>
                    </View>
                </View>

                {/* User Badge */}
                <View className="bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center">
                    <Text className="text-white font-semibold text-xs">{getInitials(activity)}</Text>
                </View>
            </View>

            {/* Bottom Actions */}
            <View className="flex-row items-center justify-between mt-3">
                {isPast ? (
                    /* Delete Button for past activities */
                    <TouchableOpacity
                        className="flex-row items-center px-4 py-2 rounded-lg bg-[#FF4D4D]"
                        onPress={() => handleDelete(activity.id)}
                    >
                        <Text className="text-white">Supprimer</Text>
                    </TouchableOpacity>
                ) : (
                    /* Visibility Button for upcoming activities */
                    <TouchableOpacity
                        onPress={() => toggleVisibility(activity.id)}
                        className={`flex-row items-center px-4 py-2 rounded-lg ${isDarkMode ? "bg-black" : visibilityMap[activity.id] ? "bg-gray-300" : "bg-gray-200"}`}
                    >
                        <MaterialIcons
                            name={visibilityMap[activity.id] ? "visibility" : "visibility-off"}
                            size={16}
                            color={isDarkMode ? "white" : "black"}
                        />
                        <Text className={`ml-2 ${isDarkMode ? "text-white" : "text-black"}`}>
                            {visibilityMap[activity.id] ? "Visible" : "Invisible"}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Participants and Likes */}
                <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center">
                        <Image
                            source={require("../../img/people.png")}
                            className="h-5 w-5"
                            style={{ tintColor: isDarkMode ? "white" : "black" }}
                        />
                        <Text className={`ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>
                            {activity.current_participants}/{activity.max_participants}
                        </Text>
                    </View>

                    <Pressable
                        onPress={() => handleLike(activity)}
                        className={`flex-row items-center ${isDarkMode ? "bg-black" : "bg-[#F3F3F3]"} rounded-xl p-2`}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    >
                        <MaterialIcons
                            name={activity.is_liked ? "favorite" : "favorite-border"}
                            size={13}
                            color={activity.is_liked ? "red" : isDarkMode ? "white" : "black"}
                        />
                        <Text className={isDarkMode ? "text-white" : "text-black"} style={{ minWidth: 16, textAlign: "center" }}>
                            {activity.likes_count || 0}
                        </Text>
                    </Pressable>

                    <TouchableOpacity
                        onPress={() => setModalShareVisible(true)}
                        className={`${isDarkMode ? "bg-black" : "bg-[#F3F3F3]"} rounded-xl p-[0.7rem]`}
                    >
                        <Icon name="share" size={13} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View className="mt-4 items-center py-8">
                <ActivityIndicator size="small" color={isDarkMode ? "#1A6EDE" : "#065C98"} />
            </View>
        );
    }

    const hasNoActivities = upcomingActivities.length === 0 && pastActivities.length === 0;

    return (
        <View className="mt-4">
            <ShareModal visible={modalShareVisible} onClose={() => setModalShareVisible(false)} />

            <Text className={`font-bold text-lg ml-3 ${isDarkMode ? "text-white" : "text-black"}`}>Activités</Text>

            {hasNoActivities ? (
                <View className={`${isDarkMode ? "bg-black" : "bg-[#F2F5FA]"} pb-[3.5rem] mt-2 pt-4 items-center py-8`}>
                    <Text className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Aucune activité</Text>
                </View>
            ) : (
                <View className={`${isDarkMode ? "bg-black" : "bg-[#F2F5FA]"} pb-[3.5rem] mt-2 pt-4`}>
                    <Text className={`font-bold ml-6 ${isDarkMode ? "text-white" : "text-black"}`}>
                        À venir ({upcomingActivities.length})
                    </Text>
                    {upcomingActivities.length === 0 ? (
                        <Text className={`ml-6 mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Aucune activité à venir</Text>
                    ) : (
                        upcomingActivities.map((a) => renderActivityCard(a, false))
                    )}

                    <Text className={`font-bold ml-6 mt-10 ${isDarkMode ? "text-white" : "text-black"}`}>
                        Passées ({pastActivities.length})
                    </Text>
                    {pastActivities.length === 0 ? (
                        <Text className={`ml-6 mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Aucune activité passée</Text>
                    ) : (
                        pastActivities.map((a) => renderActivityCard(a, true))
                    )}
                </View>
            )}
        </View>
    );
};

const EditIdentity: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
    const { user, refreshUser } = useAuth();
    const [saving, setSaving] = useState(false);

    const [firstname, setFirstname] = useState<string>(user?.first_name || "");
    const [lastname, setLastname] = useState<string>(user?.last_name || "");
    const [city, setCity] = useState<string>(user?.city || "");
    const [gender, setGender] = useState<string>(user?.gender || "");
    const [birthDate, setBirthDate] = useState<string>(
        user?.birth_date
            ? moment(user.birth_date, "YYYY-MM-DD").format("DD/MM/YYYY")
            : ""
    );

    const handleSave = async () => {
        try {
            setSaving(true);
            const birthMoment = moment(birthDate, "DD/MM/YYYY");
            await userService.updateProfile({
                first_name: firstname,
                last_name: lastname,
                city,
                gender,
                birth_date: birthMoment.isValid() ? birthMoment.format("YYYY-MM-DD") : undefined,
            });
            await refreshUser();
            Toast.show({ type: "success", text1: "Identité mise à jour" });
            navigation.goBack();
        } catch (e: unknown) {
            const apiErr = e as { response?: { data?: { error?: string } } };
            Toast.show({ type: "error", text1: "Erreur", text2: apiErr?.response?.data?.error || "Impossible de sauvegarder" });
        } finally {
            setSaving(false);
        }
    };

    const renderTextInput = (label: string, value: string, setValue: (text: string) => void, editable: boolean = true) => {
        return (
            <View className="mt-2 w-full">
                {/* Label */}
                <Text className={`font-bold text-lg px-4 mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>
                    {label}
                </Text>

                {/* Conteneur du champ */}
                <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                    <TextInput
                        className={`border p-3 rounded-lg text-[#ABABAB]
                                    ${isDarkMode ? "border-[0.3px] border-white bg-black" : "border-[#065C98] bg-white"}
                                    ${["Prénom", "Nom", "Ville"].includes(label) ? (isDarkMode ? "text-white" : "text-black") : ""}
                                `}
                        value={value}
                        onChangeText={setValue}
                        editable={editable}
                    />
                </View>
            </View>
        );
    };

    const renderTextAgeInput = (label: string, birthDateValue: string, setBirthDateValue: (text: string) => void) => {
        // Calculer l'âge dynamiquement
        const birthMoment = moment(birthDateValue, "DD/MM/YYYY");
        const age = birthMoment.isValid() ? moment().diff(birthMoment, "years").toString() : "";

        return (
            <View className="mt-2 w-full">
                {/* Label */}
                <Text className={`font-bold text-lg px-4 mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>
                    {label}
                </Text>

                {/* Conteneur du champ */}
                <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} w-full rounded-lg px-6 py-4`}>
                    <View className="border flex-row items-center justify-between px-3 py-2 rounded-lg w-full"
                        style={{
                            borderColor: isDarkMode ? "white" : "#065C98",
                            borderWidth: isDarkMode ? 0.3 : 1,
                            backgroundColor: isDarkMode ? "black" : "white"
                        }}>

                        {/* Input pour la date */}
                        <TextInput
                            className="flex-1 text-[#ABABAB] text-lg relative bottom-[0.4rem]"
                            value={birthDateValue}
                            onChangeText={setBirthDateValue}
                            keyboardType="numeric"
                        />

                        {/* Affichage de l'âge à droite */}
                        <Text className="text-[#ABABAB] text-lg">
                            {age ? `${age} ans` : ""}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };


    return (
        <View className="flex-1">
            {/* HEADER */}
            <SafeAreaView className={isDarkMode ? "bg-black" : "bg-white"}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        Identité
                    </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* ScrollView avec padding bas pour éviter le chevauchement */}
            <ScrollView
                className={`p-0 ${isDarkMode ? "bg-black" : "bg-white"} flex-1`}
                contentContainerStyle={{ paddingBottom: 10 }}
                keyboardShouldPersistTaps="handled"
            >
                {renderTextInput("Prénom", firstname, setFirstname)}
                {renderTextInput("Nom", lastname, setLastname)}
                {renderTextInput("Ville", city, setCity)}
                {renderTextAgeInput("Age", birthDate, setBirthDate)}
                {renderTextInput("Genre", gender, setGender, false)}

                {/* Event Section */}
                <EventCard />
            </ScrollView>

            <View className={`${isDarkMode ? "bg-black" : "bg-white"} p-6 flex-row justify-between`}>
                <TouchableOpacity className="px-8 py-3 border border-[#FF4D4D] rounded-lg" onPress={() => navigation.goBack()}>
                    <Text className="text-[#FF4D4D] font-bold">Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`px-8 py-3 ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} rounded-lg ${saving ? "opacity-50" : ""}`}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text className="text-white font-bold">{saving ? "..." : "Enregistrer"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

};

export default EditIdentity;
