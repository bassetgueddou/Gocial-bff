import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    Dimensions,
    TextInput,
    Image,
    ActivityIndicator,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from "react-native-reanimated";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../ThemeContext";
import { useFilters } from "../../src/contexts/FilterContext";
import Slider from "@react-native-community/slider";
import Geolocation from "@react-native-community/geolocation";
import Toast from "react-native-toast-message";
import type { NominatimResult } from "../../src/types";

const { width, height } = Dimensions.get("window");

interface WhereModalProps {
    visible: boolean;
    onClose: () => void;
}

const WhereModal: React.FC<WhereModalProps> = ({ visible, onClose }) => {
    const { isDarkMode } = useTheme();
    const { setLocation } = useFilters();
    const [selectedMode, setSelectedMode] = useState<"nearby" | "city">("nearby");
    const [radius, setRadius] = useState<number>(10);
    const [city, setCity] = useState<string>("");
    const [locating, setLocating] = useState(false);

    // Animation values
    const translateY = useSharedValue(0);
    const CLOSE_THRESHOLD = 150;
    const VELOCITY_THRESHOLD = 500;

    const handleCloseModal = () => {
        // Animate out and close
        translateY.value = withTiming(height, { duration: 200 }, () => {
            runOnJS(onClose)();
        });
    };

    const handleReset = () => {
        translateY.value = withSpring(0, { damping: 15, mass: 1 });
    };

    const geocodeCity = async (cityName: string): Promise<{ lat: number; lon: number } | null> => {
        try {
            const params = new URLSearchParams({
                q: cityName,
                format: 'json',
                addressdetails: '1',
                limit: '1',
                countrycodes: 'fr',
            });
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?${params.toString()}`,
                { headers: { 'User-Agent': 'Gocial-App/1.0', Accept: 'application/json' } },
            );
            const data: NominatimResult[] = await response.json();
            if (data.length > 0) {
                return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            }
            return null;
        } catch {
            return null;
        }
    };

    const handleSearch = async () => {
        setLocating(true);
        try {
            if (selectedMode === 'nearby') {
                Geolocation.getCurrentPosition(
                    (position) => {
                        setLocation(position.coords.latitude, position.coords.longitude, radius);
                        setLocating(false);
                        onClose();
                    },
                    (error) => {
                        setLocating(false);
                        let msg = 'Impossible de récupérer votre position.';
                        if (error.code === 1) {
                            msg = 'Permission de localisation refusée.';
                        } else if (error.code === 3) {
                            msg = 'Délai de localisation dépassé.';
                        }
                        Toast.show({ type: 'error', text1: msg, position: 'top', topOffset: 60 });
                    },
                    { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
                );
            } else {
                // City mode — geocode via Nominatim
                if (!city.trim()) {
                    setLocating(false);
                    Toast.show({ type: 'error', text1: 'Veuillez entrer un nom de ville.', position: 'top', topOffset: 60 });
                    return;
                }
                const coords = await geocodeCity(city.trim());
                setLocating(false);
                if (coords) {
                    setLocation(coords.lat, coords.lon, radius);
                    onClose();
                } else {
                    Toast.show({ type: 'error', text1: 'Ville introuvable.', position: 'top', topOffset: 60 });
                }
            }
        } catch {
            setLocating(false);
            Toast.show({ type: 'error', text1: 'Une erreur est survenue.', position: 'top', topOffset: 60 });
        }
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            // Limiter le mouvement vers le haut (on peut juste remonter un peu)
            if (event.translationY < -50) {
                translateY.value = -50;
            } else if (event.translationY > 0) {
                // Permettre le mouvement vers le bas
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            // Vérifier si on a atteint le seuil de fermeture (distance ou vélocité)
            if (event.translationY > CLOSE_THRESHOLD || event.velocityY > VELOCITY_THRESHOLD) {
                runOnJS(handleCloseModal)();
            } else {
                // Revenir à la position initiale
                runOnJS(handleReset)();
            }
        });

    // Style animé pour la modal
    const animatedModalStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    // Réinitialiser l'animation quand la modal s'ouvre
    React.useEffect(() => {
        if (visible) {
            translateY.value = height;
            translateY.value = withTiming(0, { duration: 500 });
        }
    }, [visible]);

    return (
        <Modal visible={visible} animationType="none" transparent>
            <GestureDetector gesture={panGesture}>
                <View className="flex-1 justify-end bg-black/50">
                    <Animated.View
                        style={[animatedModalStyle]}
                        className={`w-full h-[92%] ${isDarkMode ? "bg-black" : "bg-white"} rounded-t-2xl p-5`}
                    >
                        {/* Barre pour glisser vers le bas */}
                        <View className="items-center mb-3">
                            <View className="w-10 h-1 bg-gray-400 rounded-full" />
                        </View>

                        {/* Icône et texte */}
                        <View className="flex-row items-center justify-center mb-3 space-x-2">
                            <Image
                                source={require("../../img/marker.png")}
                                className="w-6 h-6"
                                resizeMode="contain"
                                style={{ tintColor: isDarkMode ? "white" : "black" }}
                            />
                            <Text className={`text-lg font-bold ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>Où ?</Text>
                        </View>

                        <View className="items-center w-full px-5 mt-6">
                            {/* Boutons de sélection */}
                            <View className="flex-row mb-6">
                                <TouchableOpacity
                                    className={`px-6 py-2 rounded-md mr-3 ${selectedMode === "nearby" ? isDarkMode ? "bg-[#1A6EDE]" :  "bg-[#1D4E89]" : "bg-gray-300"
                                        }`}
                                    onPress={() => setSelectedMode("nearby")}
                                >
                                    <Text className={`${selectedMode === "nearby" ? "text-white" : "text-black"}`}>
                                        Autour de moi
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className={`px-6 py-2 mr-[4rem] rounded-md ${selectedMode === "city" ? isDarkMode ? "bg-[#1A6EDE]" : "bg-[#1D4E89]" : "bg-gray-300"
                                        }`}
                                    onPress={() => setSelectedMode("city")}
                                >
                                    <Text className={`${selectedMode === "city" ? "text-white" : "text-black"}`}>Ville</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Champ de recherche visible si "Ville" est sélectionné */}
                            {selectedMode === "city" && (
                                <TextInput
                                    className={`border border-[#1D4E89] rounded-md w-full h-12 px-4 mb-6 ${isDarkMode ? "text-white" : "text-black"}`}
                                    placeholder="Rechercher une ville"
                                    placeholderTextColor="#888"
                                    value={city}
                                    onChangeText={setCity}
                                />
                            )}

                            {/* Slider de rayon */}
                            <Text className={` ${isDarkMode ? "text-white" : "text-black"} text-base mb-4`}>Dans un rayon de {radius} kms</Text>
                            <View className="w-full flex-row items-center justify-between">
                                <Text className={isDarkMode ? "text-white" : "text-black"}>0 km</Text>
                                <Slider
                                    style={{ flex: 1, marginHorizontal: 10 }}
                                    minimumValue={0}
                                    maximumValue={200}
                                    step={1}
                                    value={radius}
                                    onValueChange={(val) => setRadius(val)}
                                    minimumTrackTintColor={ isDarkMode ? "#1A6EDE" : "#1D4E89"}
                                    thumbTintColor={ isDarkMode ? "#1A6EDE" : "#1D4E89"}
                                />
                                <Text className={isDarkMode ? "text-white" : "text-black"}>200 km</Text>
                            </View>
                        </View>

                        {/* Boutons en bas */}
                        <View className={`absolute bottom-6 left-0 right-0 ${isDarkMode ? "bg-black" : "bg-white"} p-4 flex-row justify-between`}>
                            <TouchableOpacity onPress={() => {
                                setRadius(10);
                                setCity("");
                                setLocation(null, null, null);
                                onClose();
                            }} className={`border
                                px-5 py-2 rounded-lg ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"}`}>
                                <Text className={`text-base ${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"}`}>Réinitialiser</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSearch}
                                disabled={locating}
                                className={`px-5 py-2 rounded-lg flex-row items-center justify-center ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} ${locating ? "opacity-60" : ""}`}
                            >
                                {locating ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <>
                                        <MaterialIcons name="search" size={20} color="white" />
                                        <Text className="text-white text-base">Rechercher</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </GestureDetector>
        </Modal>
    );
};

export default WhereModal;
