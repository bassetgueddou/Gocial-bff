import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    Dimensions,
    FlatList,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { runOnJS } from "react-native-reanimated";
import { useTheme } from "../ThemeContext";
import Premium from "../Notification/Premium";
import TypeMessageView from "./TypeMessageView";
import RequestMessageView from "./RequestMessageView";
import NewMessageView from "./NewMessageView";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// Typage navigation
type RootStackParamList = {
    PremiumOfferPerson: undefined;
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
    { id: "1", name: "Cécile Eden", initials: "CE", message: "Bonsoir", date: "lun. - 20h00", unread: false, avatarColor: "bg-blue-400", borderColor: "border-green-400" },
    { id: "2", name: "Quentin Dupont", initials: "QD", message: "Je suis là à 19h.", date: "2 oct. - 20h00", unread: true, avatarColor: "bg-blue-400", borderColor: "border-gray-300" },
    { id: "3", name: "Caroline Frank", initials: "CF", message: "Hello World !", date: "01/09/2024", unread: true, avatarColor: "bg-blue-400", borderColor: "border-gray-300" },
];

interface MessageModalProps {
    visible: boolean;
    onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ visible, onClose }) => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [isTypeMessageViewVisible, setIsTypeMessageViewVisible] = useState(false);
    const [isRequestMessageViewVisible, setIsRequestMessageViewVisible] = useState(false);
    const [isNewMessageViewVisible, setIsNewMessageViewVisible] = useState(false);


    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 100) {
                runOnJS(onClose)(); // Utilisation de runOnJS pour éviter l'erreur
            }
        });


    return (
        <Modal visible={visible} animationType="slide" transparent>
            <GestureDetector gesture={panGesture}>
                <View className="flex-1 justify-end">

                    <View className={`w-full h-[88%] ${isDarkMode ? "bg-black" : "bg-white"} rounded-t-2xl p-5`}>
                        {isRequestMessageViewVisible ? (
                            <RequestMessageView
                                onClose={() => setIsRequestMessageViewVisible(false)}
                            />
                        ) : isTypeMessageViewVisible ? (
                            <TypeMessageView
                                onClose={() => setIsTypeMessageViewVisible(false)}
                            />
                        ) : isNewMessageViewVisible ? (
                            <NewMessageView
                                onClose={() => setIsNewMessageViewVisible(false)} user={{
                                    id: "",
                                    name: "",
                                    age: 0,
                                    location: "",
                                    username: "",
                                    avatar: 0,
                                    type: "Pro"
                                }} />
                        ) : (
                            <>
                                <View className="flex-row justify-center">
                                    {/* Bouton de fermeture aligné à gauche */}
                                    <TouchableOpacity onPress={onClose} className="relative right-[9.2rem]">
                                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                                    </TouchableOpacity>

                                    {/* Icône et texte */}
                                    <View className="flex-row items-center justify-center space-x-2">
                                        <Text className={`text-lg font-bold ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>Messages</Text>
                                    </View>

                                    <TouchableOpacity onPress={() => setIsNewMessageViewVisible(true)} className="relative left-[8.5rem]">
                                        <MaterialIcons name="person-add" size={25} color={isDarkMode ? "white" : "black"} />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity onPress={() => setIsRequestMessageViewVisible(true)} className={`self-end px-3 py-1 rounded-md border ${isDarkMode ? "bg-[#1A6EDE]" : "border-gray-400 bg-blue-300"} my-4`}>
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"} text-sm font-medium`}>+ 1 demande</Text>
                                </TouchableOpacity>

                                <Premium
                                    onPress={() => {
                                        onClose(); // ferme la modal
                                        navigation.navigate("PremiumOfferPerson"); // navigation vers écran premium
                                    }}
                                />

                                <FlatList
                                    className="mt-3"
                                    data={messages}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity onPress={() => setIsTypeMessageViewVisible(true)}
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
                </View>
            </GestureDetector>
        </Modal>
    );
};

export default MessageModal;
