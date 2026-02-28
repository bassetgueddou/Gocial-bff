import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    FlatList,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../ThemeContext";
import Premium from "../Notification/Premium";
import RequestTypeMessageView from "./RequestTypeMessageView";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  Premium: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get("window");

interface Message {
    id: string;
    name: string;
    initials: string;
    message: string;
    date: string;
    unread: boolean;
    avatarColor: string;
    borderColor: string;
}

const messages: Message[] = [
    { id: "1", name: "Cécile Edend", initials: "CE", message: "Bonsoir", date: "lun. - 20h00", unread: false, avatarColor: "bg-blue-400", borderColor: "border-green-400" },
    { id: "2", name: "Quentin Dupont", initials: "QD", message: "Je suis là à 19h.", date: "2 oct. - 20h00", unread: true, avatarColor: "bg-blue-400", borderColor: "border-gray-300" },
    { id: "3", name: "Caroline Frank", initials: "CF", message: "Hello World !", date: "01/09/2024", unread: true, avatarColor: "bg-blue-400", borderColor: "border-gray-300" },
];

interface RequestMessageViewProps {
    onClose: () => void;
}

const RequestMessageView: React.FC<RequestMessageViewProps> = ({ onClose }) => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const [isRequestTypeMessageViewVisible, setIsRequestTypeMessageViewVisible] = useState(false);

    return (
        <View className="flex-1">

            {isRequestTypeMessageViewVisible ? (
                <RequestTypeMessageView
                    onClose={() => setIsRequestTypeMessageViewVisible(false)}
                />
            ) : (
                <>
                    <View className="flex-row justify-center mb-8">
                        {/* Bouton de fermeture aligné à gauche */}
                        <TouchableOpacity onPress={onClose} className="relative right-[5.2rem]">
                            <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                        </TouchableOpacity>

                        {/* Icône et texte */}
                        <View className="flex-row items-center justify-center space-x-2">
                            <Text className={`text-lg font-bold mr-3 ${isDarkMode ? "text-white" : "text-black"}`}>Demandes de messages</Text>
                        </View>
                    </View>

                    <Premium onPress={() => navigation.navigate("Premium")} />


                    <FlatList
                        className="mt-3"
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => setIsRequestTypeMessageViewVisible(true)}
                                className="flex-row items-center py-3 px-1">
                                {/* Avatar avec initiales */}
                                <View className={`w-12 h-12 ${item.avatarColor} rounded-full border-2 ${item.borderColor} flex items-center justify-center`}>
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold`}>{item.initials}</Text>
                                </View>

                                {/* Infos du message */}
                                <View className="flex-1 ml-3">
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold`}>{item.name}</Text>
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>{item.message}</Text>
                                </View>

                                {/* Date & point bleu si non lu */}
                                <View className="items-end">
                                    <Text className={`${isDarkMode ? "text-white" : "text-gray-500"} text-sm`}>{item.date}</Text>
                                    {item.unread && <View className="w-3 h-3 bg-blue-600 rounded-full mt-1" />}
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </>
            )}
        </View>
    );
};

export default RequestMessageView;
