import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    Dimensions,
    Pressable,
    Share,
    ActivityIndicator,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useTheme } from "../ThemeContext";
import { friendService } from "../../src/services/friends";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

interface MoreProfilModalProps {
    visible: boolean;
    onClose: () => void;
    userId?: number;
    pseudo?: string;
}


const MoreProfilModal: React.FC<MoreProfilModalProps> = ({ visible, onClose, userId, pseudo }) => {
    const { isDarkMode } = useTheme();
    const [blocking, setBlocking] = useState(false);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 100) {
                runOnJS(onClose)();
            }
        });

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Découvre le profil de ${pseudo || "cet utilisateur"} sur Gocial !`,
            });
        } catch {
            // L'utilisateur a annulé le partage
        }
    };

    const handleBlock = async () => {
        if (!userId || blocking) return;
        setBlocking(true);
        try {
            await friendService.blockUser(userId);
            Toast.show({
                type: "success",
                text1: "Utilisateur bloqué",
                position: "top",
                topOffset: 60,
            });
            onClose();
        } catch {
            Toast.show({
                type: "error",
                text1: "Erreur",
                text2: "Impossible de bloquer cet utilisateur",
                position: "top",
                topOffset: 60,
            });
        } finally {
            setBlocking(false);
        }
    };

    const handleReport = () => {
        Toast.show({
            type: "success",
            text1: "Signalement envoyé",
            position: "top",
            topOffset: 60,
        });
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <GestureDetector gesture={panGesture}>
                <Pressable onPress={onClose} className="flex-1 justify-end bg-black/50">
                    <Pressable className="absolute bottom-9 self-center w-[95%]">

                        <View className={`w-full ${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} rounded-lg shadow-lg`}>
                            <TouchableOpacity onPress={handleShare} className={`p-4 border-b ${isDarkMode ? "border-black" : "border-gray-300"}`}>
                                <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-blue-600"} text-lg text-center`}>Partager</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleBlock} disabled={blocking} className={`p-4 border-b ${isDarkMode ? "border-black" : "border-gray-300"}`}>
                                {blocking ? (
                                    <ActivityIndicator size="small" color={isDarkMode ? "#F00020" : "#EF4444"} />
                                ) : (
                                    <Text className={`${isDarkMode ? "text-[#F00020]" : "text-red-500"} text-lg text-center`}>Bloquer</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleReport} className="p-4">
                                <Text className={`${isDarkMode ? "text-[#F00020]" : "text-red-500"} text-lg text-center`}>Signaler</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="h-1" />

                        <View className={`w-full ${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} rounded-lg shadow-lg`}>
                            <TouchableOpacity onPress={onClose} className="p-4">
                                <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-blue-600"} text-lg text-center`}>Annuler</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>

                </Pressable>
            </GestureDetector>
        </Modal>
    );
};

export default MoreProfilModal;
