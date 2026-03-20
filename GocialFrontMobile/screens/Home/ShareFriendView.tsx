import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Switch,
    Share,
    ActivityIndicator,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import { messageService } from "../../src/services/messages";
import type { Activity } from "../../src/types";

interface User {
    id: string;
    name: string;
    initials: string;
    isActive: boolean;
}

interface ShareFriendViewProps {
    users: User[];
    selectedUserIds: string[];
    onToggleUser: (id: string) => void;
    selectAll: boolean;
    onToggleSelectAll: () => void;
    isDarkMode: boolean;
    onBack: () => void;
    activity?: Activity;
}

const ShareFriendView: React.FC<ShareFriendViewProps> = ({
    users,
    selectedUserIds,
    onToggleUser,
    selectAll,
    onToggleSelectAll,
    isDarkMode,
    onBack,
    activity,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sending, setSending] = useState(false);

    const activityLink = activity
        ? `https://gocial.app/activity/${activity.id}`
        : "https://gocial.app";

    const filteredUsers = searchQuery.trim()
        ? users.filter((u) =>
            u.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
        : users;

    const handleCopyLink = useCallback(async () => {
        try {
            await Share.share({ message: activityLink });
        } catch {
            // User cancelled
        }
        Toast.show({
            type: "success",
            text1: "Lien copi\u00e9",
            position: "top",
            topOffset: 60,
        });
    }, [activityLink]);

    const handleShareToSelected = useCallback(async () => {
        if (selectedUserIds.length === 0) return;
        setSending(true);
        try {
            const inviteContent = activity
                ? `Je t'invite \u00e0 rejoindre "${activity.title}" sur Gocial ! ${activityLink}`
                : `Rejoins-moi sur Gocial ! ${activityLink}`;

            await Promise.all(
                selectedUserIds.map((id) =>
                    messageService.sendMessage(Number(id), inviteContent, "activity_invite")
                )
            );
            Toast.show({
                type: "success",
                text1: `Invitation envoy\u00e9e \u00e0 ${selectedUserIds.length} ami${selectedUserIds.length > 1 ? "s" : ""}`,
                position: "top",
                topOffset: 60,
            });
            onBack();
        } catch {
            Toast.show({
                type: "error",
                text1: "Erreur lors de l'envoi des invitations",
                position: "top",
                topOffset: 60,
            });
        } finally {
            setSending(false);
        }
    }, [selectedUserIds, activity, activityLink, onBack]);

    return (
        <View className="relative flex-1">
            {/* Bouton retour */}
            <TouchableOpacity onPress={onBack} className="mb-4">
                <Text className="text-blue-500">{"\u2190"} Retour</Text>
            </TouchableOpacity>

            <Text className={`text-xl mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>
                Partage aupr{"\u00e8"}s de tes amis Gocial !
            </Text>

            {/* Copier le lien */}
            <TouchableOpacity className="flex-row items-center mt-2" onPress={handleCopyLink}>
                <View className={`w-10 h-10 rounded-xl ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F2F2]"} items-center justify-center mr-3`}>
                    <MaterialIcons name="content-copy" size={20} color={isDarkMode ? "white" : "black"} />
                </View>
                <Text className={`text-base ${isDarkMode ? "text-white" : "text-black"}`}>Copier le lien</Text>
            </TouchableOpacity>

            {/* Barre de recherche */}
            <View className={`flex-row items-center mt-5 ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"} rounded-lg px-3 w-full h-10`}>
                <MaterialIcons name="search" size={20} color={isDarkMode ? "white" : "black"} />
                <TextInput
                    className={`flex-1 ml-2 ${isDarkMode ? "text-white" : "text-black"}`}
                    placeholder="Rechercher dans tes amis Gocial"
                    placeholderTextColor={isDarkMode ? "gray" : "black"}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Switch Tout s{"\u00e9"}lectionner */}
            <View className="flex-row items-center justify-between mt-4 px-2 py-3">
                <Text className={`text-lg ${isDarkMode ? "text-white" : "text-black"}`}>Tout s{"\u00e9"}lectionner</Text>
                <Switch
                    value={selectAll}
                    onValueChange={onToggleSelectAll}
                    thumbColor="white"
                    trackColor={{ false: "#ccc", true: isDarkMode ? "#1A6EDE" : "#065C98" }}
                    ios_backgroundColor="#E5E7EB"
                    style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }], position: "relative", left: 7 }}
                />
            </View>

            {/* Liste des utilisateurs */}
            <ScrollView className="mt-2 mb-16" showsVerticalScrollIndicator={false}>
                {filteredUsers.length === 0 ? (
                    <Text className={`text-center mt-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {searchQuery.trim() ? "Aucun ami trouv\u00e9" : "Aucun ami pour le moment"}
                    </Text>
                ) : (
                    filteredUsers.map((user) => (
                        <TouchableOpacity
                            key={user.id}
                            onPress={() => onToggleUser(user.id)}
                            className="flex-row items-center justify-between px-2 py-3"
                        >
                            <View className="flex-row items-center space-x-3">
                                <View
                                    className={`w-10 h-10 rounded-full items-center justify-center bg-sky-400 mr-2
                                        ${user.isActive ? "border-2 border-lime-500" : "border-2 border-gray-200"}`}
                                >
                                    <Text className="text-black font-semibold">{user.initials}</Text>
                                </View>
                                <Text className={`text-base ${isDarkMode ? "text-white" : "text-black"}`}>
                                    {user.name}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => onToggleUser(user.id)}
                                className={`w-5 h-5 rounded-full ${selectedUserIds.includes(user.id)
                                    ? isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"
                                    : "bg-gray-300"}`}
                            />
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Bouton Partager */}
            <View className="absolute bottom-5 right-3">
                <TouchableOpacity
                    className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} rounded-lg px-5 py-2`}
                    onPress={handleShareToSelected}
                    disabled={sending || selectedUserIds.length === 0}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text className="text-white font-semibold">Partager ({selectedUserIds.length})</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ShareFriendView;
