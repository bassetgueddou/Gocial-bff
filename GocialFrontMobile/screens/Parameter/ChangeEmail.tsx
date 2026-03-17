import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import { useAuth } from "../../src/contexts/AuthContext";
import { userService } from "../../src/services/users";

const ChangeEmail: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation();
    const { user, refreshUser } = useAuth();
    const [saving, setSaving] = useState(false);

    const [currentEmail, setCurrentEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [currentError, setCurrentError] = useState("");
    const [newError, setNewError] = useState("");
    const [confirmError, setConfirmError] = useState("");

    const maskedEmail = user?.email
        ? user.email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(b.length) + c)
        : "****@email.com";

    const validate = (): boolean => {
        let valid = true;
        setCurrentError("");
        setNewError("");
        setConfirmError("");

        if (currentEmail !== user?.email) {
            setCurrentError("Il ne s'agit pas de l'email actuel.");
            valid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            setNewError("Le nouveau email doit avoir le bon format. Exemple : email@email.com");
            valid = false;
        }

        if (newEmail !== confirmEmail) {
            setConfirmError("Les nouveaux mails ne correspondent pas.");
            valid = false;
        }

        return valid;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            setSaving(true);
            await userService.updateProfile({ email: newEmail } as any);
            await refreshUser();
            Toast.show({
                type: "success",
                text1: "Email mis à jour",
                text2: "Ton email a été changé avec succès",
                position: "top",
                topOffset: 60,
            });
            navigation.goBack();
        } catch (e: any) {
            Toast.show({ type: "error", text1: "Erreur", text2: e?.response?.data?.error || "Impossible de modifier l'email" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <View className="flex-1">
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>Modifier Email</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView className={`p-0 ${isDarkMode ? "bg-black" : "bg-white"}`} contentContainerStyle={{ paddingBottom: 120 }}>
                    <View className="mt-2 w-full">
                        <View className="flex-row justify-between items-center px-4 mb-2">
                            <Text className={`font-bold text-base ${isDarkMode ? "text-white" : "text-black"}`}>
                                Email actuel
                            </Text>
                        </View>
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <TextInput
                                className={`border ${isDarkMode ? "border-[0.3px] border-white" : "border-[#065C98]"} p-3 rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
                                placeholder={maskedEmail}
                                placeholderTextColor="grey"
                                value={currentEmail}
                                onChangeText={setCurrentEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                        {currentError ? <Text className="text-[#FF0000] text-xs p-2">{currentError}</Text> : null}
                    </View>

                    <View className="mt-4 w-full">
                        <View className="flex-row justify-between items-center px-4 mb-2">
                            <Text className={`font-bold text-base ${isDarkMode ? "text-white" : "text-black"}`}>Nouveau Email</Text>
                        </View>
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <TextInput
                                className={`border ${isDarkMode ? "border-[0.3px] border-white" : "border-[#065C98]"} p-3 rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
                                value={newEmail}
                                onChangeText={setNewEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                        {newError ? <Text className="text-[#FF0000] text-xs p-2">{newError}</Text> : null}
                    </View>

                    <View className="mt-4 w-full">
                        <View className="flex-row justify-between items-center px-4 mb-2">
                            <Text className={`font-bold text-base ${isDarkMode ? "text-white" : "text-black"}`}>Confirmer Nouveau Email</Text>
                        </View>
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <TextInput
                                className={`border ${isDarkMode ? "border-[0.3px] border-white" : "border-[#065C98]"} p-3 rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
                                value={confirmEmail}
                                onChangeText={setConfirmEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                        {confirmError ? <Text className="text-[#FF0000] text-xs p-2">{confirmError}</Text> : null}
                    </View>
                </ScrollView>

                <View className={`pb-6 px-[1rem] ${isDarkMode ? "bg-black" : "bg-[#F2F5FA]"}`}>
                    <TouchableOpacity
                        className={`w-full ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#2C5B90]"} py-4 rounded-md ${saving ? "opacity-50" : ""}`}
                        onPress={handleSubmit}
                        disabled={saving}
                    >
                        <Text className="text-white text-center text-lg font-medium">{saving ? "..." : "Modifier l'email"}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default ChangeEmail;
