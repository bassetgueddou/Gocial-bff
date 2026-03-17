import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import { authService } from "../../src/services/auth";

const ChangePassword: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [checked, setChecked] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const validate = (): boolean => {
        const errs: string[] = [];
        if (!currentPassword) errs.push("Veuillez entrer le mot de passe actuel.");
        if (newPassword.length < 6) errs.push("Le mot de passe doit contenir au moins 6 caracteres.");
        if (!/\d/.test(newPassword)) errs.push("Il doit contenir au moins un chiffre.");
        if (!/[a-zA-Z]/.test(newPassword)) errs.push("Il doit contenir au moins une lettre.");
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) errs.push("Il doit contenir au moins un caractere special.");
        if (newPassword !== confirmPassword) errs.push("Les 2 mots de passe ne correspondent pas.");
        setErrors(errs);
        return errs.length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await authService.changePassword(currentPassword, newPassword);
            Toast.show({ type: "success", text1: "Mot de passe modifie", text2: "Ton mot de passe a bien ete mis a jour.", position: "top", topOffset: 60 });
            navigation.goBack();
        } catch (err: any) {
            const msg = err?.response?.data?.error || "Erreur lors du changement de mot de passe.";
            Toast.show({ type: "error", text1: "Erreur", text2: msg, position: "top", topOffset: 60 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1">
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>Modifier Mot de passe</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView className={`p-0 ${isDarkMode ? "bg-black" : "bg-white"}`} contentContainerStyle={{ paddingBottom: 120 }}>
                    <Text className={`${isDarkMode ? "text-white" : "text-black"} px-2 mb-2 text-sm text-center`}>
                        Votre mot de passe doit contenir au moins 6 caracteres ainsi qu une combinaison de chiffres, de lettres et de caracteres speciaux (!$@%).
                    </Text>

                    <View className="mt-2 w-full">
                        <View className="flex-row justify-between items-center px-4 mb-2">
                            <Text className={`font-bold text-base ${isDarkMode ? "text-white" : "text-black"}`}>Mot de passe actuel</Text>
                        </View>
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <TextInput
                                className={`border ${isDarkMode ? "border-[0.3px] border-white" : "border-[#065C98]"} p-3 rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
                                autoCapitalize="none"
                                secureTextEntry={!isPasswordVisible}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                            />
                            <TouchableOpacity className="absolute right-8 top-6" onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                <MaterialIcons name={isPasswordVisible ? "visibility-off" : "visibility"} size={20} color={isDarkMode ? "white" : "black"} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mt-4 w-full">
                        <View className="flex-row justify-between items-center px-4 mb-2">
                            <Text className={`font-bold text-base ${isDarkMode ? "text-white" : "text-black"}`}>Nouveau Mot de passe</Text>
                        </View>
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <TextInput
                                className={`border ${isDarkMode ? "border-[0.3px] border-white" : "border-[#065C98]"} p-3 rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
                                autoCapitalize="none"
                                secureTextEntry={!isPasswordVisible}
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                        </View>
                    </View>

                    <View className="mt-4 w-full">
                        <View className="flex-row justify-between items-center px-4 mb-2">
                            <Text className={`font-bold text-base ${isDarkMode ? "text-white" : "text-black"}`}>Retapez le Nouveau Mot de passe</Text>
                        </View>
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <TextInput
                                className={`border ${isDarkMode ? "border-[0.3px] border-white" : "border-[#065C98]"} p-3 rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
                                autoCapitalize="none"
                                secureTextEntry={!isPasswordVisible}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>
                    </View>

                    {errors.length > 0 && (
                        <View className="px-4 mt-2">
                            {errors.map((e, i) => (
                                <Text key={i} className="text-[#FF0000] text-xs">{e}</Text>
                            ))}
                        </View>
                    )}

                    <View className="flex-row p-2 mt-2">
                        <TouchableOpacity
                            onPress={() => setChecked(!checked)}
                            className={`w-5 h-5 rounded border-2 items-center justify-center relative top-3 ${checked ? isDarkMode ? "bg-[#1A6EDE] border-[#1A6EDE]" : "bg-[#2C5B90] border-[#2C5B90]" : "bg-white border-[#2C5B90]"}`}
                        >
                            {checked && <MaterialIcons name="check" size={14} color="#FFFFFF" />}
                        </TouchableOpacity>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"} text-sm py-2 px-4`}>
                            Se deconnecter des autres appareils. Choisissez cette option si une autre personne a utilise votre compte.
                        </Text>
                    </View>
                </ScrollView>

                <View className={`pb-6 px-[1rem] ${isDarkMode ? "bg-black" : "bg-[#F2F5FA]"}`}>
                    <TouchableOpacity
                        className={`w-full ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#2C5B90]"} py-4 rounded-md ${loading ? "opacity-50" : ""}`}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text className="text-white text-center text-lg font-medium">
                            {loading ? "Modification..." : "Modifier le Mot de passe"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default ChangePassword;
