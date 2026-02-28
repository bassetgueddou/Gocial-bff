import React, { useState, useRef } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useTheme } from "../ThemeContext";
import EventCardVisio from "./EventCardVisio";
import LinearGradient from "react-native-linear-gradient";
import FilterBar from "./FilterBar";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import ShareModal from "./ShareModal";
import { useActivities } from "../../src/hooks/useActivities";
import { API_URL } from "../../src/config";

type RootStackParamList = {
    ActivityOverview: undefined;
    ProfilPersonOverview: undefined;
};
type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get("window");

const formatDate = (iso: string) => {
    const d = new Date(iso);
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${days[d.getDay()]}. ${d.getDate()} ${months[d.getMonth()]}. - ${hh}:${mm}`;
};

const getInitials = (first?: string, last?: string) => {
    const f = (first || '?')[0].toUpperCase();
    const l = (last || '?')[0].toUpperCase();
    return `${f}${l}`;
};

const HomeVisio: React.FC = () => {
    const scrollViewRef = useRef<ScrollView>(null);
    const [modalShareVisible, setModalShareVisible] = useState(false);
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const { activities, topActivities, loading, refreshing, error, refresh, toggleLike } = useActivities({ mode: 'visio' });

    const fallbackImage = require("../../img/billard-exemple.jpg");

    if (loading && activities.length === 0) {
        return (
            <View className={`${isDarkMode ? "bg-black" : "bg-white"} flex-1 justify-center items-center`}>
                <ActivityIndicator size="large" color="#065C98" />
                <Text className={`${isDarkMode ? "text-white" : "text-black"} mt-4`}>Chargement...</Text>
            </View>
        );
    }

    if (error && activities.length === 0) {
        return (
            <View className={`${isDarkMode ? "bg-black" : "bg-white"} flex-1 justify-center items-center px-6`}>
                <MaterialIcons name="cloud-off" size={48} color={isDarkMode ? "white" : "gray"} />
                <Text className={`${isDarkMode ? "text-white" : "text-black"} mt-4 text-center`}>{error}</Text>
                <TouchableOpacity onPress={refresh} className="mt-4 bg-[#065C98] px-6 py-3 rounded-full">
                    <Text className="text-white font-medium">Réessayer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className={`${isDarkMode ? "bg-black" : "bg-white"} flex-1`}>
            <ShareModal visible={modalShareVisible} onClose={() => setModalShareVisible(false)} />
            <FilterBar excludeFilters={["what"]} />

            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#065C98" />}
            >
                {topActivities.length > 0 && (
                    <>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"} text-xl my-4 ml-4`}>Top 3 des activités ! 🔥</Text>

                        <ScrollView
                            ref={scrollViewRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="px-3"
                            contentContainerStyle={{
                                paddingHorizontal: width * 0.1, marginBottom: 10,
                            }}
                        >
                            {topActivities.map((event) => {
                                const imageSource = event.image_url
                                    ? { uri: `${API_URL}${event.image_url}` }
                                    : fallbackImage;
                                const initials = event.host
                                    ? getInitials(event.host.first_name, event.host.last_name)
                                    : '??';

                                return (
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate("ActivityOverview")}
                                        key={event.id}
                                        className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} rounded-xl shadow-lg mx-2`}
                                        style={{
                                            shadowOffset: { width: 0, height: 3 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 5,
                                            elevation: 5,
                                            width: 260,
                                            height: 210,
                                            alignSelf: 'flex-start',
                                        }}
                                    >
                                        <View className="relative">
                                            <Image
                                                source={imageSource}
                                                style={{
                                                    width: "100%",
                                                    height: 100,
                                                    borderTopLeftRadius: 12,
                                                    borderTopRightRadius: 12,
                                                }}
                                            />
                                            <TouchableOpacity onPress={() => navigation.navigate("ProfilPersonOverview")} className="absolute top-2 left-2 bg-blue-500 rounded-full h-10 w-10 flex items-center justify-center">
                                                <Text className="text-white font-semibold">{initials}</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View className="p-3">
                                            <Text className={`font-semibold text-base ${isDarkMode ? "text-white" : "text-black"}`}>{event.title}</Text>
                                            <Text className={`text-sm ${isDarkMode ? "text-white" : "text-black"}`}>{formatDate(event.date)}</Text>
                                            <View className="flex-row items-center mt-1">
                                                <Image source={require("../../img/videoconference.png")} className="h-4 w-4" />
                                                <Text className={`text-sm ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>Visio</Text>
                                            </View>

                                            <View className="flex-row items-center mt-2">
                                                <MaterialIcons
                                                    name="place"
                                                    size={14}
                                                    color={
                                                        event.category === "Jeu" ? "red" :
                                                            event.category === "Sortie" ? "purple" :
                                                                event.category === "Sport" ? "blue" : "gray"
                                                    }
                                                />
                                                <Text className={`text-xs ${isDarkMode ? "text-white" : "text-black"} font-semibold ml-1`}>{event.category}</Text>

                                                <Image
                                                    source={require("../../img/people.png")}
                                                    style={{ tintColor: isDarkMode ? "white" : "black" }}
                                                    className="h-4 w-4 ml-4"
                                                />
                                                <Text className={`text-xs ${isDarkMode ? "text-white" : "text-black"} ml-1`}>{event.current_participants}/{event.max_participants}</Text>

                                                <Pressable
                                                    onPress={() => toggleLike(event.id)}
                                                    className={`ml-auto flex-row items-center ${isDarkMode ? "bg-black" : "bg-[#F3F3F3]"} rounded-xl p-2`}
                                                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                                                >
                                                    <MaterialIcons
                                                        name={event.is_liked ? "favorite" : "favorite-border"}
                                                        size={11}
                                                        color={event.is_liked ? "red" : isDarkMode ? "white" : "black"}
                                                    />
                                                    <Text className={`text-xs ${isDarkMode ? "text-white" : "text-black"}`} style={{ minWidth: 16, textAlign: "center" }}>
                                                        {event.likes_count || 0}
                                                    </Text>
                                                </Pressable>

                                                <TouchableOpacity onPress={() => setModalShareVisible(true)} className={`${isDarkMode ? "bg-black" : "bg-[#F3F3F3]"} rounded-xl p-[0.7rem] ml-1`}>
                                                    <FontAwesome name="share" size={11} color={isDarkMode ? "white" : "black"} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </>
                )}

                <View className="mt-2">
                    <LinearGradient
                        colors={["#004C82", "#065C98"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ justifyContent: "center", alignItems: "center", height: 40 }}
                    >
                        <Text className="text-white text-base font-medium">
                            En ce moment. Aujourd'hui.
                        </Text>
                    </LinearGradient>
                    {activities.length === 0 ? (
                        <View className="py-12 items-center">
                            <Text className={`${isDarkMode ? "text-white" : "text-gray-500"} text-base`}>
                                Aucune activité visio pour le moment
                            </Text>
                        </View>
                    ) : (
                        <ScrollView>
                            {activities.map((event) => (
                                <EventCardVisio
                                    key={event.id}
                                    id={event.id}
                                    title={event.title}
                                    date={formatDate(event.date)}
                                    category={event.category}
                                    image={event.image_url ? { uri: `${API_URL}${event.image_url}` } : fallbackImage}
                                    currentParticipants={event.current_participants}
                                    totalParticipants={event.max_participants}
                                    userInitials={event.host ? getInitials(event.host.first_name, event.host.last_name) : '??'}
                                />
                            ))}
                        </ScrollView>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default HomeVisio;
