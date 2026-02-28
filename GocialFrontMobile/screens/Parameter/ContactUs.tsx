import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    GeneralParameter: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;


const ContactUs: React.FC = () => {
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
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        Nous Contacter
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("GeneralParameter")}>
                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <View className="flex-1 p-5">
                <Text className={`mb-4 ${isDarkMode ? "text-white" : ""}`}>Comment pouvons-nous vous aidez ? </Text>

                {/* TextInput pour la raison */}
                <TextInput
                    value={reason}
                    onChangeText={setReason}
                    placeholder="J’ai un question ?"
                    placeholderTextColor="#8B8B8B"
                    className={`${isDarkMode ? "bg-[#1D1E20] text-white" : "bg-[#F3F3F3]"} w-full h-[20rem] rounded-lg px-4 py-2 text-lg mb-6`}
                    multiline
                />

            </View>

            <View className={`absolute bottom-6 left-0 right-0 ${isDarkMode ? "bg-black" : "bg-white"} p-4 flex-row justify-between`}>
                <TouchableOpacity className={`px-8 py-3 ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#D9D9D9]"} rounded-lg`}>
                    <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"} font-bold`}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity className={`px-8 py-3 ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} rounded-lg`}>
                    <Text className="text-white font-bold">Soumettre</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ContactUs;
