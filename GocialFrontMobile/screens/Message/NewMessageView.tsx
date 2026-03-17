import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    TextInput,
    Image,
    ActivityIndicator,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../ThemeContext";
import { useFriends } from "../../src/hooks/useFriends";

interface NewMessageViewProps {
    onClose: () => void;
    onSelectUser: (userId: number, name: string, initials: string) => void;
}

const NewMessageView: React.FC<NewMessageViewProps> = ({ onClose, onSelectUser }) => {
    const { isDarkMode } = useTheme();
    const { friends, loading } = useFriends();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredFriends = friends.filter((f: any) => {
        const u = f.user || f;
        const name = u.pseudo || `${u.first_name || ""} ${u.last_name || ""}`.trim();
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getInfo = (item: any) => {
        const u = item.user || item;
        const name = u.pseudo || `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Utilisateur";
        const f = (u.first_name || u.pseudo || "")[0] || "";
        const l = (u.last_name || "")[0] || "";
        const initials = (f + l).toUpperCase() || "?";
        return { id: u.id, name, initials, avatarUrl: u.avatar_url, city: u.city, userType: u.user_type };
    };

    return (
        <View className="flex-1">
            <View className="flex-row justify-center mb-8">
                <TouchableOpacity onPress={onClose} className="relative right-[6.9rem]">
                    <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                </TouchableOpacity>
                <View className="flex-row items-center justify-center space-x-2">
                    <Text className={`text-lg font-bold mr-3 ${isDarkMode ? "text-white" : "text-black"}`}>Nouveau message</Text>
                </View>
            </View>

            <View className={`flex-row items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"} rounded-lg px-3 w-full h-10`}>
                <MaterialIcons name="search" size={20} color={isDarkMode ? "white" : "black"} />
                <TextInput
                    className={`flex-1 ml-2 ${isDarkMode ? "text-white" : "text-black"}`}
                    placeholder="A : Rechercher"
                    placeholderTextColor={isDarkMode ? "gray" : "black"}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                />
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#065C98" />
                </View>
            ) : (
                <FlatList
                    data={filteredFriends}
                    keyExtractor={(item: any) => String(item.friendship_id || item.id || Math.random())}
                    renderItem={({ item }) => {
                        const info = getInfo(item);
                        const typeColor = info.userType === "pro" ? "text-[#8260D2]" : info.userType === "asso" ? "text-[#37A400]" : "";
                        return (
                            <TouchableOpacity
                                onPress={() => onSelectUser(info.id, info.name, info.initials)}
                                className="flex-row items-center p-4"
                            >
                                {info.avatarUrl ? (
                                    <Image source={{ uri: info.avatarUrl }} className="w-[3.5rem] h-[3.5rem] rounded-full" />
                                ) : (
                                    <View className="w-[3.5rem] h-[3.5rem] rounded-full bg-[#065C98] items-center justify-center">
                                        <Text className="text-white font-bold text-lg">{info.initials}</Text>
                                    </View>
                                )}
                                <View className="ml-4 flex-1">
                                    <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>
                                        {info.name}
                                        {typeColor ? <Text className={`${typeColor} font-semibold`}> {info.userType === "pro" ? "Pro" : "Asso"}</Text> : null}
                                    </Text>
                                    {info.city ? <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{info.city}</Text> : null}
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-10">
                            <Text className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Aucun ami trouve</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

export default NewMessageView;
