import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../ThemeContext";
import Premium from "../Notification/Premium";
import RequestTypeMessageView from "./RequestTypeMessageView";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { messageService } from "../../src/services/messages";
import dayjs from "dayjs";

type RootStackParamList = {
    Premium: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface RequestMessageViewProps {
    onClose: () => void;
}

const RequestMessageView: React.FC<RequestMessageViewProps> = ({ onClose }) => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            const data = await messageService.getRequests();
            setRequests(data.requests || []);
        } catch {
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const getInitials = (req: any) => {
        const u = req.sender || req.user || req;
        const f = (u.first_name || u.pseudo || "")[0] || "";
        const l = (u.last_name || "")[0] || "";
        return (f + l).toUpperCase() || "?";
    };

    const getName = (req: any) => {
        const u = req.sender || req.user || req;
        return u.pseudo || `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Utilisateur";
    };

    if (selectedRequest) {
        const u = selectedRequest.sender || selectedRequest.user || selectedRequest;
        return (
            <RequestTypeMessageView
                onClose={() => { setSelectedRequest(null); fetchRequests(); }}
                senderId={u.id}
                senderName={getName(selectedRequest)}
                senderInitials={getInitials(selectedRequest)}
            />
        );
    }

    return (
        <View className="flex-1">
            <View className="flex-row justify-center mb-8">
                <TouchableOpacity onPress={onClose} className="relative right-[5.2rem]">
                    <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                </TouchableOpacity>
                <View className="flex-row items-center justify-center space-x-2">
                    <Text className={`text-lg font-bold mr-3 ${isDarkMode ? "text-white" : "text-black"}`}>Demandes de messages</Text>
                </View>
            </View>

            <Premium onPress={() => navigation.navigate("Premium")} />

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#065C98" />
                </View>
            ) : (
                <FlatList
                    className="mt-3"
                    data={requests}
                    keyExtractor={(item: any) => String(item.id || item.sender?.id || Math.random())}
                    renderItem={({ item }) => {
                        const name = getName(item);
                        const init = getInitials(item);
                        const sender = item.sender || item.user || item;
                        const lastMsg = item.last_message?.content || item.content || "";
                        const lastDate = item.last_message?.sent_at || item.sent_at || "";

                        return (
                            <TouchableOpacity
                                onPress={() => setSelectedRequest(item)}
                                className="flex-row items-center py-3 px-1"
                            >
                                {sender.avatar_url ? (
                                    <Image source={{ uri: sender.avatar_url }} className="w-12 h-12 rounded-full" />
                                ) : (
                                    <View className="w-12 h-12 bg-blue-400 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                        <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold`}>{init}</Text>
                                    </View>
                                )}
                                <View className="flex-1 ml-3">
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"} font-bold`}>{name}</Text>
                                    <Text className={`${isDarkMode ? "text-white" : "text-black"}`} numberOfLines={1}>{lastMsg}</Text>
                                </View>
                                <View className="items-end">
                                    {lastDate ? <Text className={`${isDarkMode ? "text-white" : "text-gray-500"} text-sm`}>{dayjs(lastDate).format("D MMM")}</Text> : null}
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-10">
                            <Text className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Aucune demande</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

export default RequestMessageView;
