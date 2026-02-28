import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const EditAbout : React.FC = () => {
    const [description, setDescription] = useState("Salut, c’est parti pour Gosial !");
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();

    return (
        <View className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"}`}>
            {/* HEADER */}
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold text-black">À Propos</Text>
                    <TouchableOpacity>
                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* DESCRIPTION INPUT */}
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <View className={`${isDarkMode ? "bg-black" : "bg-[#F2F5FA]"} p-4 rounded-lg mt-4 w-full`}>
                    <TextInput
                        className={`border p-3 rounded-lg ${isDarkMode ? "bg-[#1D1E20] border-white border-[0.3px] text-white" : "bg-white border-[#065C98] text-black"}  h-40`}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />
                </View>
            </KeyboardAvoidingView>

            {/* Boutons fixes en bas */}
            <View className={`absolute bottom-6 left-0 right-0 ${isDarkMode ? "bg-black" : "bg-white"} p-4 flex-row justify-between`}>
                <TouchableOpacity className={`px-8 py-3 border ${isDarkMode ? "border-[#FF4D4D]" : "border-[#FF4D4D]"} rounded-lg`}>
                    <Text className="text-[#FF4D4D] font-bold">Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity className={`px-8 py-3 ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} rounded-lg`}>
                    <Text className="text-white font-bold">Enregistrer</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default EditAbout;
