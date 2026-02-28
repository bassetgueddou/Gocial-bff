import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

type Props = {
    visible: boolean;
    name: string;
    onCancel: () => void;
    onConfirm: () => void;
    actionLabel?: "supprimer" | "débloquer";
};

const DeleteConfirmFriendModal: React.FC<Props> = ({ visible, name, onCancel, onConfirm, actionLabel }) => {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                <View className="bg-white p-6 rounded-3xl w-11/12 max-w-md items-center">
                    <Text className="text-center text-base mb-8">
                        Êtes-vous sûr de vouloir {actionLabel}{"\n"}
                        <Text className="font-semibold">{name}</Text>
                        {actionLabel === "supprimer" ? " de vos amis ?" : " ?"}
                    </Text>
                    <View className="flex-row justify-between w-full">
                        <TouchableOpacity
                            className="bg-[#005A9C] px-6 py-3 rounded-full flex-1 mr-2"
                            onPress={onCancel}
                        >
                            <Text className="text-white text-center font-medium">Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-red-500 px-6 py-3 rounded-full flex-1 ml-2"
                            onPress={onConfirm}
                        >
                            <Text className="text-white text-center font-medium">{actionLabel}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default DeleteConfirmFriendModal;
