import React, { useState, useRef, useEffect, useMemo } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, Pressable, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useTheme } from "../ThemeContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import ShareModal from "./ShareModal";
import Geolocation from '@react-native-community/geolocation';
import { magnetometer, SensorTypes, setUpdateIntervalForType } from 'react-native-sensors';
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { useActivities } from "../../src/hooks/useActivities";
import { useFilters } from "../../src/contexts/FilterContext";
import { API_URL } from "../../src/config";
import type { Activity } from "../../src/types";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    ActivityOverview: { activityId: number };
    ProfilPersonOverview: { userId: number };
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get("window");

const formatDate = (iso: string) => {
    const d = new Date(iso);
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['jan', 'f\u00e9v', 'mar', 'avr', 'mai', 'juin', 'juil', 'ao\u00fbt', 'sep', 'oct', 'nov', 'd\u00e9c'];
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${days[d.getDay()]}. ${d.getDate()} ${months[d.getMonth()]} - ${hh}:${mm}`;
};

const getCategoryLabel = (category: string | null) => {
    switch (category) {
        case "game":
            return "Jeux";
        case "out":
            return "Sorties";
        case "sport":
            return "Sports";
        case "culture":
            return "Culture";
        default:
            return category || "Autre";
    }
};

const getCategoryColor = (category: string | null) => {
    switch (category) {
        case "game":
            return "red";
        case "out":
            return "purple";
        case "sport":
            return "blue";
        case "culture":
            return "orange";
        default:
            return "gray";
    }
};

const HomeMap: React.FC = () => {
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [shareActivity, setShareActivity] = useState<Activity | undefined>(undefined);
    const [modalShareVisible, setModalShareVisible] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const { filters } = useFilters();
    const { activities, loading, toggleLike } = useActivities({ filters });

    // Filter activities that have coordinates
    const mapActivities = useMemo(
        () => activities.filter((a) => a.latitude != null && a.longitude != null),
        [activities]
    );

    const handleMarkerPress = (id: number) => {
        setSelectedEventId(id);
        const index = mapActivities.findIndex(a => a.id === id);
        if (scrollViewRef.current && index >= 0) {
            scrollViewRef.current.scrollTo({ x: index * (width * 0.8), animated: true });
        }
    };

    const mapRef = useRef<MapView>(null);

    const recenterToUserLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });
                mapRef.current?.animateToRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }, 1000);
            },
            (error) => {
                console.error("Erreur de g\u00e9olocalisation :", error);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
        const scrollX = event.nativeEvent.contentOffset.x;
        const cardWidth = width * 0.8;
        const index = Math.round(scrollX / cardWidth);
        const visibleEvent = mapActivities[index];
        if (visibleEvent && visibleEvent.id !== selectedEventId) {
            setSelectedEventId(visibleEvent.id);
        }
    };

    const [heading, setHeading] = useState(0);

    function calculateHeading({ x, y }: { x: number; y: number }) {
        if (x === 0 && y === 0) return 0;
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        angle += 90;
        if (angle < 0) angle += 360;
        return angle;
    }

    useEffect(() => {
        let subscription: { closed?: boolean; unsubscribe: () => void } | undefined;
        let mounted = true;

        try {
            setUpdateIntervalForType(SensorTypes.magnetometer, 300);

            subscription = magnetometer.subscribe(
                (data: { x: number; y: number; z: number }) => {
                    if (!mounted) return;
                    try {
                        const h = calculateHeading(data);
                        setHeading(h);
                    } catch {
                        // Ignore calculation errors
                    }
                },
                () => {
                    // Magnetometer not available (emulator) — silently ignore
                }
            );
        } catch {
            // Sensor not supported on this device — no-op
        }

        return () => {
            mounted = false;
            try {
                if (subscription && !subscription.closed) {
                    subscription.unsubscribe();
                }
            } catch {
                // Cleanup error — ignore
            }
        };
    }, []);

    const getHostInitials = (activity: Activity) => {
        const host = activity.host;
        if (!host) return "?";
        const f = (host.first_name || host.pseudo || "")[0] || "";
        const l = (host.last_name || "")[0] || "";
        return (f + l).toUpperCase() || "?";
    };

    const openShare = (activity: Activity) => {
        setShareActivity(activity);
        setModalShareVisible(true);
    };

    // Compute initial region from activities or default to Paris
    const initialRegion = useMemo(() => {
        if (mapActivities.length > 0) {
            const first = mapActivities[0];
            return {
                latitude: first.latitude!,
                longitude: first.longitude!,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            };
        }
        return {
            latitude: 48.8566,
            longitude: 2.3522,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
        };
    }, [mapActivities]);

    return (
        <View className="flex-1">
            <ShareModal visible={modalShareVisible} onClose={() => setModalShareVisible(false)} activity={shareActivity} />
            <TouchableOpacity
                onPress={recenterToUserLocation}
                className="absolute top-10 right-5 bg-white p-3 rounded-full shadow"
                style={{ elevation: 5, zIndex: 10 }}
            >
                <MaterialIcons name="my-location" size={24} color="#065C98" />
            </TouchableOpacity>

            <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                initialRegion={initialRegion}
            >
                {mapActivities.map((activity) => (
                    <Marker
                        key={activity.id}
                        coordinate={{ latitude: activity.latitude!, longitude: activity.longitude! }}
                        onPress={() => handleMarkerPress(activity.id)}
                        anchor={{ x: 0.5, y: 1 }}
                    >
                        <Image
                            source={
                                selectedEventId === activity.id
                                    ? require("../../img/pin-selected.png")
                                    : require("../../img/pin.png")
                            }
                            style={{
                                width: 30,
                                height: 30,
                                tintColor: getCategoryColor(activity.category),
                            }}
                            resizeMode="contain"
                        />
                    </Marker>
                ))}

                {userLocation && (
                    <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Svg
                                width={60}
                                height={60}
                                style={{
                                    position: 'absolute',
                                    transform: [{ rotate: `${heading}deg` }],
                                    zIndex: 1,
                                }}
                            >
                                <Defs>
                                    <LinearGradient id="beamGradient" x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor="#004eb5" stopOpacity="1" />
                                        <Stop offset="1" stopColor="#1a6ad4" stopOpacity="0" />
                                    </LinearGradient>
                                </Defs>
                                <Path
                                    d="M30,22 L50,60 L10,60 Z"
                                    fill="url(#beamGradient)"
                                />
                            </Svg>

                            <View
                                style={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: 8,
                                    backgroundColor: '#1A73E8',
                                    borderColor: 'white',
                                    borderWidth: 3,
                                    zIndex: 2,
                                }}
                            />
                        </View>
                    </Marker>
                )}
            </MapView>

            {loading ? (
                <View className="absolute bottom-10 self-center">
                    <ActivityIndicator size="large" color="#065C98" />
                </View>
            ) : mapActivities.length === 0 ? (
                <View className="absolute bottom-10 self-center px-4 py-2 rounded-xl bg-white shadow">
                    <Text className="text-gray-500">Aucune activit{"\u00e9"} avec localisation</Text>
                </View>
            ) : (
                <ScrollView
                    ref={scrollViewRef}
                    onScroll={handleScroll}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="absolute bottom-1 left-0 right-0 px-3"
                    contentContainerStyle={{ paddingHorizontal: width * 0.1 }}
                    scrollEventThrottle={16}
                >
                    {mapActivities.map((activity) => {
                        const imageSource = activity.image_url
                            ? { uri: activity.image_url.startsWith('http') ? activity.image_url : `${API_URL}${activity.image_url}` }
                            : require("../../img/billard-exemple.jpg");

                        return (
                            <TouchableOpacity
                                onPress={() => navigation.navigate("ActivityOverview", { activityId: activity.id })}
                                key={activity.id}
                                className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} rounded-xl shadow-lg mx-11`}
                                style={{
                                    shadowOffset: { width: 0, height: 3 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 5,
                                    elevation: 5,
                                    width: 230,
                                }}
                            >
                                <View className="relative">
                                    <Image
                                        source={imageSource}
                                        style={{
                                            width: "100%",
                                            height: 80,
                                            borderTopLeftRadius: 12,
                                            borderTopRightRadius: 12,
                                        }}
                                    />
                                    <TouchableOpacity
                                        onPress={() => activity.host?.id && navigation.navigate("ProfilPersonOverview", { userId: activity.host.id })}
                                        className="absolute top-2 left-2 bg-blue-500 rounded-full h-12 w-12 flex items-center justify-center"
                                    >
                                        <Text className="text-white font-semibold">{getHostInitials(activity)}</Text>
                                    </TouchableOpacity>
                                </View>

                                <View className="p-3">
                                    <Text className={`font-semibold ${isDarkMode ? "text-white" : "text-black"} text-sm`} numberOfLines={1}>
                                        {activity.title}
                                    </Text>
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"} text-sm`}>{formatDate(activity.date)}</Text>
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"} text-sm`} numberOfLines={1}>
                                        {activity.city || activity.address || ""}
                                        {activity.distance_km != null ? ` (${Math.round(activity.distance_km)}km)` : ""}
                                    </Text>

                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center flex-wrap">
                                            <MaterialIcons
                                                name="place"
                                                size={16}
                                                color={getCategoryColor(activity.category)}
                                            />
                                            <Text
                                                className={`${isDarkMode ? "text-white" : "text-black"} font-semibold ml-1 text-xs`}
                                            >
                                                {getCategoryLabel(activity.category)}
                                            </Text>

                                            <Image
                                                source={require("../../img/people.png")}
                                                style={{ tintColor: isDarkMode ? "white" : "black" }}
                                                className={`h-5 w-5 ml-4 ${isDarkMode ? "relative top-1" : ""}`}
                                            />
                                            <Text
                                                className={`${isDarkMode ? "text-white" : "text-black"} ml-1 text-xs`}
                                            >
                                                {activity.current_participants}/{activity.max_participants}
                                            </Text>
                                        </View>

                                        <View className="flex-row items-center">
                                            <Pressable
                                                onPress={() => toggleLike(activity.id)}
                                                className={`ml-2 flex-row items-center ${isDarkMode ? "bg-black" : "bg-[#F3F3F3]"} rounded-xl p-2`}
                                                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                                            >
                                                <MaterialIcons
                                                    name={activity.is_liked ? "favorite" : "favorite-border"}
                                                    size={13}
                                                    color={activity.is_liked ? "red" : isDarkMode ? "white" : "black"}
                                                />
                                                <Text
                                                    className={`${isDarkMode ? "text-white" : "text-black"} text-xs`}
                                                    style={{ minWidth: 16, textAlign: "center" }}
                                                >
                                                    {activity.likes_count || 0}
                                                </Text>
                                            </Pressable>

                                            <TouchableOpacity
                                                onPress={() => openShare(activity)}
                                                className={`${isDarkMode ? "bg-black" : "bg-[#F3F3F3]"} rounded-xl p-[0.7rem] ml-2`}
                                            >
                                                <FontAwesome
                                                    name="share"
                                                    size={13}
                                                    color={isDarkMode ? "white" : "black"}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
};

export default HomeMap;
