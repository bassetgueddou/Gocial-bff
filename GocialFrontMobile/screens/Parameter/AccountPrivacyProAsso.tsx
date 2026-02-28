import { View, Text, Pressable, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    GeneralParameter: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

const AccountPrivacyProAsso : React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [selected, setSelected] = useState<{
        addFriend: string;
        // viewActivities: string;
        viewFriends: string;
        inviteActivity: string;
    }>({
        // addFriend: 'Tout le monde',
        addFriend: 'Public',
        // viewActivities: 'Tout le monde',
        viewFriends: 'Tout le monde',
        inviteActivity: 'Tout le monde',
    });

    const options: Record<keyof typeof selected, string[]> = {
        // Todo : Limiter les invitations par sexe
        // addFriend: ['Tout le monde', 'Hommes', 'Femmes', 'Non-Binaires', 'Privé'],
        addFriend: ['Public', 'Privé'],
        // viewActivities: ['Tout le monde', 'Mes Abonnés', 'Pro', 'Asso', 'Privé'],
        viewFriends: ['Tout le monde', 'Mes Abonnés', 'Pro', 'Asso', 'Privé'],
        inviteActivity: ['Tout le monde', 'Mes Abonnés', 'Pro', 'Asso', 'Privé'],
    };

    return (
        <View className={`flex-1 ${isDarkMode ? "bg-black" : "bg-gray-200"}`}>
            {/* HEADER */}
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        Confidentialité du compte
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("GeneralParameter")}>
                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>


            {/* CONTENU SCROLLABLE */}
            <View className="flex-1">
                <ScrollView className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-gray-200"} px-4 pt-4 pb-4`}>
                    {Object.entries(options).map(([key, values]) => (
                        <View key={key} className={`mb-4 ${isDarkMode ? "bg-black" : "bg-white"} p-4 rounded-lg`}>
                            <Text className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>
                                {
                                 key === 'addFriend' ? "Me suivre" :
                                    key === 'viewActivities' ? "Voir mes activités dans mon profil" :
                                        key === 'viewFriends' ? "Voir mes abonnés dans mon profil" :
                                            key === 'inviteActivity' ? "M’inviter à une activité" :
                                                "Voir mes réseaux sociaux"}
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {values.map((option) => (
                                    <Pressable
                                        key={option}
                                        onPress={() => setSelected((prev) => ({ ...prev, [key]: option }))}
                                        className={`px-4 py-2 rounded-lg ${selected[key as keyof typeof selected] === option ? isDarkMode
                                            ? 'bg-[#1A6EDE] text-white'
                                            : 'bg-[#065C98] text-white'
                                            : isDarkMode
                                                ? 'border-[0.3px] border-white'
                                                : 'border border-[#065C98] text-[#065C98]'}`}
                                    >
                                        <Text className={`${selected[key as keyof typeof selected] === option ? isDarkMode
                                            ? 'text-white'
                                            : 'text-white'
                                            : isDarkMode
                                                ? 'text-white'
                                                : 'text-[#065C98]'}`}>
                                            {option}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

export default AccountPrivacyProAsso;
