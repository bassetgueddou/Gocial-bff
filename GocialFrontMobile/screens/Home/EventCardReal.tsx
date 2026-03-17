import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Pressable } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useTheme } from "../ThemeContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import ShareModal from "./ShareModal";

type RootStackParamList = {
    ActivityOverview: { activityId: number };
    ProfilPersonOverview: { userId: number };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface EventCardProps {
    id: number;
    image: any;
    title: string;
    date: string;
    location: string;
    category: string | null;
    currentParticipants: number;
    totalParticipants: number;
    userInitials: string;
    isLiked?: boolean;
    likesCount?: number;
    onToggleLike?: (id: number) => void;
    hostId?: number;
}

const EventCardReal: React.FC<EventCardProps> = ({
    id,
    image,
    title,
    date,
    location,
    category,
    currentParticipants,
    totalParticipants,
    userInitials,
    isLiked = false,
    likesCount: propLikesCount = 0,
    onToggleLike,
    hostId,
}) => {
    const [modalShareVisible, setModalShareVisible] = useState(false);
    const { isDarkMode } = useTheme();

    const handleLike = () => {
        onToggleLike?.(id);
    };

    const navigation = useNavigation<NavigationProp>();

    return (
        <TouchableOpacity onPress={() => navigation.navigate("ActivityOverview", { activityId: id })} className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} shadow-md pl-1 pr-2 py-4 pt-4 w-full mt-2`}
            style={{
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.9,
                shadowRadius: 4,
                elevation: 4,
            }}>
            <ShareModal visible={modalShareVisible} onClose={() => setModalShareVisible(false)} />

            <View className={`flex-row items-start`}>
                {/* Event Image */}
                <Image className={`h-[90px] w-[120px] rounded-lg`} source={typeof image === 'string' ? { uri: image } : image} />

                {/* Event Details */}
                <View className={`ml-4 flex-1`}>
                    <Text className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>{title}</Text>
                    <Text className={`text-sm ${isDarkMode ? "text-white" : "text-black"}`}>{date}</Text>
                    <Text className={`text-sm ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>{location}</Text>
                </View>

                {/* User Badge */}
                <TouchableOpacity onPress={() => hostId && navigation.navigate("ProfilPersonOverview", { userId: hostId })} className={`bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center`}>
                    <Text className={`text-white font-semibold`}>{userInitials}</Text>
                </TouchableOpacity>
            </View>

            {/* Participants and Likes alignés à droite */}
            <View className={`flex-row justify-end items-center gap-2 absolute bottom-2 left-[19rem]`}>
                <View className={`flex-row items-center`}>
                    <Image source={require("../../img/people.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} className={`${isDarkMode ? "relative top-[0.1rem]" : ""} h-4 w-4`} />
                    <Text className={`ml-1 text-xs ${isDarkMode ? "text-white" : "text-black"}`}>{currentParticipants}/{totalParticipants}</Text>
                </View>

                <Pressable
                    onPress={handleLike}
                    className={`flex-row items-center ${isDarkMode ? "bg-black" : "bg-[#F3F3F3]"} rounded-xl p-2`}
                    style={({ pressed }) => [
                        { opacity: pressed ? 0.6 : 1 },
                    ]}
                >
                    <MaterialIcons
                        name={isLiked ? "favorite" : "favorite-border"}
                        size={11}
                        color={isLiked ? "red" : isDarkMode ? "white" : "black"}
                    />
                    <Text className={`text-xs ${isDarkMode ? "text-white" : "text-black"}`} style={{ minWidth: 16, textAlign: "center" }}>
                        {propLikesCount}
                    </Text>
                </Pressable>

                <TouchableOpacity onPress={() => setModalShareVisible(true)} className={`${isDarkMode ? "bg-black" : "bg-[#F3F3F3]"}  rounded-xl p-[0.7rem]`}>
                    <FontAwesome name="share" size={11} color={isDarkMode ? "white" : "black"} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export default EventCardReal;
