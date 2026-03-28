import { View, Text, TouchableOpacity, ScrollView, Image, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import React, { useState, useEffect, useCallback } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker, Region } from "react-native-maps";
import ShareModal from "../Home/ShareModal";
import Toast from "react-native-toast-message";
import { activityService } from "../../src/services/activities";
import { API_URL } from "../../src/config";
import type { Activity } from "../../src/types";
import { t } from "../../src/utils/translations";

type RootStackParamList = {
    ModifActivityOverview: { activityId: number };
    CATitle: undefined;
    ProfilPersonPreview: undefined;
    CreateActivity: undefined;
    CARealInformation: undefined;
    CANumberParticipants: undefined;
    CARealRestriction: undefined;
    ParticipationHostTopTabs: { activityId: number };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const formatDate = (iso: string) => {
    const d = new Date(iso);
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${days[d.getDay()]}. ${d.getDate()} ${months[d.getMonth()]}. - ${hh}:${mm}`;
};

const ModifActivityOverview: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<any>();
    const activityId: number | undefined = route.params?.activityId;

    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [modalShareVisible, setModalShareVisible] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    const fetchActivity = useCallback(async () => {
        if (!activityId) { setLoading(false); return; }
        try {
            setLoading(true);
            const data = await activityService.getActivity(activityId);
            const act: Activity = (data as any).activity || (data as any);
            setActivity(act);
            setLiked(act.is_liked ?? false);
            setLikesCount(act.likes_count ?? 0);
        } catch {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: 'Impossible de charger l\'activité',
                position: 'top',
                topOffset: 60,
            });
        } finally {
            setLoading(false);
        }
    }, [activityId]);

    useEffect(() => { fetchActivity(); }, [fetchActivity]);

    const handleLike = async () => {
        if (!activity || !activityId) return;
        const wasLiked = liked;
        setLiked(!wasLiked);
        setLikesCount(wasLiked ? likesCount - 1 : likesCount + 1);
        try {
            if (wasLiked) { await activityService.unlikeActivity(activityId); }
            else { await activityService.likeActivity(activityId); }
        } catch {
            setLiked(wasLiked);
            setLikesCount(wasLiked ? likesCount : likesCount - 1);
        }
    };

    const handleSave = () => {
        Toast.show({
            type: 'success',
            text1: 'Modifications terminées',
            position: 'top',
            topOffset: 60,
        });
        navigation.goBack();
    };

    const handleCancel = async () => {
        if (!activityId || cancelling) return;
        setCancelling(true);
        try {
            await activityService.deleteActivity(activityId);
            Toast.show({
                type: 'success',
                text1: 'Activité annulée',
                position: 'top',
                topOffset: 60,
            });
            navigation.goBack();
        } catch {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: 'Impossible d\'annuler l\'activité',
                position: 'top',
                topOffset: 60,
            });
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDarkMode ? "bg-black" : "bg-white"}`}>
                <ActivityIndicator size="large" color={isDarkMode ? "#1A6EDE" : "#065C98"} />
            </View>
        );
    }

    if (!activity) {
        return (
            <View className={`flex-1 justify-center items-center ${isDarkMode ? "bg-black" : "bg-white"}`}>
                <Text className={`text-base ${isDarkMode ? "text-white" : "text-black"}`}>Activité introuvable</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
                    <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"}`}>Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const hasCoordinates = activity.latitude != null && activity.longitude != null;
    const meetingLat = activity.latitude ?? 0;
    const meetingLng = activity.longitude ?? 0;

    const initialRegion: Region | undefined = hasCoordinates ? {
        latitude: meetingLat,
        longitude: meetingLng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    } : undefined;

    const avatarUri = activity.host?.avatar_url
        ? (activity.host.avatar_url.startsWith('http') ? activity.host.avatar_url : `${API_URL}${activity.host.avatar_url}`)
        : null;

    const imageUri = activity.image_url
        ? (activity.image_url.startsWith('http') ? activity.image_url : `${API_URL}${activity.image_url}`)
        : null;

    const infoItems = [
        { label: "Type d'activité", value: activity.category || t.activityType(activity.activity_type) },
        { label: "Âge des participants", value: `${activity.min_age}-${activity.max_age}` },
        { label: "Types de participants", value: t.genderRestriction(activity.gender_restriction) },
        { label: "Visibilité", value: t.visibility(activity.visibility) },
        { label: "Validation des participants", value: t.validationType(activity.validation_type) },
    ];

    const participantsList = activity.participants || [];

    return (
        <View className="flex-1">
            {/* HEADER */}
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <ShareModal visible={modalShareVisible} onClose={() => setModalShareVisible(false)} />

                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="close" size={25} color="red" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* ScrollView contenant tout le contenu */}
            <ScrollView className={`${isDarkMode ? "bg-black" : "bg-white"}`} contentContainerStyle={{ flexGrow: 1, paddingBottom: 130 }}>

                {/* Image principale */}
                <View className="relative">
                    <TouchableOpacity onPress={() => navigation.navigate("CATitle")}>
                        <View className="relative">
                            {imageUri ? (
                                <Image
                                    source={{ uri: imageUri }}
                                    className="w-full h-48"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className={`w-full h-48 justify-center items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"}`}>
                                    <MaterialIcons name="image" size={48} color={isDarkMode ? "#555" : "#CCC"} />
                                </View>
                            )}

                            {/* Icône d'édition en haut à droite */}
                            <View className="absolute right-2 top-2 bg-white p-2 rounded-lg">
                                <MaterialIcons
                                    name="edit"
                                    size={18}
                                    color={isDarkMode ? "#1A6EDE" : "#065C98"}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Image de profil superposée */}
                    <TouchableOpacity onPress={() => navigation.navigate("ProfilPersonPreview")} className="absolute -bottom-6 left-4 rounded-full">
                        {avatarUri ? (
                            <Image
                                source={{ uri: avatarUri }}
                                className="w-16 h-16 rounded-full"
                            />
                        ) : (
                            <View className={`w-16 h-16 rounded-full justify-center items-center ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"}`}>
                                <Text className="text-white font-bold text-lg">
                                    {(activity.host?.first_name || '?')[0].toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Contenu texte */}
                <View className="mt-2 items-center">
                    <TouchableOpacity onPress={() => navigation.navigate("CATitle")} className="flex-row">
                        <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold text-lg text-center`}>
                            {activity.title}
                        </Text>
                        <MaterialIcons name="edit" size={18} color={isDarkMode ? "#1A6EDE" : "#065C98"} className="relative left-1" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("CARealInformation")} className="flex-row">
                        <Text className={`${isDarkMode ? "text-white" : "text-black"} text-base mt-1`}>
                            {formatDate(activity.date)}
                        </Text>
                        <MaterialIcons name="edit" size={18} color={isDarkMode ? "#1A6EDE" : "#065C98"} className="relative left-1" />
                    </TouchableOpacity>
                </View>

                {/* Ville + Participants */}
                <View className="flex-row items-start justify-center px-[3rem] mt-4">
                    <TouchableOpacity onPress={() => navigation.navigate("CARealInformation")} className={`items-center flex-row border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg mr-6`}>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{activity.city || 'Non défini'}</Text>
                        <MaterialIcons name="edit" size={18} color={isDarkMode ? "#1A6EDE" : "#065C98"} className="relative left-1" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("CANumberParticipants")} className={`items-center flex-row border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg`}>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{activity.current_participants}/{activity.max_participants}</Text>
                        <MaterialIcons name="edit" size={18} color={isDarkMode ? "#1A6EDE" : "#065C98"} className="relative left-1" />
                    </TouchableOpacity>
                </View>

                {/* Like + Share */}
                <View className="flex-row justify-end gap-x-1 mt-2 px-2">
                    <Pressable
                        onPress={handleLike}
                        className={`w-[10%] flex-row items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"} rounded-xl p-2`}
                        style={({ pressed }) => [
                            { opacity: pressed ? 0.6 : 1 },
                        ]}
                    >
                        <MaterialIcons
                            name={liked ? "favorite" : "favorite-border"}
                            size={13}
                            color={liked ? "red" : isDarkMode ? "white" : "black"}
                        />
                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`} style={{ minWidth: 16, textAlign: "center" }}>
                            {likesCount}
                        </Text>
                    </Pressable>

                    <TouchableOpacity onPress={() => setModalShareVisible(true)} className={`w-[12%] items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"} rounded-xl p-[0.7rem]`}>
                        <FontAwesome name="share" size={13} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>

                {/* Participants section */}
                <View className={`p-4 ${isDarkMode ? "bg-black" : "bg-white"}`}>
                    <TouchableOpacity onPress={() => navigation.navigate("CANumberParticipants")} className="flex-row">
                        <Text className={`text-base mb-2 ${isDarkMode ? "text-white" : ""}`}>
                            {activity.current_participants}/{activity.max_participants} Participant{activity.current_participants > 1 ? 's' : ''}
                        </Text>
                        <MaterialIcons name="edit" size={18} color={isDarkMode ? "#1A6EDE" : "#065C98"} className="relative left-1" />
                    </TouchableOpacity>

                    <View className="flex-row mb-2">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {participantsList.map((p, idx) => {
                                const pAvatar = p.user?.avatar_url
                                    ? (p.user.avatar_url.startsWith('http') ? p.user.avatar_url : `${API_URL}${p.user.avatar_url}`)
                                    : null;
                                return pAvatar ? (
                                    <Image key={idx} source={{ uri: pAvatar }} className="w-10 h-10 rounded-full mr-1" />
                                ) : (
                                    <View key={idx} className={`w-10 h-10 rounded-full mr-1 justify-center items-center ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"}`}>
                                        <Text className="text-white font-bold text-sm">
                                            {(p.user?.first_name || '?')[0].toUpperCase()}
                                        </Text>
                                    </View>
                                );
                            })}
                        </ScrollView>

                        <TouchableOpacity
                            onPress={() => activityId && navigation.navigate("ParticipationHostTopTabs", { activityId })}
                            className={`ml-2 w-[2.45rem] h-[2.45rem] rounded-full ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} justify-center items-center`}
                        >
                            <MaterialIcons name="arrow-forward-ios" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Description */}
                <View className="mt-2 w-full mb-4">
                    <View className="flex-row items-center justify-between px-4 mb-2">
                        <TouchableOpacity onPress={() => navigation.navigate("CATitle")} className="flex-row">
                            <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>
                                Description
                            </Text>
                            <MaterialIcons name="edit" size={18} color={isDarkMode ? "#1A6EDE" : "#065C98"} className="relative left-1" />
                        </TouchableOpacity>
                    </View>

                    <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>
                            {activity.description || 'Aucune description'}
                        </Text>
                    </View>
                </View>

                {/* Carte avec Marqueur */}
                {hasCoordinates && initialRegion && (
                    <View className="h-60 w-full mt-2">
                        <MapView style={{ flex: 1 }} initialRegion={initialRegion}>
                            <Marker coordinate={{ latitude: meetingLat, longitude: meetingLng }}>
                                <View className="items-center">
                                    <View className="bg-white p-2 rounded-lg shadow-md mb-0">
                                        <Text className="font-semibold text-xs text-black">
                                            {activity.address || activity.city || 'Lieu de l\'activité'}
                                        </Text>
                                    </View>
                                    <MaterialIcons name="south" size={28} color="white" className="-mt-1" />
                                    <MaterialIcons name="location-pin" size={30} color="#C3AE79" />
                                </View>
                            </Marker>

                            {activity.meeting_point && (
                                <Marker coordinate={{ latitude: meetingLat + 0.002, longitude: meetingLng + 0.002 }}>
                                    <View className="items-center">
                                        <View className="bg-white p-2 rounded-lg shadow-md mb-0">
                                            <Text className="font-semibold text-xs text-black">
                                                {activity.meeting_point}
                                            </Text>
                                        </View>
                                        <MaterialIcons name="south" size={28} color="white" className="-mt-1" />
                                        <MaterialIcons name="location-pin" size={30} color="#828799" />
                                    </View>
                                </Marker>
                            )}
                        </MapView>
                    </View>
                )}

                {/* Adresses */}
                {hasCoordinates && (
                    <View className={`px-4 py-6 ${isDarkMode ? "bg-black" : "bg-white"}`}>
                        <View className="flex-row justify-between">
                            <View className="items-start w-[48%]">
                                <View className="flex-row items-center mb-3">
                                    <MaterialIcons name="location-pin" size={20} color="#C3AE79" />
                                    <TouchableOpacity onPress={() => navigation.navigate("CARealInformation")} className="flex-row">
                                        <Text className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                            Adresse du lieu
                                        </Text>
                                        <MaterialIcons name="edit" size={18} color={isDarkMode ? "#1A6EDE" : "#065C98"} className="relative left-1" />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity className="bg-[#C3AE79] rounded-2xl w-[80%] h-14 justify-center items-center">
                                    <Text className="text-white font-semibold text-center leading-tight text-base">
                                        Itinéraire{"\n"}lieu
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {activity.meeting_point && (
                                <View className="items-start w-[48%]">
                                    <View className="flex-row items-center mb-3">
                                        <MaterialIcons name="location-pin" size={20} color="#7C7E91" />
                                        <TouchableOpacity onPress={() => navigation.navigate("CARealInformation")} className="flex-row">
                                            <Text className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                                Point de rendez-vous
                                            </Text>
                                            <MaterialIcons name="edit" size={18} color={isDarkMode ? "#1A6EDE" : "#065C98"} className="relative left-1" />
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity className="bg-[#7C7E91] rounded-2xl w-[80%] h-14 justify-center items-center relative left-[1.5rem]">
                                        <Text className="text-white font-semibold text-center leading-tight text-base">
                                            Itinéraire{"\n"}rendez-vous
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* En savoir plus */}
                <View className="mt-6 w-full">
                    <View className="flex-row items-center justify-between px-4 mb-2">
                        <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>En savoir plus</Text>
                    </View>

                    <View className={`${isDarkMode ? "bg-black" : "bg-white"} rounded-lg`}>
                        {infoItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => navigation.navigate("CARealRestriction")}
                            >
                                <MaterialIcons
                                    name="edit"
                                    size={18}
                                    color={isDarkMode ? "#1A6EDE" : "#065C98"}
                                    className="self-end relative right-1"
                                />
                                <View className="mt-2">
                                    <View
                                        className={`flex-row justify-between items-center py-3 px-4 ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} rounded-lg`}
                                    >
                                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{item.label}</Text>
                                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{item.value}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className="px-2 mt-8">
                    <TouchableOpacity
                        className={`px-8 py-3 w-[60%] ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} rounded-xl flex-row items-center`}
                    >
                        <Text className="text-white font-bold">Plus de modifications</Text>
                        <MaterialIcons className="relative left-4" name="arrow-forward" size={22} color="white" />
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* Bottom bar */}
            <View className={`absolute bottom-0 left-0 right-0 ${isDarkMode ? 'bg-black' : 'bg-white'} px-4 py-4 flex-row justify-between items-center`}
                style={{ height: 80 }}>
                <TouchableOpacity
                    onPress={handleCancel}
                    disabled={cancelling}
                    className="px-8 py-3 border border-[#F00020] rounded-lg"
                >
                    {cancelling ? (
                        <ActivityIndicator size="small" color="#F00020" />
                    ) : (
                        <Text className="text-[#F00020] font-bold">Annuler</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className={`px-8 py-3 ${isDarkMode ? 'bg-[#1A6EDE]' : 'bg-[#065C98]'} rounded-lg`}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text className="text-white font-bold">Enregistrer</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ModifActivityOverview;
