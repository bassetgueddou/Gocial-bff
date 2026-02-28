import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

type Props = {
    visible: boolean;
    name: string;
    onCancel: () => void;
    onConfirm: () => void;
};

const DeleteFriendRequestModal: React.FC<Props> = ({ visible, name, onCancel, onConfirm }) => {
    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                <View className="bg-white rounded-3xl p-6 w-11/12 max-w-md items-center">
                    <Text className="text-center text-base mb-8">
                        Êtes-vous sûr de vouloir supprimer{"\n"}
                        <Text className="font-semibold">{name}</Text> de vos demandes d’amis ?
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
                            <Text className="text-white text-center font-medium">Supprimer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default DeleteFriendRequestModal;
