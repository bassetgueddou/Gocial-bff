import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useTheme } from "../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useConversation } from "../../src/hooks/useMessages";

dayjs.locale("fr");

interface TypeMessageViewProps {
    onClose: () => void;
    partnerId: number;
    partnerName: string;
    partnerInitials: string;
}

const TypeMessageModal: React.FC<TypeMessageViewProps> = ({ onClose, partnerId, partnerName, partnerInitials }) => {
    const { isDarkMode } = useTheme();
    const { messages, loading, send, refresh } = useConversation(partnerId);

    const [isUnlockBtnVisible, setUnlockBtnVisible] = useState(false);
    const [is3pointsModalVisible, set3pointsModalVisible] = useState(false);
    const [isReportVisible, setReportVisible] = useState(false);
    const [isMessageVisible, setMessageVisible] = useState(true);

    const [newMessage, setNewMessage] = useState("");
    const [reason, setReason] = useState("");

    const sendMessage = async () => {
        if (newMessage.trim() !== "") {
            await send(newMessage.trim());
            setNewMessage("");
            refresh();
        }
    };

    const formatDate = (date: string): string => {
        const messageDate = dayjs(date);
        const today = dayjs();
        if (messageDate.isSame(today, "day")) return "Aujourd'hui";
        if (messageDate.isSame(today, "year")) return messageDate.format("ddd D MMM");
        return messageDate.format("ddd D MMM YYYY");
    };

    const handleSubmit = () => {
        console.log("Raison du signalement:", reason);
    };

    // Map API messages to display format
    const displayMessages = messages.map((m: any) => ({
        id: String(m.id),
        text: m.content || m.text || "",
        sender: m.sent_by_me ? "me" : "them",
        time: dayjs(m.sent_at || m.created_at).format("HH:mm"),
        date: dayjs(m.sent_at || m.created_at).format("YYYY-MM-DD"),
    }));

    return (
        <View className="flex-1">
            <View className="mt-2 flex-row items-center">
                <TouchableOpacity onPress={onClose}>
                    <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                </TouchableOpacity>
                <View className="flex-row items-center ml-3">
                    <View className="w-10 h-10 rounded-full bg-[#9BD3E8] border-2 border-green-500 flex items-center justify-center">
                        <Text className="text-black font-bold">{partnerInitials}</Text>
                    </View>
                    <Text className={`${isDarkMode ? "text-white" : "text-black"} text-lg font-bold ml-2`}>{partnerName}</Text>
                </View>
                <TouchableOpacity className="ml-auto">
                    <MaterialIcons onPress={() => set3pointsModalVisible(true)} name="more-horiz" size={32} color={isDarkMode ? "white" : "black"} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#065C98" />
                </View>
            ) : isMessageVisible ? (
                <View className="flex-1 justify-end">
                    <FlatList
                        data={displayMessages}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item, index }) => {
                            const showDate = index === 0 || displayMessages[index - 1].date !== item.date;
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
                                                <Text className="text-black font-bold">{partnerInitials}</Text>
                                            </View>
                                        )}
                                        <View className={`px-3 py-2 rounded-lg ${item.sender === "me" ? "bg-[#1A6EDE]" : isDarkMode ? "bg-[#1D1E20]" : "bg-gray-200"}`}>
                                            <Text className={`text-lg ${item.sender === "me" ? "text-white" : isDarkMode ? "text-white" : "text-black"}`}>
                                                {item.text}
                                            </Text>
                                            <Text className={`text-xs text-right ${item.sender === "me" ? "text-[#DADADA]" : isDarkMode ? "text-[#9EA1AB]" : "text-gray-500"}`}>
                                                {item.time}
                                            </Text>
                                        </View>
                                    </View>
                                </>
                            );
                        }}
                    />
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
            ) : null}

            {isReportVisible && (
                <View className="justify-end flex-1 p-5">
                    <Text className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : ""}`}>Signaler</Text>
                    <Text className={`mb-4 ${isDarkMode ? "text-white" : ""}`}>Peux-tu detailler la raison du signalement de {partnerName} ?</Text>
                    <TextInput
                        value={reason}
                        onChangeText={setReason}
                        placeholder="Je signale car..."
                        placeholderTextColor="#8B8B8B"
                        className={`${isDarkMode ? "bg-[#1D1E20] text-white" : "bg-[#F3F3F3]"} w-full h-36 rounded-lg px-4 py-2 text-lg mb-6`}
                        multiline
                    />
                    <View className="flex-row justify-between w-full">
                        <TouchableOpacity onPress={() => { setReportVisible(false); setMessageVisible(true); }} className={`${isDarkMode ? "bg-black border border-[#1A6EDE]" : "bg-[#D9D9D9]"} px-6 py-2 rounded-lg`}>
                            <Text className={`${isDarkMode ? "text-[#1A6EDE]" : "text-[#065C98]"} font-semibold`}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSubmit} className={`px-6 py-2 rounded-lg ${isDarkMode ? "bg-[#0A99FE]" : "bg-[#065C98]"}`}>
                            <Text className="text-white font-semibold">Soumettre</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {isUnlockBtnVisible && (
                <View className="justify-center items-center">
                    <TouchableOpacity onPress={() => setUnlockBtnVisible(false)} className={`border border-[#FF4D4D] ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F3F3F3]"} rounded-xl py-2 px-4 my-4 w-[60%]`}>
                        <Text className={`${isDarkMode ? "text-white" : "text-black"} text-center text-base`}>Debloquer</Text>
                    </TouchableOpacity>
                </View>
            )}

            {is3pointsModalVisible && (
                <View className="absolute bottom-9 self-center w-full">
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
                    <View className="h-1" />
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
