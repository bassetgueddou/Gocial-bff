import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    Dimensions,
    TextInput,
    Image,
    ImageSourcePropType,
    ScrollView
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { runOnJS } from "react-native-reanimated";
import { useTheme } from "../ThemeContext";
import ShareFriendView from "./ShareFriendView";
import { useFriends } from "../../src/hooks/useFriends";

const { width, height } = Dimensions.get("window");

interface ShareModalProps {
    visible: boolean;
    onClose: () => void;
}

interface SocialItem {
    name: string;
    icon: ImageSourcePropType;
    onPress?: () => void;
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

const ShareModal: React.FC<ShareModalProps> = ({ visible, onClose }) => {
    const { isDarkMode } = useTheme();
    const [isFriendView, setIsFriendView] = useState(false);

    const [showCopiedToast, setShowCopiedToast] = useState(false);
    const { friends } = useFriends();

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 100) {
                runOnJS(onClose)();
            }
        });

    // Map real friends to the format ShareFriendView expects
    const users = friends.map((f: any) => {
        const friend = f.friend || f.user || f;
        const firstName = friend.first_name || friend.company_name || "";
        const lastName = friend.last_name || "";
        const name = friend.company_name || `${firstName} ${lastName}`.trim();
        const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
        return { id: String(friend.id), name, initials, isActive: true };
    });

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


    return (
        <Modal visible={visible} animationType="slide" transparent>
            <GestureDetector gesture={panGesture}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className={`w-full h-[92%] ${isDarkMode ? "bg-black" : "bg-white"} rounded-t-2xl p-5`}>

                        {showCopiedToast && (
                            <View className="absolute top-4 self-center bg-black px-4 py-2 rounded-xl z-50">
                                <Text className="text-white font-semibold">Lien copié 📎</Text>
                            </View>
                        )}

                        {/* Barre pour glisser vers le bas */}
                        <View className="items-center mb-3">
                            <View className="w-10 h-1 bg-gray-400 rounded-full" />
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
                                    onPress={() => {
                                        setShowCopiedToast(true);
                                        setTimeout(() => setShowCopiedToast(false), 2500);
                                      }}
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
                                    <Text className="text-xl mr-2">🎁</Text>
                                    <Text className="text-white text-base font-medium">
                                        Invite tes amis et débloque des récompenses !
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
                                            onPress={platform.onPress}
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
                                    />
                                </View>

                                {/* Liste des amis Gocial à inviter */}
                                <View className="mt-4 space-y-3">
                                    {users.map((user) => (
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

                                            <TouchableOpacity className={`border rounded-xl px-4 py-2 ${isDarkMode ? "bg-[#1D1E20] border-[0.3px] border-white" : "bg-[#F3F3F3] border-gray-300"}`}>
                                                <Text className="text-blue-500 font-medium">+ Inviter</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>

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
                            />
                        )}
                    </View>
                </View>
            </GestureDetector>
        </Modal>
    );
};

export default ShareModal;
