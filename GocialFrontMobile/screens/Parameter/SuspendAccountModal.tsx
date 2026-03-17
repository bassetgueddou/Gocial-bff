import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, TextInput } from 'react-native';
import { useTheme } from "../../screens/ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";


const SuspendAccountModal = ({ visible, onClose, onConfirm }: { visible: boolean; onClose: () => void; onConfirm?: (password: string) => void }) => {
    const { isDarkMode } = useTheme();
    const [password, setPassword] = useState("");

    const handleClose = () => {
        setPassword("");
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black justify-center items-center">

                <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} rounded-3xl w-[70%] px-6 py-6`}>
                    <TouchableOpacity onPress={handleClose} className='flex-row justify-end relative bottom-2'>
                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>

                    <View className="items-center">

                        <Text className={`${isDarkMode ? "text-white" : "text-black"} text-center text-xl mb-5`}>
                            Êtes-vous sûr de vouloir désactiver le compte ?
                        </Text>

                        <View className="flex-row mb-4">
                            <Image source={require("../../img/warning-icon.png")} className="w-5 h-5 relative left-3" />
                            <Text className={`text-sm text-center ${isDarkMode ? "text-white" : "text-black"}`}>Désactiver le compte entraînera la suspension de l'accès à tous les services associés. Vous pourrez le réactiver ultérieurement en vous reconnectant.</Text>
                        </View>

                        <TextInput
                            className={`w-full border rounded-xl px-4 py-3 mb-4 ${isDarkMode ? "border-gray-600 text-white" : "border-gray-300 text-black"}`}
                            placeholder="Entrez votre mot de passe"
                            placeholderTextColor={isDarkMode ? "#888" : "#aaa"}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        <View className='flex-row justify-between gap-x-3 mt-2'>
                            <TouchableOpacity onPress={handleClose} className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} w-[40%] py-3 rounded-full`}>
                                <Text className={`text-white text-center font-semibold text-sm`}>Annuler</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => { if (onConfirm && password) onConfirm(password); }} className={`bg-[#FF4D4D] w-[60%] py-3 rounded-full ${!password ? "opacity-50" : ""}`} disabled={!password}>
                                <Text className={`text-white text-center font-semibold text-sm`}>Désactiver le compte</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default SuspendAccountModal;
