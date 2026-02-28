import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import Toast from "react-native-toast-message";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    Main: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;


const ReportActivity: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [reason, setReason] = useState("");

    return (
        <View className="flex-1 bg-white">
            {/* HEADER */}
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        Signaler
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Main")}>
                        <MaterialIcons name="close" size={25} color="red" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <View className="flex-1 p-5">
                <Text className={`mb-4 text-center text-lg ${isDarkMode ? "text-white" : ""}`}>Peux-tu détailler la raison du signalement de l'évenement "Conversation Anglais en ligne" ?</Text>

                {/* TextInput pour la raison */}
                <TextInput
                    value={reason}
                    onChangeText={setReason}
                    placeholder="Je signale car..."
                    placeholderTextColor="#8B8B8B"
                    className={`${isDarkMode ? "bg-[#1D1E20] text-white" : "bg-[#F3F3F3]"} w-full h-[20rem] rounded-lg px-4 py-2 text-lg mb-6`}
                    multiline
                />

            </View>

            <View className={`absolute bottom-6 left-0 right-0 ${isDarkMode ? "bg-black" : "bg-white"} p-4 flex-row justify-between`}>
                <TouchableOpacity onPress={() => navigation.goBack()} className={`px-8 py-3 ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#D9D9D9]"} rounded-lg`}>
                    <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"} font-bold`}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    Toast.show({
                        type: 'success',
                        text1: 'Signalement envoyé',
                        text2: 'Merci pour ton retour, nous allons examiner l’évènement.',
                        position: 'top',
                        topOffset: 60,
                    });

                    // Optionnel : retour à la page précédente ou page d'accueil
                    setTimeout(() => {
                        navigation.navigate("Main");
                    }, 2000);
                }}
                    className={`px-8 py-3 bg-[#F00020] rounded-lg`}>
                    <Text className="text-white font-bold">Signaler</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ReportActivity;
