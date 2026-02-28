import React, { useState, useRef, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, Pressable } from "react-native";
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

//TODO MapView => Google

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    ActivityOverview: undefined;
    ProfilPersonOverview: undefined,
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get("window");


const HomeMap: React.FC = () => {
    const [likedEvents, setLikedEvents] = useState<{ [key: number]: boolean }>({});
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const [modalShareVisible, setModalShareVisible] = useState(false);
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();



    const events = [
        {
            id: 1,
            title: "Soirée à B&CO",
            date: "Dim. 12 oct. - 08:45",
            location: "Versailles (12km)",
            category: "game",
            image: require("../../img/billard-exemple.jpg"),
            participants: "1/10",
            userInitials: "EL",
            latitude: 48.8566,
            longitude: 2.3522,
        },
        {
            id: 2,
            title: "Soirée Électro",
            date: "Ven. 18 oct. - 22:00",
            location: "Paris (5km)",
            category: "out",
            image: require("../../img/billard-exemple.jpg"),
            participants: "4/15",
            userInitials: "AL",
            latitude: 48.86,
            longitude: 2.34,
        },
        {
            id: 3,
            title: "Soirée VIP Club",
            date: "Sam. 21 oct. - 21:30",
            location: "Neuilly-sur-Seine (8km)",
            category: "sport",
            image: require("../../img/billard-exemple.jpg"),
            participants: "7/20",
            userInitials: "JD",
            latitude: 48.85,
            longitude: 2.35,
        },
    ];

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case "game":
                return "Jeux";
            case "out":
                return "Sorties";
            case "sport":
                return "Sports";
            default:
                return category;
        }
    };

    const toggleLike = (id: number) => {
        setLikedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleMarkerPress = (id: number) => {
        setSelectedEventId(id);
        const index = events.findIndex(event => event.id === id);
        if (scrollViewRef.current) {
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
                console.error("Erreur de géolocalisation :", error);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };


    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    const handleScroll = (event: any) => {
        const scrollX = event.nativeEvent.contentOffset.x;
        const cardWidth = width * 0.8;
        const index = Math.round(scrollX / cardWidth);
        const visibleEvent = events[index];
        if (visibleEvent && visibleEvent.id !== selectedEventId) {
            setSelectedEventId(visibleEvent.id);
        }
    };

    const [heading, setHeading] = useState(0);

    function calculateHeading({ x, y }: { x: number; y: number }) {
        if (x === 0 && y === 0) return 0; // évite division par zéro
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        angle += 90;
        if (angle < 0) angle += 360;
        return angle;
    }


    useEffect(() => {
        let subscription: any;

        try {
            setUpdateIntervalForType(SensorTypes.magnetometer, 300);

            subscription = magnetometer.subscribe(
                (data: { x: number; y: number; z: number }) => {
                    const heading = calculateHeading(data);
                    setHeading(heading);
                },
                (error) => {
                    console.warn("❌ Magnetometer not available or failed:", error.message || error);
                }
            );
        } catch (error) {
            console.warn("❌ Failed to subscribe to magnetometer:", error);
        }

        return () => {
            if (subscription && !subscription.closed) {
                subscription.unsubscribe();
            }
        };
    }, []);

    return (
        <View className="flex-1">
            <ShareModal visible={modalShareVisible} onClose={() => setModalShareVisible(false)} />
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
                initialRegion={{
                    latitude: 48.8566,
                    longitude: 2.3522,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
            >
                {events.map((event) => (
                    <Marker
                        key={event.id}
                        coordinate={{ latitude: event.latitude, longitude: event.longitude }}
                        onPress={() => handleMarkerPress(event.id)}
                        anchor={{ x: 0.5, y: 1 }} // ✅ FIXE LE DÉCALAGE
                    >
                        <Image
                            source={
                                selectedEventId === event.id
                                    ? require("../../img/pin-selected.png")
                                    : require("../../img/pin.png")
                            }
                            style={{
                                width: 30,
                                height: 30,
                                tintColor: event.category === "game"
                                    ? "red"
                                    : event.category === "out"
                                        ? "purple"
                                        : event.category === "sport"
                                            ? "blue"
                                            : "gray"
                            }}
                            resizeMode="contain"
                        />
                    </Marker>
                ))}

                {userLocation && (
                    <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            {/* Faisceau directionnel */}
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

                            {/* Cercle central bleu */}
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

            <ScrollView
                ref={scrollViewRef}
                onScroll={handleScroll}
                horizontal
                showsHorizontalScrollIndicator={false}
                className="absolute bottom-1 left-0 right-0 px-3"
                contentContainerStyle={{ paddingHorizontal: width * 0.1 }}
                scrollEventThrottle={16} // pour une détection fluide
            >
                {events.map((event) => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate("ActivityOverview")}
                        key={event.id}
                        className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} rounded-xl shadow-lg mx-11`}
                        style={{
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.2,
                            shadowRadius: 5,
                            elevation: 5,
                            width: 230, // Largeur de l'élément
                        }}
                    >
                        <View className="relative">
                            <Image
                                source={event.image}
                                style={{
                                    width: "100%", // Largeur max
                                    height: 80, // Ajuster selon le besoin
                                    borderTopLeftRadius: 12,
                                    borderTopRightRadius: 12,
                                }}
                            />
                            <TouchableOpacity onPress={() => navigation.navigate("ProfilPersonOverview")} className="absolute top-2 left-2 bg-blue-500 rounded-full h-12 w-12 flex items-center justify-center">
                                <Text className={`text-white font-semibold`}>{event.userInitials}</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="p-3">
                            <Text className={`font-semibold text-lg ${isDarkMode ? "text-white" : "text-black"} text-sm`}>
                                {event.title}
                            </Text>
                            <Text className={`${isDarkMode ? "text-white" : "text-black"} text-sm`}>{event.date}</Text>
                            <Text className={`${isDarkMode ? "text-white" : "text-black"} text-sm`}>{event.location}</Text>

                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-wrap">
                                    <MaterialIcons
                                        name="place"
                                        size={16}
                                        color={
                                            event.category === "game"
                                                ? "red"
                                                : event.category === "out"
                                                    ? "purple"
                                                    : event.category === "sport"
                                                        ? "blue"
                                                        : "gray"
                                        }
                                    />
                                    <Text
                                        className={`${isDarkMode ? "text-white" : "text-black"
                                            } font-semibold ml-1 text-xs`}
                                    >
                                        {getCategoryLabel(event.category)}
                                    </Text>

                                    <Image
                                        source={require("../../img/people.png")}
                                        style={{ tintColor: isDarkMode ? "white" : "black" }}
                                        className={`h-5 w-5 ml-4 ${isDarkMode ? "relative top-1" : ""}`}
                                    />
                                    <Text
                                        className={`${isDarkMode ? "text-white" : "text-black"
                                            } ml-1 text-xs`}
                                    >
                                        {event.participants}
                                    </Text>
                                </View>

                                <View className="flex-row items-center">
                                    <Pressable
                                        onPress={() => toggleLike(event.id)}
                                        className={`ml-2 flex-row items-center ${isDarkMode ? "bg-black" : "bg-[#F3F3F3]"
                                            } rounded-xl p-2`}
                                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                                    >
                                        <MaterialIcons
                                            name={likedEvents[event.id] ? "favorite" : "favorite-border"}
                                            size={13}
                                            color={likedEvents[event.id] ? "red" : isDarkMode ? "white" : "black"}
                                        />
                                        <Text
                                            className={`${isDarkMode ? "text-white" : "text-black"
                                                } text-xs`}
                                            style={{ minWidth: 16, textAlign: "center" }}
                                        >
                                            {likedEvents[event.id] ? "1" : "0"}
                                        </Text>
                                    </Pressable>

                                    <TouchableOpacity
                                        onPress={() => setModalShareVisible(true)}
                                        className={`${isDarkMode ? "bg-black" : "bg-[#F3F3F3]"
                                            } rounded-xl p-[0.7rem] ml-2`}
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
                ))}
            </ScrollView>

        </View>
    );
};

export default HomeMap;