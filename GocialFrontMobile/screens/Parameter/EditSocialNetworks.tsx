import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../../src/contexts/AuthContext";
import { userService } from "../../src/services/users";
import Toast from "react-native-toast-message";

type SocialLink = {
    label: string;
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    icon?: any;
    iconName?: string;
    field: string;
};

const EditSocialNetworks: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation();
    const { user, refreshUser } = useAuth();
    const [saving, setSaving] = useState(false);

    const [instagram, setInstagram] = useState(user?.instagram || "");
    const [tiktok, setTiktok] = useState(user?.tiktok || "");
    const [facebook, setFacebook] = useState(user?.facebook || "");
    const [snapchat, setSnapchat] = useState(user?.snapchat || "");
    const [twitter, setTwitter] = useState(user?.twitter || "");
    const [linkedin, setLinkedin] = useState(user?.linkedin || "");
    const [youtube, setYoutube] = useState(user?.youtube || "");

    const socialLinks: SocialLink[] = [
        { label: "Liens Instagram", value: instagram, setValue: setInstagram, icon: require("../../img/instagram-social.png"), field: "instagram" },
        { label: "Liens TikTok", value: tiktok, setValue: setTiktok, icon: require("../../img/tiktok-social.png"), field: "tiktok" },
        { label: "Liens Facebook", value: facebook, setValue: setFacebook, icon: require("../../img/facebook-social.png"), field: "facebook" },
        { label: "Liens Snapchat", value: snapchat, setValue: setSnapchat, icon: require("../../img/snapchat-social.png"), field: "snapchat" },
        { label: "Liens Twitter / X", value: twitter, setValue: setTwitter, iconName: "alternate-email", field: "twitter" },
        { label: "Liens LinkedIn", value: linkedin, setValue: setLinkedin, iconName: "work", field: "linkedin" },
        { label: "Liens YouTube", value: youtube, setValue: setYoutube, iconName: "play-circle-outline", field: "youtube" },
    ];

    const handleSave = async () => {
        try {
            setSaving(true);
            await userService.updateProfile({ instagram, tiktok, facebook, snapchat, twitter, linkedin, youtube });
            await refreshUser();
            Toast.show({ type: "success", text1: "Réseaux sociaux mis à jour" });
            navigation.goBack();
        } catch (e: any) {
            Toast.show({ type: "error", text1: "Erreur", text2: e?.response?.data?.error || "Impossible de sauvegarder" });
        } finally {
            setSaving(false);
        }
    };

    const getPlaceholder = (field: string): string => {
        switch (field) {
            case "instagram": return "Entrez votre lien Instagram...";
            case "tiktok": return "Entrez votre lien TikTok...";
            case "facebook": return "Entrez votre lien Facebook...";
            case "snapchat": return "Entrez votre pseudo Snapchat...";
            case "twitter": return "Entrez votre lien Twitter / X...";
            case "linkedin": return "Entrez votre lien LinkedIn...";
            case "youtube": return "Entrez votre lien YouTube...";
            default: return "Entrez votre lien...";
        }
    };

    const renderTextInput = ({ label, value, setValue, icon, iconName, field }: SocialLink) => (
        <View key={label} className="mt-2 w-full">
            <View className="flex-row items-center px-4 mb-2">
                <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>{label}</Text>
                {icon ? (
                    <Image source={icon} style={{ tintColor: isDarkMode ? "white" : "black" }} className="w-6 h-6 ml-2" resizeMode="contain" />
                ) : iconName ? (
                    <MaterialIcons name={iconName} size={24} color={isDarkMode ? "white" : "black"} style={{ marginLeft: 8 }} />
                ) : null}
            </View>
            <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                <TextInput
                    className={`border ${isDarkMode ? "border-[0.3px] border-white" : "border-[#065C98]"} p-3 rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
                    value={value}
                    onChangeText={setValue}
                    keyboardType="url"
                    autoCapitalize="none"
                    placeholder={getPlaceholder(field)}
                    placeholderTextColor="#ABABAB"
                />
            </View>
        </View>
    );

    return (
        <View className="flex-1">
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>Réseaux Sociaux</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView className={`p-0 ${isDarkMode ? "bg-black" : "bg-white"} min-h-screen`} contentContainerStyle={{ paddingBottom: 120 }}>
                    {socialLinks.map(renderTextInput)}
                </ScrollView>

                <View className={`absolute bottom-6 left-0 right-0 ${isDarkMode ? "bg-black" : "bg-white"} p-4 flex-row justify-between`}>
                    <TouchableOpacity onPress={() => navigation.goBack()} className="px-8 py-3 border border-[#FF4D4D] rounded-lg">
                        <Text className="text-[#FF4D4D] font-bold">Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSave} disabled={saving} className={`px-8 py-3 ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} rounded-lg ${saving ? "opacity-50" : ""}`}>
                        <Text className="text-white font-bold">{saving ? "..." : "Enregistrer"}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default EditSocialNetworks;
