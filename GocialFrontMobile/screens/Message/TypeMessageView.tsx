import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import "dayjs/locale/fr"; // Import du locale français
import { useTheme } from "../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

dayjs.locale("fr");

interface Message {
    id: string;
    text: string;
    sender: "me" | "them";
    time: string;
    date: string;
}

interface User {
    id: string;
    name: string;
    initials: string;
}

interface ChatHelpPersonRouteParams {
    user: User;
}


interface TypeMessageViewProps {
    onClose: () => void;
}

const TypeMessageModal: React.FC<TypeMessageViewProps> = ({ onClose }) => {
    const { isDarkMode } = useTheme();

    const [isUnlockBtnVisible, setUnlockBtnVisible] = useState(false);
    const [is3pointsModalVisible, set3pointsModalVisible] = useState(false);
    const [isReportVisible, setReportVisible] = useState(false);
    const [isMessageVisible, setMessageVisible] = useState(true);


    const route = useRoute<RouteProp<Record<string, ChatHelpPersonRouteParams>, string>>();
    const navigation = useNavigation();
    const user = route.params?.user;

    const [messages, setMessages] = useState<Message[]>([
        { id: "1", text: "Bonjour, quel est votre problème ?", sender: "me", time: "23:16", date: "2025-03-06" },
        { id: "2", text: "Hello", sender: "them", time: "23:17", date: "2025-03-06" },
        { id: "3", text: "Merci", sender: "me", time: "10:05", date: "2024-10-02" },
    ]);

    const [newMessage, setNewMessage] = useState("");

    const sendMessage = () => {
        if (newMessage.trim() !== "") {
            const now = dayjs();
            setMessages([
                ...messages,
                {
                    id: `${messages.length + 1}`,
                    text: newMessage,
                    sender: "me",
                    time: now.format("HH:mm"),
                    date: now.format("YYYY-MM-DD"),
                },
            ]);
            setNewMessage("");
        }
    };

    const formatDate = (date: string): string => {
        const messageDate = dayjs(date);
        const today = dayjs();

        if (messageDate.isSame(today, "day")) {
            return "Aujourd'hui";
        } else if (messageDate.isSame(today, "year")) {
            return messageDate.format("ddd D MMM"); // Ex: "lun. 6 mars"
        } else {
            return messageDate.format("ddd D MMM YYYY"); // Ex: "lun. 2 oct. 2022"
        }
    };

    const [reason, setReason] = useState("");

    const handleSubmit = () => {
        console.log("Raison du signalement:", reason);
        // Ajoutez votre logique de soumission ici
    };

    return (
        <View className="flex-1">

            {/* Header */}
            <View className={`mt-2 flex-row items-center`}>
                <TouchableOpacity onPress={onClose}>
                    <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                </TouchableOpacity>
                <View className="flex-row items-center ml-3">
                    <View className="w-10 h-10 rounded-full bg-[#9BD3E8] border-2 border-green-500 flex items-center justify-center">
                        <Text className="text-black font-bold">{user?.initials}</Text>
                    </View>
                    <Text className={`${isDarkMode ? "text-white" : "text-black"} text-lg font-bold ml-2`}>{user?.name}</Text>
                </View>
                <TouchableOpacity className="ml-auto">
                    <MaterialIcons onPress={() => set3pointsModalVisible(true)} name="more-horiz" size={32} color={isDarkMode ? "white" : "black"} />
                </TouchableOpacity>
            </View>


            {isMessageVisible && (
                <View className="flex-1 justify-end">
                    {/* Liste des messages */}
                    <FlatList
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item, index }) => {
                            const showDate = index === 0 || messages[index - 1].date !== item.date;
                            return (
                                <>
                                    {showDate && (
                                        <View className="items-center my-2">
                                            <Text className={`${isDarkMode ? "text-white" : "text-gray-500"} text-xs`}>{formatDate(item.date)}</Text>
                                        </View>
                                    )}
                                    <View className={`mx-2 flex-row my-2 ${item.sender === "me" ? "justify-end" : "justify-start items-center"}`}>
                                        {item.sender === "them" && (
                                            <View className="w-10 h-10 rounded-full bg-[#9BD3E8] flex items-center justify-center mr-2">
                                                <Text className="text-black font-bold">{user?.initials}</Text>
                                            </View>
                                        )}
                                        <View className={`px-3 py-2 rounded-lg 
                                                ${item.sender === "me"
                                                ? "bg-[#1A6EDE]"
                                                : isDarkMode
                                                    ? "bg-[#1D1E20]"
                                                    : "bg-gray-200"}`
                                        }>
                                            <Text className={`text-lg 
                                                    ${item.sender === "me"
                                                    ? "text-white"
                                                    : isDarkMode
                                                        ? "text-white"
                                                        : "text-black"}`
                                            }>
                                                {item.text}
                                            </Text>
                                            <Text className={`text-xs text-right 
                                                    ${item.sender === "me"
                                                    ? "text-[#DADADA]"
                                                    : isDarkMode
                                                        ? "text-[#9EA1AB]"
                                                        : "text-gray-500"}`}>
                                                {item.time}
                                            </Text>
                                        </View>
                                    </View>
                                </>
                            );
                        }}
                    />

                    {/* Champs de saisie */}
                    <View className="px-4 py-3">
                        <TextInput
                            placeholder="Votre message..."
                            placeholderTextColor="#8B8B8B"
                            className={`w-full h-12 leading-[1.5rem] ${isDarkMode ? "bg-[#1D1E20] text-white" : "bg-[#F3F3F3] border-[0.3px] border-[#E2E2E2]"} rounded-xl px-4 text-lg`}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            onSubmitEditing={sendMessage}
                        />
                    </View>
                </View>

            )}

            {isReportVisible && (
                <View className="justify-end flex-1 p-5">
                    {/* Titre */}
                    <Text className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : ""}`}>Signaler</Text>
                    <Text className={`mb-4 ${isDarkMode ? "text-white" : ""}`}>Peux-tu détailler la raison du signalement de Cécile Eden ?</Text>

                    {/* TextInput pour la raison */}
                    <TextInput
                        value={reason}
                        onChangeText={setReason}
                        placeholder="Je signale car..."
                        placeholderTextColor="#8B8B8B"
                        className={`${isDarkMode ? "bg-[#1D1E20] text-white" : "bg-[#F3F3F3]"} w-full h-36 rounded-lg px-4 py-2 text-lg mb-6`}
                        multiline
                    />

                    {/* Boutons */}
                    <View className="flex-row justify-between w-full">
                        <TouchableOpacity onPress={() => { setReportVisible(false); setMessageVisible(true); }} className={`${isDarkMode ? "bg-black border border-[#1A6EDE]" : "bg-[#D9D9D9]"} px-6 py-2 rounded-lg`}>
                            <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"} font-semibold`}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            className={`px-6 py-2 rounded-lg ${isDarkMode ? "bg-[#0A99FE]" : "bg-[#065C98]"}`}
                        >
                            <Text className="text-white font-semibold">Soumettre</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}


            {isUnlockBtnVisible && (
                <View className="justify-center items-center">
                    <TouchableOpacity onPress={() => setUnlockBtnVisible(false)} className={`border border-[#FF4D4D] ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"} rounded-xl py-2 px-4 my-4 w-[60%]`}>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"} text-center text-base`}>Débloquer</Text>
                    </TouchableOpacity>
                </View>
            )}

            {is3pointsModalVisible && (
                <View className="absolute bottom-9 self-center w-full">
                    {/* Premier modal (Supprimer & Bloquer & Signaler) */}
                    <View className={`w-full ${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} rounded-lg shadow-lg`}>
                        <TouchableOpacity onPress={() => set3pointsModalVisible(false)} className={`p-4 border-b ${isDarkMode ? "border-black" : "border-gray-300"}`}>
                            <Text className={`${isDarkMode ? "text-[#F00020]" : "text-red-500"} text-lg text-center`}>Supprimer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { set3pointsModalVisible(false); setUnlockBtnVisible(true); }} className={`p-4 border-b ${isDarkMode ? "border-black" : "border-gray-300"}`}>
                            <Text className={`${isDarkMode ? "text-[#F00020]" : "text-red-500"} text-lg text-center`}>Bloquer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setReportVisible(true); setMessageVisible(false); set3pointsModalVisible(false); }} className="p-4">
                            <Text className={`${isDarkMode ? "text-[#F00020]" : "text-red-500"} text-lg text-center`}>Signaler</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Ajout d'un vrai espace vide entre les deux modals */}
                    <View className="h-1" />

                    {/* Deuxième modal (Annuler) */}
                    <View className={`w-full ${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} rounded-lg shadow-lg`}>
                        <TouchableOpacity onPress={() => set3pointsModalVisible(false)} className="p-4">
                            <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-blue-600"} text-lg text-center`}>Annuler</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

export default TypeMessageModal;
