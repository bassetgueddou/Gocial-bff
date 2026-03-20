import { View, Text, TouchableOpacity, ScrollView, Linking, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import React, { useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useCreateActivity } from "../../../src/contexts/CreateActivityContext";
import { activityService } from "../../../src/services/activities";
import { useAuth } from "../../../src/contexts/AuthContext";

type RootStackParamList = {
    CATitle: undefined;
    Main: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const CAVisioPreview: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { formData, resetForm } = useCreateActivity();
    const { user } = useAuth();
    const [publishing, setPublishing] = useState(false);

    const formatDate = (iso?: string) => {
        if (!iso) return "Date non définie";
        const d = new Date(iso);
        const days = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
        const months = ["jan.", "fév.", "mar.", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
        return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} - ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    };

    const infoData = [
        { label: "Type d'activité", value: formData.selectedActivityName || formData.category || "\u2014" },
        { label: "Âge des participants", value: `${formData.minAge ?? 18}-${formData.maxAge ?? 122}` },
        { label: "Types de participants", value: formData.genderRestriction === "all" ? "Tout le monde" : formData.genderRestriction || "Tout le monde" },
        { label: "Visibilité", value: formData.visibility === "public" ? "Publique" : formData.visibility === "friends" ? "Mes amis Gocial" : formData.visibility || "Publique" },
        { label: "Validation des participants", value: formData.require_approval ? "Manuelle" : "Automatique" },
    ];

    const handleOpenLink = () => {
        if (formData.visio_link) {
            Linking.openURL(formData.visio_link);
        }
    };

    const handlePublish = async () => {
        if (!formData.title || !formData.date) {
            Toast.show({ type: 'error', text1: 'Erreur', text2: 'Titre et date sont obligatoires.', position: 'top', topOffset: 60 });
            return;
        }
        setPublishing(true);
        try {
            await activityService.createActivity({
                title: formData.title,
                activity_type: 'visio',
                date: formData.date,
                description: formData.description,
                category: formData.category,
                max_participants: formData.max_participants,
                visibility: formData.visibility as 'public' | 'friends' | 'private' | undefined,
                require_approval: formData.require_approval,
                visio_link: formData.visio_link,
                city: formData.city,
            });
            Toast.show({
                type: 'success',
                text1: 'Événement publié',
                text2: 'Ton événement est à présent en ligne.',
                position: 'top',
                topOffset: 60,
            });
            resetForm();
            setTimeout(() => navigation.navigate("Main"), 1500);
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.message || 'Erreur inconnue';
            Toast.show({ type: 'error', text1: 'Échec de la publication', text2: msg, position: 'top', topOffset: 60 });
        } finally {
            setPublishing(false);
        }
    };

    const initials = user
        ? `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase() || '?'
        : '?';

    return (
        <View className="flex-1">
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        Aperçu
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Main")}>
                        <MaterialIcons name="close" size={25} color="red" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView className={`${isDarkMode ? "bg-black" : "bg-white"} min-h-screen`} contentContainerStyle={{ paddingBottom: 300 }}>

                <View className="relative">
                    <Image
                        source={formData.imageUri ? { uri: formData.imageUri } : require("../../../img/billard-exemple.jpg")}
                        className="w-full h-48"
                    />
                    <View className="absolute -bottom-6 left-4 rounded-full">
                        {user?.avatar_url ? (
                            <Image source={{ uri: user.avatar_url }} className="w-[4rem] h-[4rem] rounded-full" />
                        ) : (
                            <View className="w-[4rem] h-[4rem] rounded-full bg-[#065C98] items-center justify-center">
                                <Text className="text-white font-bold text-lg">{initials}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View className="mt-2 items-center">
                    <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold text-lg text-center`}>
                        {formData.title || "Titre non défini"}
                    </Text>
                    <Text className={`${isDarkMode ? "text-white" : "text-black"} text-base mt-1`}>
                        {formatDate(formData.date)}
                    </Text>
                </View>

                <View className="flex-row items-start justify-center mt-4 px-[3rem]">
                    <TouchableOpacity className={`w-[25%] items-center border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg mr-6`}>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>Visio</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className={`w-[25%] items-center border ${isDarkMode ? "border-[#1A6EDE]" : "border-[#065C98]"} px-4 py-2 rounded-lg`}>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>0/{formData.max_participants ?? 5}</Text>
                    </TouchableOpacity>
                </View>

                {formData.visio_link ? (
                    <TouchableOpacity onPress={handleOpenLink} className="flex-row items-center space-x-2 mt-5 mb-2 px-2">
                        <FontAwesome name="external-link" size={18} color={isDarkMode ? "white" : "black"} className="mr-1 relative top-[0.1rem]" />
                        <Text className={`underline text-base ${isDarkMode ? "text-white" : "text-black"}`}>{formData.visio_link}</Text>
                    </TouchableOpacity>
                ) : null}

                <View className={`p-4 ${isDarkMode ? "bg-black" : "bg-white"}`}>
                    <Text className={`text-base mb-2 ${isDarkMode ? "text-white" : ""}`}>
                        1/{formData.max_participants ?? 5} Participant  <Text>(0 en attente)</Text>
                    </Text>
                    <View className="flex-row items-center space-x-4 mb-2">
                        {user?.avatar_url ? (
                            <Image source={{ uri: user.avatar_url }} className="w-10 h-10 rounded-full" />
                        ) : (
                            <View className="w-10 h-10 rounded-full bg-[#065C98] items-center justify-center">
                                <Text className="text-white font-bold text-sm">{initials}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View className="mt-2 w-full">
                    <View className="flex-row items-center justify-between px-4 mb-2">
                        <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>
                            Description
                        </Text>
                    </View>
                    <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>
                            {formData.description || "Aucune description"}
                        </Text>
                    </View>
                </View>

                <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full mt-6 items-center`}>
                    <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>Pas d'adresse</Text>
                </View>

                <View className="mt-6 w-full">
                    <View className="flex-row items-center justify-between px-4 mb-2">
                        <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>En savoir plus</Text>
                    </View>
                    <View className={`${isDarkMode ? "bg-black" : "bg-white"} rounded-lg`}>
                        {infoData.map((item, index) => (
                            <View key={index} className="mt-2">
                                <View className={`flex-row justify-between items-center py-3 px-4 ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} rounded-lg`}>
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{item.label}</Text>
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{item.value}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>

            <View className={`absolute bottom-0 left-0 right-0 ${isDarkMode ? 'bg-black' : 'bg-white'} px-4 py-4 flex-row justify-between items-center`}
                style={{ height: 80 }}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className={`px-8 py-3 border ${isDarkMode ? 'border-[#1A6EDE]' : 'border-[#065C98]'} rounded-lg`}>
                    <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"} font-bold`}>Modifier</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handlePublish}
                    disabled={publishing}
                    className={`px-8 py-3 ${isDarkMode ? 'bg-[#1A6EDE]' : 'bg-[#065C98]'} rounded-lg`}>
                    {publishing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold">Publier</Text>
                    )}
                </TouchableOpacity>
            </View>

        </View>
    );
}

export default CAVisioPreview;
