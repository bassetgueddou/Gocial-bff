import { View, Text, Image, SafeAreaView, TouchableOpacity } from "react-native";
import { useTheme } from "../ThemeContext";
import LinearGradient from "react-native-linear-gradient";
import React, { useState } from "react";
import MessageModal from "../Message/MessageModal";
import FilterDiaryModal from "./FilterDiaryModal";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    GeneralParameter: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;


interface HeaderMyDiaryProps {
    title: string;
}


const HeaderMyDiary: React.FC<HeaderMyDiaryProps> = ({ title }) => {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [modalMessageVisible, setModalMessageVisible] = useState(false);
    const [modalFilterDiaryVisible, setModalFilterDiaryVisible] = useState(false);

    return (
        <LinearGradient
            colors={["#004C82", "#065C98"]} // Dégradé du bleu foncé au bleu clair
            start={{ x: 0, y: 0 }} // Début du gradient en haut
            end={{ x: 1, y: 1 }} // Fin du gradient en bas
        >
            <SafeAreaView>

                <MessageModal visible={modalMessageVisible} onClose={() => setModalMessageVisible(false)} />
                <FilterDiaryModal visible={modalFilterDiaryVisible} onClose={() => setModalFilterDiaryVisible(false)} />

                <View className="flex-row items-center justify-between p-4">
                    {/* Avatar */}
                    <TouchableOpacity onPress={() => navigation.navigate("GeneralParameter")} className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                        <Text className="text-black font-bold">EL</Text>
                    </TouchableOpacity>

                    {/* Title */}
                    <Text className="text-white text-lg font-semibold relative right-2">{title}</Text>

                    <TouchableOpacity onPress={() => setModalMessageVisible(true)} className="relative bottom-4">
                        <Image source={require("../../img/message.png")} className="h-8 w-8" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

export default HeaderMyDiary;
