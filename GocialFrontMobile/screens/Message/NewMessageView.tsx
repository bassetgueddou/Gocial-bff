import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    FlatList,
    TextInput,
    ImageSourcePropType,
    Image,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../ThemeContext";

type User = {
    id: string;
    name: string;
    age: number;
    location: string;
    username: string;
    avatar: ImageSourcePropType;
    type: "Pro" | "Asso";
};

// Liste des utilisateurs
const users: User[] = [
    {
        id: "1",
        name: "Sophie L.",
        age: 24,
        location: "Paris 18",
        username: "@SophieK",
        avatar: require("../../img/little-profil-photo.png"),
        type: "Pro",
    },
    {
        id: "2",
        name: "Sophie L.",
        age: 24,
        location: "Paris 18",
        username: "@SophieK",
        avatar: require("../../img/little-profil-photo.png"),
        type: "Asso",
    },
    {
        id: "3",
        name: "Sophie L.",
        age: 24,
        location: "Paris 18",
        username: "@SophieK",
        avatar: require("../../img/little-profil-photo.png"),
        type: "Pro",
    },
];

const { width, height } = Dimensions.get("window");

interface RequestMessageViewProps {
    onClose: () => void;
    user: User;
}

const RequestMessageView: React.FC<RequestMessageViewProps> = ({ onClose }) => {
    const { isDarkMode } = useTheme();
    const user = users[0];
    const typeColor = user.type === "Pro" ? "text-[#8260D2]" : "text-[#37A400]";

    return (
        <View className="flex-1">
            <View className="flex-row justify-center mb-8">
                {/* Bouton de fermeture aligné à gauche */}
                <TouchableOpacity onPress={onClose} className="relative right-[6.9rem]">
                    <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                </TouchableOpacity>

                {/* Icône et texte */}
                <View className="flex-row items-center justify-center space-x-2">
                    <Text className={`text-lg font-bold mr-3 ${isDarkMode ? "text-white" : "text-black"}`}>Nouveau message</Text>
                </View>
            </View>

            {/* Barre de recherche */}
            <View className={`flex-row items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"} rounded-lg px-3 w-full h-10`}>
                <MaterialIcons name="search" size={20} color={isDarkMode ? "white" : "black"} />
                <TextInput
                    className={`flex-1 ml-2 ${isDarkMode ? "text-white" : "text-black"}`}
                    placeholder="À : Rechercher"
                    placeholderTextColor={isDarkMode ? "gray" : "black"}
                    autoFocus
                />
            </View>

            <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item: user }) => (
                    <TouchableOpacity className="flex-row items-center p-4">
                        <Image source={user.avatar} className="w-[3.5rem] h-[3.5rem] rounded-full" />
                        <View className="ml-4 flex-1">
                            <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>
                                {user.name}{" "}
                                <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{user.age} ans</Text>{" "}
                                <Text className={`${typeColor} font-semibold`}>{user.type}</Text>
                            </Text>
                            <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{user.location}</Text>
                            <Text className={`${isDarkMode ? "text-white" : "text-gray-500"}`}>{user.username}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />



        </View>
    );
};

export default RequestMessageView;
