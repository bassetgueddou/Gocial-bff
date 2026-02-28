import { View, Text, Image, SafeAreaView, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import React, { useState } from "react";
import MessageModal from "./Message/MessageModal";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../src/contexts/AuthContext";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    GeneralParameter: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;


interface HeaderProps {
    title: string;
}


const Header: React.FC<HeaderProps> = ({ title }) => {
    const navigation = useNavigation<NavigationProp>();
    const { user } = useAuth();
    const [modalMessageVisible, setModalMessageVisible] = useState(false);

    const initials = user
        ? `${(user.first_name || '')[0] || ''}${(user.last_name || user.pseudo || '')[0] || ''}`.toUpperCase() || '?'
        : '?';

    return (
        <LinearGradient
            colors={["#004C82", "#065C98"]} // Dégradé du bleu foncé au bleu clair
            start={{ x: 0, y: 0 }} // Début du gradient en haut
            end={{ x: 1, y: 1 }} // Fin du gradient en bas
        >
            <SafeAreaView>
                <MessageModal visible={modalMessageVisible} onClose={() => setModalMessageVisible(false)} />

                <View className="flex-row items-center justify-between p-4">
                    {/* Avatar */}
                    <TouchableOpacity onPress={() => navigation.navigate("GeneralParameter")} className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                        <Text className="text-black font-bold">{initials}</Text>
                    </TouchableOpacity>

                    {/* Title */}
                    <Text className="text-white text-lg font-semibold relative right-2">{title}</Text>

                    <TouchableOpacity onPress={() => setModalMessageVisible(true)} className="relative bottom-4">
                        <Image source={require("../img/message.png")} className="h-8 w-8" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

export default Header;
