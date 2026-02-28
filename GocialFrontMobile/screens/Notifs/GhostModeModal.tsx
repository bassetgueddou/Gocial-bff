import React, { useState } from 'react';
import { View, Text, Image, Switch, Modal, TouchableOpacity } from 'react-native';
import { useTheme } from "../../screens/ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    PremiumOfferPerson: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

const GhostModeModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(prev => !prev);
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/60 justify-center items-center">

                <View className={`${isDarkMode ? "bg-black" : "bg-white"} rounded-3xl w-[70%] px-6 py-6`}>
                    <TouchableOpacity onPress={onClose} className='flex-row justify-end relative bottom-2'>
                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>

                    <View className="items-center">
                        <Image source={require("../../img/ghost.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} className='h-11 w-11' />

                        {/* Titre */}
                        <Text className={`${isDarkMode ? "text-white" : "text-black"} text-xl font-semibold mb-2`}>
                            Mode fantôme
                        </Text>

                        {/* Description */}
                        <Text className={`${isDarkMode ? "text-white" : "text-black"} text-center text-base mb-5`}>
                            Le mode fantôme permet de voir les{'\n'}profils sans être vu.
                        </Text>

                        {/* Switch */}
                        <Switch
                            value={false}
                            onValueChange={() => {
                                onClose();
                                navigation.navigate("PremiumOfferPerson");
                            }}
                            thumbColor="white"
                            trackColor={{ false: "#ccc", true: "green" }}
                            ios_backgroundColor="#E5E7EB"
                            style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                        />

                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default GhostModeModal;
