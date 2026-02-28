import { useState } from "react";
import { View, Text, TextInput, Pressable, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// Définition du type pour les liens sociaux
type SocialLink = {
    label: string;
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    icon: any;
};

const EditSocialNetworks : React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation();

    // États des liens sociaux
    const [instagram, setInstagram] = useState("https://www.instagram.com/mon-insta/");
    const [tiktok, setTiktok] = useState("https://www.tiktok.com/@mon-tiktok");
    const [facebook, setFacebook] = useState("https://facebook.com/mon-facebook");
    const [snapchat, setSnapchat] = useState("https://snapchat.com/mon-snap");

    // Tableau contenant les informations des réseaux sociaux
    // Tableau contenant les informations des réseaux sociaux avec gestion du dark mode
    const socialLinks: SocialLink[] = [
        {
            label: "Liens Instagram",
            value: instagram,
            setValue: setInstagram,
            icon: require("../../img/instagram-social.png")
        },
        {
            label: "Liens Tiktok",
            value: tiktok,
            setValue: setTiktok,
            icon: require("../../img/tiktok-social.png")
        },
        {
            label: "Liens Facebook",
            value: facebook,
            setValue: setFacebook,
            icon: require("../../img/facebook-social.png")
        },
        {
            label: "Liens Snapchat",
            value: snapchat,
            setValue: setSnapchat,
            icon: require("../../img/snapchat-social.png")
        },
    ];


    // Composant d'entrée avec icône
    const renderTextInput = ({ label, value, setValue, icon }: SocialLink) => {
        return (
            <View key={label} className="mt-2 w-full">
                {/* Label et icône */}
                <View className="flex-row items-center px-4 mb-2">
                    <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>
                        {label}
                    </Text>
                    <Image source={icon} style={{ tintColor: isDarkMode ? "white" : "black" }} className="w-6 h-6 ml-2" resizeMode="contain" />
                </View>

                {/* Conteneur de l'input */}
                <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                    <TextInput
                        className={`border ${isDarkMode ? "border-[0.3px] border-white" : "border-[#065C98]"}
                                    p-3 rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
                        value={value}
                        onChangeText={setValue}
                        keyboardType="url"
                        autoCapitalize="none"
                    />
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1">
            {/* HEADER */}
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        Réseaux Sociaux
                    </Text>
                    <TouchableOpacity>
                       <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Gestion du clavier */}
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView className={`p-0 ${isDarkMode ? "bg-black" : "bg-white"} min-h-screen`} contentContainerStyle={{ paddingBottom: 120 }}>
                    {/* Réseaux sociaux */}
                    {socialLinks.map(renderTextInput)}
                </ScrollView>

                {/* Boutons fixes en bas */}
                <View className={`absolute bottom-6 left-0 right-0 ${isDarkMode ? "bg-black" : "bg-white"} p-4 flex-row justify-between`}>
                    <TouchableOpacity className={`px-8 py-3 border ${isDarkMode ? "border-[#FF4D4D]" : "border-[#FF4D4D]"} rounded-lg`}>
                        <Text className="text-[#FF4D4D] font-bold">Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className={`px-8 py-3 ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} rounded-lg`}>
                        <Text className="text-white font-bold">Enregistrer</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default EditSocialNetworks;
