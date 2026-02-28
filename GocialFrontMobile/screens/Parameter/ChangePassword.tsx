import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";


const ChangePassword: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation();

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [checked, setChecked] = useState<boolean>(false);

    return (
        <View className="flex-1">
            {/* HEADER */}
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        Modifier Mot de passe
                    </Text>
                    <TouchableOpacity>
                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView className={`p-0 ${isDarkMode ? "bg-black" : "bg-white"}`} contentContainerStyle={{ paddingBottom: 120 }}>

                    <Text className={`${isDarkMode ? "text-white" : "text-black"} px-2 mb-2 text-sm text-center`}>Votre mot de passe doit contenir au moins 6 caractères ainsi qu’une combinaison de chiffres, de lettres et de caractères spéciaux (!$@%).</Text>

                    <View className="mt-2 w-full">
                        {/* Label et icône */}
                        <View className="flex-row justify-between items-center px-4 mb-2">
                            <Text className={`font-bold text-base ${isDarkMode ? "text-white" : "text-black"}`}>
                                Mot de passe actuel (mis à jour le 11/06/2024)
                            </Text>
                        </View>

                        {/* Conteneur de l'input */}
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <TextInput
                                className={`border ${isDarkMode ? "border-[0.3px] border-white" : "border-[#065C98]"}
                                    p-3 rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
                                autoCapitalize="none"
                            />

                            <TouchableOpacity className="absolute right-8 top-6" onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                <MaterialIcons
                                    name={isPasswordVisible ? "visibility-off" : "visibility"}
                                    size={20}
                                    color={isDarkMode ? "white" : "black"}
                                />
                            </TouchableOpacity>
                        </View>
                        <Text className={`text-[#FF0000] text-xs p-2`}>Il ne s’agit pas du mot de passe actuel.</Text>
                    </View>

                    <View className="mt-4 w-full">
                        {/* Label et icône */}
                        <View className="flex-row justify-between items-center px-4 mb-2">
                            <Text className={`font-bold text-base ${isDarkMode ? "text-white" : "text-black"}`}>
                                Nouveau Mot de passe
                            </Text>
                        </View>

                        {/* Conteneur de l'input */}
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <TextInput
                                className={`border ${isDarkMode ? "border-[0.3px] border-white" : "border-[#065C98]"}
                                    p-3 rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
                                autoCapitalize="none"
                            />

                            <TouchableOpacity className="absolute right-8 top-6" onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                <MaterialIcons
                                    name={isPasswordVisible ? "visibility-off" : "visibility"}
                                    size={20}
                                    color={isDarkMode ? "white" : "black"}
                                />
                            </TouchableOpacity>
                        </View>
                        <Text className={`text-[#FF0000] text-xs px-2 pt-2`}>Le mot de passe doit au moins contenir 6 caractères.</Text>
                        <Text className={`text-[#FF0000] text-xs px-2`}>Il doit contenir au moins un chiffre.</Text>
                        <Text className={`text-[#FF0000] text-xs px-2`}>Il doit contenir au moins une lettre.</Text>
                        <Text className={`text-[#FF0000] text-xs px-2`}>Il doit contenir au moins un caractère spécial. (!$@%).</Text>
                    </View>

                    <View className="mt-4 w-full">
                        {/* Label et icône */}
                        <View className="flex-row justify-between items-center px-4 mb-2">
                            <Text className={`font-bold text-base ${isDarkMode ? "text-white" : "text-black"}`}>
                                Retapez le Nouveau Mot de passe
                            </Text>
                        </View>

                        {/* Conteneur de l'input */}
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <TextInput
                                className={`border ${isDarkMode ? "border-[0.3px] border-white" : "border-[#065C98]"}
                                    p-3 rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
                                autoCapitalize="none"
                            />

                            <TouchableOpacity className="absolute right-8 top-6" onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                <MaterialIcons
                                    name={isPasswordVisible ? "visibility-off" : "visibility"}
                                    size={20}
                                    color={isDarkMode ? "white" : "black"}
                                />
                            </TouchableOpacity>
                        </View>
                        <Text className={`text-[#FF0000] text-xs p-2`}>Les 2 mots de passe ne correspondent pas.</Text>
                        <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"} text-sm py-1 px-4`}>Mot de passe oublié ?</Text>
                        <View className="flex-row p-2">
                            <TouchableOpacity
                                onPress={() => setChecked(!checked)}
                                className={`w-5 h-5 rounded border-2 items-center justify-center relative top-3 ${checked ? isDarkMode ? "bg-[#1A6EDE] border-[#1A6EDE]" : "bg-[#2C5B90] border-[#2C5B90]" : "bg-white border-[#2C5B90]"
                                    }`}
                            >
                                {checked && (
                                    <MaterialIcons name="check" size={14} color="#FFFFFF" />
                                )}
                            </TouchableOpacity>

                            <Text className={`${isDarkMode ? "text-white" : "text-black"} text-sm py-2 px-4`}>Se déconnecter des autres appareils. Choisissez cette option si une autre personne a utilisé votre compte.</Text>
                        </View>
                    </View>
                </ScrollView>

                <View className={`pb-6 px-[1rem] ${isDarkMode ? "bg-black" : "bg-[#F2F5FA]"}`}>
                    <TouchableOpacity
                        className={`w-full ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#2C5B90]"} py-4 rounded-md`}
                        onPress={() => {
                            // Ici, tu peux insérer ta logique de validation / appel API avant d’afficher le toast
                            Toast.show({
                                type: 'success',
                                text1: 'Mot de passe modifié',
                                text2: 'Ton mot de passe a bien été mis à jour 🔐',
                                position: 'top',
                                topOffset: 60,
                            });
                        }}
                    >
                        <Text className="text-white text-center text-lg font-medium">Modifier le Mot de passe</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default ChangePassword;
