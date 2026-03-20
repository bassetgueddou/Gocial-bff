import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../../src/contexts/AuthContext";
import { userService } from "../../src/services/users";
import Toast from "react-native-toast-message";

const EditAbout: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [description, setDescription] = useState(user?.bio || "");
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();

    const handleSave = async () => {
        setLoading(true);
        try {
            const data = await userService.updateProfile({ bio: description });
            if (updateUser) updateUser({ ...user, bio: description });
            Toast.show({ type: "success", text1: "Profil mis à jour", position: "top", topOffset: 60 });
            navigation.goBack();
        } catch {
            Toast.show({ type: "error", text1: "Erreur", text2: "Impossible de mettre à jour.", position: "top", topOffset: 60 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"}`}>
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>À Propos</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <View className={`${isDarkMode ? "bg-black" : "bg-[#F2F5FA]"} p-4 rounded-lg mt-4 w-full`}>
                    <TextInput
                        className={`border p-3 rounded-lg ${isDarkMode ? "bg-[#1D1E20] border-white border-[0.3px] text-white" : "bg-white border-[#065C98] text-black"} h-40`}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />
                </View>
            </KeyboardAvoidingView>
            <View className={`absolute bottom-6 left-0 right-0 ${isDarkMode ? "bg-black" : "bg-white"} p-4 flex-row justify-between`}>
                <TouchableOpacity onPress={() => navigation.goBack()} className={`px-8 py-3 border border-[#FF4D4D] rounded-lg`}>
                    <Text className="text-[#FF4D4D] font-bold">Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} disabled={loading} className={`px-8 py-3 ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} rounded-lg ${loading ? "opacity-50" : ""}`}>
                    <Text className="text-white font-bold">{loading ? "..." : "Enregistrer"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default EditAbout;
