import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useTheme } from "../../screens/ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

type Props = {
    visible: boolean;
    name: string;
    onClose: () => void;
    onConfirm: () => void;
};

const FriendRequestModal: React.FC<Props> = ({ visible, onClose, onConfirm, name }) => {
    const { isDarkMode } = useTheme();

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/60 justify-center items-center">

                <View className={`${isDarkMode ? "bg-black" : "bg-white"} rounded-3xl w-[70%] px-6 py-6`}>
                    <TouchableOpacity onPress={onClose} className='flex-row justify-end relative bottom-2'>
                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>

                    <View className="items-center">

                        <Text className={`${isDarkMode ? "text-white" : "text-black"} text-center text-lg mb-5`}>
                            Voulez-vous demander en ami <Text className={`font-bold ${isDarkMode ? "text-white" : "text-black"}`}>{name}</Text> ?
                        </Text>

                        <View className='flex-row justify-between gap-x-3 mt-2'>
                            <TouchableOpacity onPress={onClose} className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} w-[40%] py-3 rounded-full`}>
                                <Text className={`text-white text-center font-semibold text-sm`}>Annuler</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => {onConfirm(); onClose();}} className={`bg-green-600 w-[60%] py-3 rounded-full`}>
                                <Text className={`text-white text-center font-semibold text-sm`}>Demander en ami</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default FriendRequestModal;
