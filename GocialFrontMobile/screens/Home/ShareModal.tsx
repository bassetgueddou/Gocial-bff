import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    Dimensions,
    TextInput,
    Image,
    ImageSourcePropType,
    ScrollView,
    Share,
    Clipboard,
    ActivityIndicator,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { runOnJS } from "react-native-reanimated";
import { useTheme } from "../ThemeContext";
import ShareFriendView from "./ShareFriendView";
import { useFriends } from "../../src/hooks/useFriends";
import { messageService } from "../../src/services/messages";
import Toast from "react-native-toast-message";
import type { Activity } from "../../src/types";

const { width, height } = Dimensions.get("window");

interface ShareModalProps {
    visible: boolean;
    onClose: () => void;
    activity?: Activity;
}

interface SocialItem {
    name: string;
    icon: ImageSourcePropType;
}

const socialPlatforms: SocialItem[] = [
    {
        name: "Instagram",
        icon: require("../../img/instagram-share.png"),
    },
    {
        name: "Snapchat",
        icon: require("../../img/snapchat-share.png"),
    },
    {
        name: "Whatsapp",
        icon: require("../../img/whatsapp-share.png"),
    },
];

const ShareModal: React.FC<ShareModalProps> = ({ visible, onClose, activity }) => {
    const { isDarkMode } = useTheme();
    const [isFriendView, setIsFriendView] = useState(false);
    const { friends } = useFriends();
    const [searchQuery, setSearchQuery] = useState("");
    const [invitingIds, setInvitingIds] = useState<Set<string>>(new Set());
    const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

    const activityLink = activity
        ? `https://gocial.app/activity/${activity.id}`
        : "https://gocial.app";

    const shareMessage = activity
        ? `Rejoins-moi sur ${activity.title} sur Gocial ! ${activityLink}`
        : `Rejoins-moi sur Gocial ! ${activityLink}`;

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 100) {
                runOnJS(onClose)();
            }
        });

    // Map real friends to the format ShareFriendView expects
    const allUsers = friends.map((f) => {
        const friendUser = f.friend || f.user;
        const firstName = friendUser?.first_name || friendUser?.pseudo || "";
        const name = friendUser?.pseudo || firstName;
        const initials = name.length >= 2
            ? `${name.charAt(0)}${name.charAt(1)}`.toUpperCase()
            : name.charAt(0).toUpperCase() || "?";
        const friendId = friendUser?.id || f.id;
        return { id: String(friendId), name, initials, isActive: true };
    });

    // Filter users by search query
    const users = searchQuery.trim()
        ? allUsers.filter((u) =>
            u.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
        : allUsers;

    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    const toggleUserSelection = (id: string) => {
        setSelectedUserIds((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((userId) => userId !== id)
                : [...prevSelected, id]
        );
    };

    const handleToggleSelectAll = () => {
        if (selectAll) {
            setSelectedUserIds([]);
        } else {
            setSelectedUserIds(users.map((user) => user.id));
        }
        setSelectAll(!selectAll);
    };

    const handleCopyLink = useCallback(() => {
        Clipboard.setString(activityLink);
        Toast.show({
            type: "success",
            text1: "Lien copié",
            position: "top",
            topOffset: 60,
        });
    }, [activityLink]);

    const handleSocialShare = useCallback(async () => {
        try {
            await Share.share({
                message: shareMessage,
                title: activity?.title || "Gocial",
            });
        } catch {
            // User cancelled sharing
        }
    }, [shareMessage, activity?.title]);

    const handleInviteFriend = useCallback(async (friendId: string) => {
        if (invitingIds.has(friendId) || invitedIds.has(friendId)) return;

        setInvitingIds((prev) => new Set(prev).add(friendId));
        try {
            const inviteContent = activity
                ? `Je t'invite \u00e0 rejoindre "${activity.title}" sur Gocial ! ${activityLink}`
                : `Rejoins-moi sur Gocial ! ${activityLink}`;

            await messageService.sendMessage(
                Number(friendId),
                inviteContent,
                "activity_invite"
            );
            setInvitedIds((prev) => new Set(prev).add(friendId));
            Toast.show({
                type: "success",
                text1: "Invitation envoy\u00e9e",
                position: "top",
                topOffset: 60,
            });
        } catch {
            Toast.show({
                type: "error",
                text1: "Erreur lors de l'envoi de l'invitation",
                position: "top",
                topOffset: 60,
            });
        } finally {
            setInvitingIds((prev) => {
                const next = new Set(prev);
                next.delete(friendId);
                return next;
            });
        }
    }, [activity, activityLink, invitingIds, invitedIds]);

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <GestureDetector gesture={panGesture}>
                <View className="flex-1 justify-end bg-black/50">
                    {/* Backdrop pressable pour fermer */}
                    <TouchableOpacity
                        className="absolute inset-0"
                        activeOpacity={1}
                        onPress={onClose}
                    />
                    <View className={`w-full h-[92%] ${isDarkMode ? "bg-black" : "bg-white"} rounded-t-2xl p-5`}>

                        {/* Barre pour glisser vers le bas + bouton fermer */}
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-1 items-center">
                                <View className="w-10 h-1 bg-gray-400 rounded-full" />
                            </View>
                            <TouchableOpacity onPress={onClose} className="p-1">
                                <MaterialIcons name="close" size={22} color={isDarkMode ? "white" : "black"} />
                            </TouchableOpacity>
                        </View>

                        {!isFriendView ? (
                            <View className={`${isDarkMode ? "bg-black" : "bg-white"} w-full rounded-t-2xl`}>
                                <Text className={`text-xl mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>Partager</Text>

                                {/* Option 1: Depuis tes amis */}
                                <TouchableOpacity
                                    onPress={() => setIsFriendView(true)}
                                    className="flex-row items-center mb-4"
                                >
                                    <View className={`w-10 h-10 rounded-xl ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F2F2]"} items-center justify-center mr-3`}>
                                        <Image source={require("../../img/friend.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} className="h-6 w-6" />
                                    </View>
                                    <Text className={`text-base ${isDarkMode ? "text-white" : "text-black"}`}>Depuis tes amis</Text>
                                </TouchableOpacity>

                                {/* Option 2: Copier le lien */}
                                <TouchableOpacity
                                    className="flex-row items-center"
                                    onPress={handleCopyLink}
                                >
                                    <View className={`w-10 h-10 rounded-xl ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F2F2]"} items-center justify-center mr-3`}>
                                        <MaterialIcons name="content-copy" size={20} color={isDarkMode ? "white" : "black"} />
                                    </View>
                                    <Text className={`text-base ${isDarkMode ? "text-white" : "text-black"}`}>Copier le lien</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="bg-[#C837D8] px-2 py-1 rounded-[0.6rem] flex-row items-center justify-center mt-4"
                                    activeOpacity={0.9}
                                >
                                    <Text className="text-xl mr-2">&#127873;</Text>
                                    <Text className="text-white text-base font-medium">
                                        Invite tes amis et d{"\u00e9"}bloque des r{"\u00e9"}compenses !
                                    </Text>
                                </TouchableOpacity>

                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    className="mt-4 px-4"
                                >
                                    {socialPlatforms.map((platform) => (
                                        <TouchableOpacity
                                            key={platform.name}
                                            className="items-center mr-6"
                                            onPress={handleSocialShare}
                                        >
                                            <Image
                                                source={platform.icon}
                                                style={{ width: 60, height: 60 }}
                                                resizeMode="contain"
                                            />
                                            <Text className={`mt-2 ${isDarkMode ? "text-white" : "text-black"} text-sm font-medium`}>
                                                {platform.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* Barre de recherche */}
                                <View className={`flex-row items-center mt-5 ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"} rounded-lg px-3 w-full h-10`}>
                                    <MaterialIcons name="search" size={20} color={isDarkMode ? "white" : "black"} />
                                    <TextInput
                                        className={`flex-1 ml-2 ${isDarkMode ? "text-white" : "text-black"}`}
                                        placeholder="Rechercher dans tes contacts"
                                        placeholderTextColor={isDarkMode ? "gray" : "black"}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                </View>

                                {/* Liste des amis Gocial a inviter */}
                                <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
                                    {users.length === 0 ? (
                                        <Text className={`text-center mt-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                            {searchQuery.trim() ? "Aucun ami trouv\u00e9" : "Aucun ami pour le moment"}
                                        </Text>
                                    ) : (
                                        users.map((user) => (
                                            <View
                                                key={user.id}
                                                className="flex-row items-center justify-between px-1 mt-2"
                                            >
                                                <View className="flex-row items-center">
                                                    <View className={`w-12 h-12 rounded-full ${isDarkMode ? "bg-[#1D1E20]" : "bg-gray-200"} items-center justify-center mr-4`}>
                                                        <Text className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                                                            {user.initials}
                                                        </Text>
                                                    </View>
                                                    <View>
                                                        <Text className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                                                            {user.name}
                                                        </Text>
                                                    </View>
                                                </View>

                                                <TouchableOpacity
                                                    className={`border rounded-xl px-4 py-2 ${
                                                        invitedIds.has(user.id)
                                                            ? isDarkMode ? "bg-green-800 border-green-600" : "bg-green-100 border-green-300"
                                                            : isDarkMode ? "bg-[#1D1E20] border-[0.3px] border-white" : "bg-[#F3F3F3] border-gray-300"
                                                    }`}
                                                    onPress={() => handleInviteFriend(user.id)}
                                                    disabled={invitingIds.has(user.id) || invitedIds.has(user.id)}
                                                >
                                                    {invitingIds.has(user.id) ? (
                                                        <ActivityIndicator size="small" color="#065C98" />
                                                    ) : invitedIds.has(user.id) ? (
                                                        <Text className="text-green-500 font-medium">Invit{"\u00e9"}</Text>
                                                    ) : (
                                                        <Text className="text-blue-500 font-medium">+ Inviter</Text>
                                                    )}
                                                </TouchableOpacity>
                                            </View>
                                        ))
                                    )}
                                </ScrollView>

                            </View>
                        ) : (
                            <ShareFriendView
                                users={users}
                                selectedUserIds={selectedUserIds}
                                onToggleUser={toggleUserSelection}
                                selectAll={selectAll}
                                onToggleSelectAll={handleToggleSelectAll}
                                isDarkMode={isDarkMode}
                                onBack={() => setIsFriendView(false)}
                                activity={activity}
                            />
                        )}
                    </View>
                </View>
            </GestureDetector>
        </Modal>
    );
};

export default ShareModal;
