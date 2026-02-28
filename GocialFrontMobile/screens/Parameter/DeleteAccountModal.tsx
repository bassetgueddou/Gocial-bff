import React from 'react';
import { View, Text, Modal, TouchableOpacity, Image } from 'react-native';
import { useTheme } from "../../screens/ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";


const DeleteAccountModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
    const { isDarkMode } = useTheme();

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black justify-center items-center">

                <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} rounded-3xl w-[70%] px-6 py-6`}>
                    <TouchableOpacity onPress={onClose} className='flex-row justify-end relative bottom-2'>
                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>

                    <View className="items-center">

                        <Text className={`${isDarkMode ? "text-white" : "text-black"} text-center text-xl mb-5`}>
                            Etes-vous sûr de vouloir supprimer le compte ?
                        </Text>

                        <View className="flex-row mb-4">
                            <Image source={require("../../img/warning-icon.png")} className="w-5 h-5 relative left-3" />
                            <Text className={`text-sm text-center ${isDarkMode ? "text-white" : "text-black"}`}>Supprimer le compte entraînera la suppression de toutes les données ! </Text>
                        </View>

                        <View className='flex-row justify-between gap-x-3 mt-2'>
                            <TouchableOpacity onPress={onClose} className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} w-[40%] py-3 rounded-full`}>
                                <Text className={`text-white text-center font-semibold text-sm`}>Annuler</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={onClose} className={`bg-black w-[60%] py-3 rounded-full`}>
                                <Text className={`text-[#FF4D4D] text-center font-semibold text-sm`}>Supprimer le compte</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default DeleteAccountModal;
