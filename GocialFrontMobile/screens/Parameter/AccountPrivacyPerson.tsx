import { View, Text, Pressable, TouchableOpacity, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../../src/contexts/AuthContext";
import { userService } from "../../src/services/users";
import Toast from "react-native-toast-message";

type RootStackParamList = {
    GeneralParameter: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

type PrivacyBoolField = 'is_ghost_mode';

interface PrivacyToggleProps {
    label: string;
    description?: string;
    value: boolean;
    field: PrivacyBoolField;
    onToggle: (field: PrivacyBoolField, newValue: boolean) => Promise<void>;
}

const PrivacyToggle = ({ label, description, value, field, onToggle }: PrivacyToggleProps) => {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);

    const handleToggle = async (newValue: boolean) => {
        if (loading) return;
        setLoading(true);
        try {
            await onToggle(field, newValue);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="py-3">
            <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-2">
                    <Text className={`text-base ${isDarkMode ? "text-white" : "text-black"}`}>{label}</Text>
                    {description && (
                        <Text className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{description}</Text>
                    )}
                </View>
                {loading ? (
                    <ActivityIndicator size="small" color={isDarkMode ? "#1A6EDE" : "#065C98"} />
                ) : (
                    <Switch
                        value={value}
                        onValueChange={handleToggle}
                        thumbColor="white"
                        trackColor={{ false: "#E5E7EB", true: "green" }}
                        ios_backgroundColor={isDarkMode ? "#1D1E20" : "#E5E7EB"}
                        style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                    />
                )}
            </View>
        </View>
    );
};

type VisibilityField = 'addFriend' | 'viewFriends' | 'inviteActivity' | 'viewProfil';

const AccountPrivacyPerson: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { user, refreshUser } = useAuth();

    const [selected, setSelected] = useState<Record<VisibilityField, string>>({
        addFriend: 'Tout le monde',
        viewFriends: 'Tout le monde',
        inviteActivity: 'Tout le monde',
        viewProfil: 'Public',
    });

    const options: Record<VisibilityField, string[]> = {
        addFriend: ['Tout le monde', 'Hommes', 'Femmes', 'Non-binaires', 'Privé'],
        viewFriends: ['Tout le monde', 'Mes Amis', 'Pro/Asso', 'Privé'],
        inviteActivity: ['Tout le monde', 'Mes Amis', 'Pro/Asso', 'Privé'],
        viewProfil: ['Public', 'Privé'],
    };

    const labels: Record<VisibilityField, string> = {
        addFriend: "M'ajouter en ami",
        viewFriends: "Voir mes amis dans mon profil",
        inviteActivity: "M'inviter à une activité",
        viewProfil: "Voir mon profil",
    };

    const handleToggle = useCallback(async (field: PrivacyBoolField, newValue: boolean) => {
        try {
            await userService.updateProfile({ [field]: newValue });
            await refreshUser();
            Toast.show({
                type: 'success',
                text1: 'Paramètre mis à jour',
                position: 'top',
                topOffset: 60,
            });
        } catch {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: 'Impossible de mettre à jour le paramètre',
                position: 'top',
                topOffset: 60,
            });
        }
    }, [refreshUser]);

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
                    {/* Mode fantôme toggle */}
                    <View className={`mb-4 ${isDarkMode ? "bg-black" : "bg-white"} p-4 rounded-lg`}>
                        <PrivacyToggle
                            label="Mode fantôme"
                            description="Masquer votre profil des découvertes"
                            value={user?.is_ghost_mode ?? false}
                            field="is_ghost_mode"
                            onToggle={handleToggle}
                        />
                    </View>

                    {/* Visibility options */}
                    {(Object.keys(options) as VisibilityField[]).map((key) => (
                        <View key={key} className={`mb-4 ${isDarkMode ? "bg-black" : "bg-white"} p-4 rounded-lg`}>
                            <Text className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>
                                {labels[key]}
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {options[key].map((option) => (
                                    <Pressable
                                        key={option}
                                        onPress={() => setSelected((prev) => ({ ...prev, [key]: option }))}
                                        className={`px-4 py-2 rounded-lg ${selected[key] === option ? isDarkMode
                                            ? 'bg-[#1A6EDE] text-white'
                                            : 'bg-[#065C98] text-white'
                                            : isDarkMode
                                                ? 'border-[0.3px] border-white'
                                                : 'border border-[#065C98] text-[#065C98]'}`}
                                    >
                                        <Text className={`${selected[key] === option ? isDarkMode
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

export default AccountPrivacyPerson;
