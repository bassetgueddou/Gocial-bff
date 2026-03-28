import { View, Text, TouchableOpacity, ScrollView, Image, Pressable, ActivityIndicator, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import React, { useState, useEffect, useCallback } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import MapView, { Marker, Region } from "react-native-maps";
import ShareModal from "../Home/ShareModal";
import MoreActivityModal from "./MoreActivityModal";
import Toast from 'react-native-toast-message';
import { activityService } from "../../src/services/activities";
import { API_URL } from "../../src/config";
import type { Activity } from "../../src/types";
import { t } from "../../src/utils/translations";

type RootStackParamList = {
    ActivityOverview: { activityId: number };
    ProfilPersonOverview: { userId: number };
    ParticipationTopTabs: { activityId: number };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;
type ActivityRouteProp = RouteProp<RootStackParamList, 'ActivityOverview'>;

const formatDate = (iso: string) => {
    const d = new Date(iso);
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${days[d.getDay()]}. ${d.getDate()} ${months[d.getMonth()]}. - ${hh}:${mm}`;
};

const getInitials = (first?: string | null, last?: string | null) => {
    const f = (first || '?')[0].toUpperCase();
    const l = (last || '?')[0].toUpperCase();
    return `${f}${l}`;
};

const ActivityOverview: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ActivityRouteProp>();
    const activityId = route.params?.activityId;

    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalShareVisible, setModalShareVisible] = useState(false);
    const [moreActivityModalVisible, setMoreActivityModalVisible] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [participationStatus, setParticipationStatus] = useState<string | null>(null);
    const [participationLoading, setParticipationLoading] = useState(false);

    const fetchActivity = useCallback(async () => {
        if (!activityId) return;
        try {
            setLoading(true);
            setError(null);
            const data = await activityService.getActivity(activityId);
            const act: Activity = (data as any).activity || (data as any);
            setActivity(act);
            setLiked(act.is_liked || false);
            setLikesCount(act.likes_count || 0);
            setParticipationStatus(act.my_participation?.status || null);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Impossible de charger l'activité.");
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

    const handleParticipation = async () => {
        if (!activity || participationLoading || !activityId) return;
        setParticipationLoading(true);
        try {
            if (participationStatus === 'validated' || participationStatus === 'pending') {
                await activityService.cancelParticipation(activityId);
                setParticipationStatus(null);
                Toast.show({ type: 'error', text1: 'Participation annulée', text2: 'Tu ne participes plus à cet évènement.', position: 'top', topOffset: 60 });
            } else {
                const result = await activityService.requestParticipation(activityId);
                setParticipationStatus(result.status);
                Toast.show({
                    type: 'success',
                    text1: result.status === 'pending' ? 'Demande envoyée' : 'Participation confirmée',
                    text2: result.status === 'pending' ? "Tu es maintenant en liste d'attente." : 'Tu participes maintenant à cet évènement.',
                    position: 'top', topOffset: 60,
                });
            }
            fetchActivity();
        } catch (err: any) {
            Toast.show({ type: 'error', text1: 'Erreur', text2: err?.response?.data?.error || 'Une erreur est survenue.', position: 'top', topOffset: 60 });
        } finally {
            setParticipationLoading(false);
        }
    };

    if (loading) {
        return (
            <View className={`${isDarkMode ? "bg-black" : "bg-white"} flex-1 justify-center items-center`}>
                <ActivityIndicator size="large" color="#065C98" />
                <Text className={`${isDarkMode ? "text-white" : "text-black"} mt-4`}>Chargement...</Text>
            </View>
        );
    }

    if (error || !activity) {
        return (
            <View className={`${isDarkMode ? "bg-black" : "bg-white"} flex-1 justify-center items-center px-6`}>
                <MaterialIcons name="cloud-off" size={48} color={isDarkMode ? "white" : "gray"} />
                <Text className={`${isDarkMode ? "text-white" : "text-black"} mt-4 text-center`}>{error || "Activité introuvable"}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-[#065C98] px-6 py-3 rounded-full">
                    <Text className="text-white font-medium">Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const imageSource = activity.image_url ? { uri: `${API_URL}${activity.image_url}` } : require("../../img/billard-exemple.jpg");
    const hostInitials = activity.host ? getInitials(activity.host.first_name, activity.host.last_name) : '??';
    const hasCoords = activity.latitude && activity.longitude;
    const initialRegion: Region | undefined = hasCoords ? { latitude: activity.latitude!, longitude: activity.longitude!, latitudeDelta: 0.01, longitudeDelta: 0.01 } : undefined;

    const infoData = [
        { label: "Type d'activité", value: activity.category || t.activityType(activity.activity_type) },
        { label: "Âge des participants", value: `${activity.min_age || 18}-${activity.max_age || 99}` },
        { label: "Types de participants", value: t.genderRestriction(activity.gender_restriction) },
        { label: "Visibilité", value: t.visibility(activity.visibility) },
        { label: "Validation des participants", value: t.validationType(activity.validation_type) },
        { label: "Statut", value: t.activityStatus(activity.status) },
    ];

    const isParticipating = participationStatus === 'validated' || participationStatus === 'pending';
    const participantsList = activity.participants || [];

    return (
        <View className="flex-1">
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <ShareModal visible={modalShareVisible} onClose={() => setModalShareVisible(false)} />
                <MoreActivityModal visible={moreActivityModalVisible} onClose={() => setMoreActivityModalVisible(false)} />
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setMoreActivityModalVisible(true)}>
                        <MaterialIcons name="more-horiz" size={28} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView className={`${isDarkMode ? "bg-black" : "bg-white"} min-h-screen`} contentContainerStyle={{ paddingBottom: 300 }}>
                {/* Main image + host avatar */}
                <View className="relative">
                    <Image source={imageSource} className="w-full h-48" />
                    {activity.host && (
                        <TouchableOpacity
                            onPress={() => activity.host?.id && (navigation as any).navigate("ProfilPersonOverview", { userId: activity.host.id })}
                            className="absolute -bottom-6 left-4 rounded-full bg-blue-500 w-16 h-16 items-center justify-center"
                        >
                            {activity.host.avatar_url ? (
                                <Image source={{ uri: `${API_URL}${activity.host.avatar_url}` }} className="w-16 h-16 rounded-full" />
                            ) : (
                                <Text className="text-white font-bold text-lg">{hostInitials}</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Title + Date */}
                <View className="mt-8 items-center">
                    <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold text-lg text-center`}>{activity.title}</Text>
                    <Text className={`${isDarkMode ? "text-white" : "text-black"} text-base mt-1`}>{formatDate(activity.date)}</Text>
                </View>

                {/* City + participants count */}
                <View className="flex-row items-start justify-center px-12 mt-4">
                    {activity.city && (
                        <TouchableOpacity className={`items-center border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg mr-6`}>
                            <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{activity.city}</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity className={`items-center border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg`}>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{activity.current_participants}/{activity.max_participants}</Text>
                    </TouchableOpacity>
                </View>

                {/* Like + Share */}
                <View className="flex-row justify-end gap-x-1 mt-2 pr-2">
                    <Pressable onPress={handleLike} className={`w-[10%] flex-row items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"} rounded-xl p-2`} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
                        <MaterialIcons name={liked ? "favorite" : "favorite-border"} size={13} color={liked ? "red" : isDarkMode ? "white" : "black"} />
                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`} style={{ minWidth: 16, textAlign: "center" }}>{likesCount}</Text>
                    </Pressable>
                    <TouchableOpacity onPress={() => setModalShareVisible(true)} className={`w-[12%] items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"} rounded-xl p-[0.7rem]`}>
                        <FontAwesome name="share" size={13} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>

                {/* Participants */}
                <View className={`p-4 ${isDarkMode ? "bg-black" : "bg-white"}`}>
                    <Text className={`text-base mb-2 ${isDarkMode ? "text-white" : ""}`}>
                        {activity.current_participants}/{activity.max_participants} Participant{activity.current_participants !== 1 ? 's' : ''}
                        {activity.spots_left !== undefined && <Text> ({activity.spots_left} places restantes)</Text>}
                    </Text>
                    <View className="flex-row mb-2">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {participantsList.map((p, i) => (
                                <TouchableOpacity key={i} onPress={() => p.user?.id && (navigation as any).navigate("ProfilPersonOverview", { userId: p.user.id })} className="mr-2">
                                    {p.user?.avatar_url ? (
                                        <Image source={{ uri: `${API_URL}${p.user.avatar_url}` }} className="w-10 h-10 rounded-full" />
                                    ) : (
                                        <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center">
                                            <Text className="text-white text-xs">{getInitials(p.user?.first_name, p.user?.last_name)}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity onPress={() => activityId && navigation.navigate("ParticipationTopTabs", { activityId })} className={`ml-2 w-10 h-10 rounded-full ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} justify-center items-center`}>
                            <MaterialIcons name="arrow-forward-ios" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Description */}
                {activity.description && (
                    <View className="mt-2 w-full mb-4">
                        <View className="flex-row items-center justify-between px-4 mb-2">
                            <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>Description</Text>
                        </View>
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{activity.description}</Text>
                        </View>
                    </View>
                )}

                {/* Map */}
                {hasCoords && initialRegion && (
                    <View className="h-60 w-full mt-2">
                        <MapView style={{ flex: 1 }} initialRegion={initialRegion}>
                            <Marker coordinate={{ latitude: activity.latitude!, longitude: activity.longitude! }}>
                                <View className="items-center">
                                    <View className="bg-white p-2 rounded-lg shadow-md mb-0">
                                        <Text className="font-semibold text-xs text-black">{activity.address || activity.city || 'Lieu'}</Text>
                                    </View>
                                    <MaterialIcons name="location-pin" size={30} color="#C3AE79" />
                                </View>
                            </Marker>
                        </MapView>
                    </View>
                )}

                {/* Visio link */}
                {activity.activity_type === 'visio' && (
                    <View className={`px-4 py-4 ${isDarkMode ? "bg-black" : "bg-white"}`}>
                        <Text className={`font-bold text-lg mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>Lien Visio</Text>
                        <TouchableOpacity
                            className="bg-[#065C98] rounded-lg px-4 py-3 items-center"
                            onPress={() => {
                                if (activity.visio_url) {
                                    Linking.openURL(activity.visio_url);
                                } else {
                                    Toast.show({ type: 'error', text1: 'Aucun lien de visioconférence disponible', position: 'top', topOffset: 60 });
                                }
                            }}
                        >
                            <Text className="text-white font-medium">Rejoindre la visio</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Info details */}
                <View className="mt-6 w-full">
                    <View className="flex-row items-center justify-between px-4 mb-2">
                        <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>En savoir plus</Text>
                    </View>
                    <View className={`${isDarkMode ? "bg-black" : "bg-white"} rounded-lg`}>
                        {infoData.map((item, index) => (
                            <View key={index} className="mt-2">
                                <View className={`flex-row justify-between items-center py-3 px-4 ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} rounded-lg`}>
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{item.label}</Text>
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{item.value}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom bar: Message + Participate */}
            {!activity.viewer_info?.is_host && (
                <View className={`absolute bottom-0 left-0 right-0 ${isDarkMode ? 'bg-black' : 'bg-white'} px-4 py-4 flex-row justify-between items-center`} style={{ height: 80 }}>
                    <TouchableOpacity
                        onPress={() => activity.host?.id && (navigation as any).navigate("TypeMessageView", { partnerId: activity.host.id, partnerName: activity.host.first_name || activity.host.pseudo || 'Hôte' })}
                        className={`px-8 py-3 border ${isDarkMode ? 'border-[#1A6EDE]' : 'border-[#065C98]'} rounded-lg`}
                    >
                        <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"} font-bold`}>Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleParticipation} disabled={participationLoading} className={`px-8 py-3 ${isParticipating ? 'bg-[#FF4D4D]' : isDarkMode ? 'bg-[#1A6EDE]' : 'bg-[#065C98]'} rounded-lg`}>
                        <Text className="text-white font-bold">
                            {participationLoading ? '...' : participationStatus === 'pending' ? 'En attente' : isParticipating ? 'Annuler' : 'Participer'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

export default ActivityOverview;
