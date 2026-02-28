import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Switch,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

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
}

const ShareFriendView: React.FC<ShareFriendViewProps> = ({
    users,
    selectedUserIds,
    onToggleUser,
    selectAll,
    onToggleSelectAll,
    isDarkMode,
    onBack
}) => {

    const [showCopiedToast, setShowCopiedToast] = useState(false);

    return (
        <View className="relative flex-1">

            {showCopiedToast && (
                <View className="absolute top-4 self-center bg-black px-4 py-2 rounded-xl z-50">
                    <Text className="text-white font-semibold">Lien copié 📎</Text>
                </View>
            )}

            {/* Bouton retour */}
            <TouchableOpacity onPress={onBack} className="mb-4">
                <Text className="text-blue-500">← Retour</Text>
            </TouchableOpacity>

            <Text className={`text-xl mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>
                Partage auprès de tes amis Gocial !
            </Text>

            {/* Copier le lien */}
            <TouchableOpacity className="flex-row items-center mt-2"
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

            {/* Barre de recherche */}
            <View className={`flex-row items-center mt-5 ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"} rounded-lg px-3 w-full h-10`}>
                <MaterialIcons name="search" size={20} color={isDarkMode ? "white" : "black"} />
                <TextInput
                    className={`flex-1 ml-2 ${isDarkMode ? "text-white" : "text-black"}`}
                    placeholder="Rechercher dans tes amis Gocial"
                    placeholderTextColor={isDarkMode ? "gray" : "black"}
                />
            </View>

            {/* Switch Tout sélectionner */}
            <View className="flex-row items-center justify-between mt-4 px-2 py-3">
                <Text className={`text-lg ${isDarkMode ? "text-white" : "text-black"}`}>Tout sélectionner</Text>
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
                {users.map((user) => (
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
                ))}
            </ScrollView>

            {/* Bouton Partager */}
            <View className="absolute bottom-5 right-3">
                <TouchableOpacity
                    className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} rounded-lg px-5 py-2`}
                >
                    <Text className="text-white font-semibold">Partager ({selectedUserIds.length})</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ShareFriendView;
