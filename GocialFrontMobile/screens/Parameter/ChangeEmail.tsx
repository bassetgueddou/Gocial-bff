import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Toast from 'react-native-toast-message';


const ChangeEmail: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation();

    // il faut récup de la bdd
    const [emailPlaceholder, setEmailPlaceholder] = useState("****em@email.com");

    return (
        <View className="flex-1">
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        Modifier Email
                    </Text>
                    <TouchableOpacity>
                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView className={`p-0 ${isDarkMode ? "bg-black" : "bg-white"}`} contentContainerStyle={{ paddingBottom: 120 }}>
                    <View className="mt-2 w-full">
                        {/* Label et icône */}
                        <View className="flex-row justify-between items-center px-4 mb-2">
                            <Text className={`font-bold text-base ${isDarkMode ? "text-white" : "text-black"}`}>
                                Email actuel (mis à jour le 11/06/2024)
                            </Text>
                        </View>

                        {/* Conteneur de l'input */}
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <TextInput
                                className={`border ${isDarkMode ? "border-[0.3px] border-white" : "border-[#065C98]"}
                                    p-3 rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
                                placeholder={emailPlaceholder}
                                placeholderTextColor={"grey"}
                                autoCapitalize="none"
                            />
                        </View>
                        <Text className={`text-[#FF0000] text-xs p-2`}>Il ne s’agit pas de l’email actuel.</Text>
                    </View>

                    <View className="mt-4 w-full">
                        {/* Label et icône */}
                        <View className="flex-row justify-between items-center px-4 mb-2">
                            <Text className={`font-bold text-base ${isDarkMode ? "text-white" : "text-black"}`}>
                                Nouveau Email
                            </Text>
                        </View>

                        {/* Conteneur de l'input */}
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <TextInput
                                className={`border ${isDarkMode ? "border-[0.3px] border-white" : "border-[#065C98]"}
                                    p-3 rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
                                autoCapitalize="none"
                            />
                        </View>
                        <Text className={`text-[#FF0000] text-xs p-2`}>Le nouveau email doit avoir le bon format. Exemple : email@email.com</Text>
                    </View>

                    <View className="mt-4 w-full">
                        {/* Label et icône */}
                        <View className="flex-row justify-between items-center px-4 mb-2">
                            <Text className={`font-bold text-base ${isDarkMode ? "text-white" : "text-black"}`}>
                                Confirmer Nouveau Email
                            </Text>
                        </View>

                        {/* Conteneur de l'input */}
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <TextInput
                                className={`border ${isDarkMode ? "border-[0.3px] border-white" : "border-[#065C98]"}
                                    p-3 rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
                                autoCapitalize="none"
                            />
                        </View>
                        <Text className={`text-[#FF0000] text-xs p-2`}>Les nouveaux mails ne correspondent pas. </Text>
                    </View>
                </ScrollView>

                <View className={`pb-6 px-[1rem] ${isDarkMode ? "bg-black" : "bg-[#F2F5FA]"}`}>
                    <TouchableOpacity
                        className={`w-full ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#2C5B90]"} py-4 rounded-md`}
                        onPress={() => {
                            Toast.show({
                                type: 'success',
                                text1: 'Mail de confirmation envoyé',
                                text2: 'Vérifie ta boîte de réception 📬',
                                position: 'top',
                                topOffset: 60,
                            });
                        }}
                    >
                        <Text className="text-white text-center text-lg font-medium">Envoyer un mail de confirmation</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default ChangeEmail;
