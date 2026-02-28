import React from "react";
import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import Modal from "react-native-modal";
import { GestureDetector, Gesture, Directions } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    ContactUs: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get("window");

interface HelpModalProps {
    visible: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ visible, onClose }) => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const { isDarkMode } = useTheme();

    const swipeGesture = Gesture.Fling()
        .direction(Directions.DOWN)
        .onEnd(() => {
            if (visible) runOnJS(onClose)();
        });

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            swipeDirection={["down"]}
            onSwipeComplete={onClose}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            backdropOpacity={0.5}
            useNativeDriver
            hideModalContentWhileAnimating
            statusBarTranslucent
            style={{ margin: 0, justifyContent: "flex-end" }}
        >
            <GestureDetector gesture={swipeGesture}>
                <SafeAreaView
                    className={`absolute bottom-0 w-full ${isDarkMode ? "bg-black border-[0.3px] border-white" : "bg-white"} rounded-t-2xl px-5 pt-3`}
                    style={{ paddingBottom: insets.bottom + 10 }}
                >
                    {/* Barre de fermeture */}
                    <View className="items-center mb-2.5">
                        <View className="w-10 h-1.5 bg-gray-300 rounded-full" />
                    </View>

                    {/* Icône et titre */}
                    <View className="flex-row items-center justify-center mb-4">
                        <Image source={require("../../img/help-icon.png")} className="w-[30px] h-[30px] mr-3" style={{ tintColor: isDarkMode ? "white" : "black" }} />
                        <Text className={`text-[22px] font-bold ${isDarkMode ? "text-white" : "text-black"}`}>Aide</Text>
                    </View>

                    {/* Bouton FAQ */}
                    <TouchableOpacity className="bg-[#065C98] py-4 rounded-xl items-center mb-5 mt-2.5">
                        <Text className="text-white text-base font-bold">Consulter la FAQ</Text>
                    </TouchableOpacity>

                    {/* Bouton Nous contacter */}
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate("ContactUs");
                            onClose();
                        }}
                        className="border border-[#065C98] py-4 rounded-xl items-center"
                    >
                        <Text className="text-[#065C98] text-base font-bold">Nous contacter</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </GestureDetector>
        </Modal>
    );
};

export default HelpModal;
