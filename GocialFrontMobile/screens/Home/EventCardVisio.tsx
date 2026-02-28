import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Pressable } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useTheme } from "../ThemeContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import ShareModal from "./ShareModal";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    ActivityOverview: undefined;
    ProfilPersonOverview: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

interface EventCardProps {
    id: number;
    image: any;
    title: string;
    date: string;
    category: string;
    currentParticipants: number;
    totalParticipants: number;
    userInitials: string;
}

const EventCardVisio: React.FC<EventCardProps> = ({
    id,
    image,
    title,
    date,
    category,
    currentParticipants,
    totalParticipants,
    userInitials,
}) => {
    const [liked, setLiked] = useState<boolean>(false);
    const [likesCount, setLikesCount] = useState<number>(0);
    const { isDarkMode } = useTheme();

    const handleLike = () => {
        setLiked(!liked);
        setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    };

    const navigation = useNavigation<NavigationProp>();
    const [modalShareVisible, setModalShareVisible] = useState(false);

    return (
        <TouchableOpacity onPress={() => navigation.navigate("ActivityOverview")} className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} shadow-md pl-1 pr-2 py-4 pt-4 w-full mt-2`}
            style={{
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.9,
                shadowRadius: 4,
                elevation: 4,
            }}>
            <ShareModal visible={modalShareVisible} onClose={() => setModalShareVisible(false)} />

            <View className={`flex-row items-start`}>
                {/* Event Image */}
                <Image className={`h-[90px] w-[120px] rounded-lg`} source={require("../../img/billard-exemple.jpg")} />

                {/* Event Details */}
                <View className={`ml-4 flex-1`}>
                    <Text className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>{title}</Text>
                    <Text className={`text-sm ${isDarkMode ? "text-white" : "text-black"}`}>{date}</Text>
                    <View className={`flex-row items-center mt-1`}>
                        <Image source={require("../../img/videoconference.png")} className="h-4 w-4" />
                        <Text className={`text-sm ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>Visio</Text>
                    </View>
                </View>

                {/* User Badge */}
                <TouchableOpacity onPress={() => navigation.navigate("ProfilPersonOverview")} className={`bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center`}>
                    <Text className={`text-white font-semibold`}>{userInitials}</Text>
                </TouchableOpacity>
            </View>

            {/* Participants and Likes alignés à droite */}
            <View className={`flex-row justify-end items-center gap-1 absolute bottom-2 left-[19rem]`}>
                <View className={`flex-row items-center`}>
                    <Image source={require("../../img/people.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} className={`${isDarkMode ? "relative top-[0.1rem]" : ""} h-4 w-4`} />
                    <Text className={`text-xs ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>{currentParticipants}/{totalParticipants}</Text>
                </View>

                <Pressable
                    onPress={handleLike}
                    className={`ml-1 flex-row items-center ${isDarkMode ? "bg-black" : "bg-[#F3F3F3]"} rounded-xl p-2`}
                    style={({ pressed }) => [
                        { opacity: pressed ? 0.6 : 1 },
                    ]}
                >
                    <MaterialIcons
                        name={liked ? "favorite" : "favorite-border"}
                        size={11}
                        color={liked ? "red" : isDarkMode ? "white" : "black"}
                    />
                    <Text className={`text-xs ${isDarkMode ? "text-white" : "text-black"}`} style={{ minWidth: 16, textAlign: "center" }}>
                        {likesCount}
                    </Text>
                </Pressable>

                <TouchableOpacity onPress={() => setModalShareVisible(true)} className={`${isDarkMode ? "bg-black" : "bg-[#F3F3F3]"}  rounded-xl p-[0.7rem]`}>
                    <FontAwesome name="share" size={11} color={isDarkMode ? "white" : "black"} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export default EventCardVisio;
