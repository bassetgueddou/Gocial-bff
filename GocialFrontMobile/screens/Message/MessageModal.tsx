import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image,
    Dimensions,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from "react-native-reanimated";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../ThemeContext";
import Premium from "../Notification/Premium";
import TypeMessageView from "./TypeMessageView";
import RequestMessageView from "./RequestMessageView";
import NewMessageView from "./NewMessageView";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useMessages } from "../../src/hooks/useMessages";
import dayjs from "dayjs";

type RootStackParamList = {
    PremiumOfferPerson: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get("window");

interface MessageModalProps {
    visible: boolean;
    onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ visible, onClose }) => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { conversations, unreadCount, loading, refresh, markAsRead } = useMessages();

    const [selectedPartner, setSelectedPartner] = useState<{ id: number; name: string; initials: string } | null>(null);
    const [isRequestMessageViewVisible, setIsRequestMessageViewVisible] = useState(false);
    const [isNewMessageViewVisible, setIsNewMessageViewVisible] = useState(false);

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
        translateY.value = withTiming(0, { duration: 300 });
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

    const getInitials = (conv: any) => {
        const p = conv.partner || conv;
        const f = (p.first_name || p.pseudo || "")[0] || "";
        const l = (p.last_name || "")[0] || "";
        return (f + l).toUpperCase() || "?";
    };

    const getPartnerName = (conv: any) => {
        const p = conv.partner || conv;
        return p.pseudo || `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Utilisateur";
    };

    const formatDate = (dateStr: string) => {
        const d = dayjs(dateStr);
        const today = dayjs();
        if (d.isSame(today, "day")) return d.format("HH:mm");
        if (d.isSame(today, "year")) return d.format("D MMM");
        return d.format("DD/MM/YYYY");
    };

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
                <View className="flex-1 justify-end">
                    <Animated.View
                        style={[animatedModalStyle]}
                        className={`w-full h-[88%] ${isDarkMode ? "bg-black" : "bg-white"} rounded-t-2xl p-5`}>
                        {isRequestMessageViewVisible ? (
                            <RequestMessageView onClose={() => setIsRequestMessageViewVisible(false)} />
                        ) : selectedPartner ? (
                            <TypeMessageView
                                partnerId={selectedPartner.id}
                                partnerName={selectedPartner.name}
                                partnerInitials={selectedPartner.initials}
                                onClose={() => { setSelectedPartner(null); refresh(); }}
                            />
                        ) : isNewMessageViewVisible ? (
                            <NewMessageView
                                onClose={() => setIsNewMessageViewVisible(false)}
                                onSelectUser={(userId, name, initials) => {
                                    setIsNewMessageViewVisible(false);
                                    setSelectedPartner({ id: userId, name, initials });
                                }}
                            />
                        ) : (
                            <>
                                <View className="flex-row justify-center">
                                    <TouchableOpacity onPress={onClose} className="relative right-[9.2rem]">
                                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                                    </TouchableOpacity>
                                    <View className="flex-row items-center justify-center space-x-2">
                                        <Text className={`text-lg font-bold ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>Messages</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setIsNewMessageViewVisible(true)} className="relative left-[8.5rem]">
                                        <MaterialIcons name="person-add" size={25} color={isDarkMode ? "white" : "black"} />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity onPress={() => setIsRequestMessageViewVisible(true)} className={`self-end px-3 py-1 rounded-md border ${isDarkMode ? "bg-[#1A6EDE]" : "border-gray-400 bg-blue-300"} my-4`}>
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"} text-sm font-medium`}>Demandes</Text>
                                </TouchableOpacity>

                                <Premium
                                    onPress={() => {
                                        onClose();
                                        navigation.navigate("PremiumOfferPerson");
                                    }}
                                />

                                {loading ? (
                                    <View className="flex-1 items-center justify-center">
                                        <ActivityIndicator size="large" color="#065C98" />
                                    </View>
                                ) : (
                                    <FlatList
                                        className="mt-3"
                                        data={conversations}
                                        keyExtractor={(item: any) => String(item.id || item.partner?.id || Math.random())}
                                        renderItem={({ item }) => {
                                            const partner = item.partner || item;
                                            const name = getPartnerName(item);
                                            const init = getInitials(item);
                                            const lastMsg = item.last_message?.content || "";
                                            const lastDate = item.last_message?.sent_at || item.updated_at || "";
                                            const unread = item.unread_count > 0;

                                            return (
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setSelectedPartner({ id: partner.id, name, initials: init });
                                                        if (unread) markAsRead(partner.id);
                                                    }}
                                                    className="flex-row items-center py-3 px-1"
                                                >
                                                    {partner.avatar_url ? (
                                                        <Image source={{ uri: partner.avatar_url }} className="w-12 h-12 rounded-full" />
                                                    ) : (
                                                        <View className="w-12 h-12 bg-blue-400 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                                            <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold`}>{init}</Text>
                                                        </View>
                                                    )}
                                                    <View className="flex-1 ml-3">
                                                        <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold`}>{name}</Text>
                                                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`} numberOfLines={1}>{lastMsg}</Text>
                                                    </View>
                                                    <View className="items-end">
                                                        {lastDate ? <Text className={`${isDarkMode ? "text-white" : "text-gray-500"} text-sm`}>{formatDate(lastDate)}</Text> : null}
                                                        {unread && <View className="w-3 h-3 bg-blue-600 rounded-full mt-1" />}
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        }}
                                        ListEmptyComponent={
                                            <View className="items-center justify-center py-10">
                                                <Text className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Aucune conversation</Text>
                                            </View>
                                        }
                                    />
                                )}
                            </>
                        )}
                    </Animated.View>
                </View>
            </GestureDetector>
        </Modal>
    );
};

export default MessageModal;
