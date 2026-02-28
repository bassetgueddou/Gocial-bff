import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform, Pressable, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import React, { useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import LinearGradient from "react-native-linear-gradient";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    CATitle: undefined;
    Main: undefined;
    PremiumOfferPerson: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

const CANumberParticipants: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [maxParticipants, setMaxParticipants] = useState(3);
    const [nonGocialParticipants, setNonGocialParticipants] = useState(3);

    return (
        <View className="flex-1">
            {/* HEADER */}
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        Créer une activité 4/5
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Main")}>
                        <MaterialIcons name="close" size={25} color="red" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* ScrollView contenant tout le contenu */}
            <ScrollView className={`${isDarkMode ? "bg-black" : "bg-white"} min-h-screen`} contentContainerStyle={{ paddingBottom: 300 }}>

                {/* Label obligatoire */}
                <Text className={`text-base ${isDarkMode ? "text-white" : "text-black"} mb-2 px-1`}>
                    <Text className="text-red-600 text-xl">*</Text> Obligatoire
                </Text>

                {/* Nombre de participants maximum */}
                <Text className={`font-medium text-base mb-3 px-3 ${isDarkMode ? "text-white" : ""}`}>
                    Nombre de participants maximum <Text className="text-red-600">*</Text>
                </Text>

                <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} p-4 rounded-md`}>
                    <View className="items-center">
                        <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : ""}`}>{maxParticipants}</Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-2">
                        <Text className={`${isDarkMode ? "text-white" : ""}`}>0</Text>
                        <View className="flex-1 mx-2 relative justify-center">
                            <Slider
                                value={maxParticipants}
                                onValueChange={setMaxParticipants}
                                minimumValue={0}
                                maximumValue={50}
                                step={1}
                                minimumTrackTintColor="#3B82F6"
                                maximumTrackTintColor={isDarkMode ? "white" : ""}
                                thumbTintColor="#3B82F6"
                            />
                        </View>
                        <Text className={`${isDarkMode ? "text-white" : ""}`}>50</Text>
                    </View>
                </View>

                {/* Premium + */}
                <TouchableOpacity className="mt-4" onPress={() => navigation.navigate("PremiumOfferPerson")}>
                    <LinearGradient
                        colors={["#C3AE79", "#AC9A6B", "#8B794B"]}
                        locations={[0.32, 0.56, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }} // Dégradé horizontal
                        style={{
                            height: 60,
                            borderRadius: 5,
                            justifyContent: "center",
                            alignItems: "center", // Centre le contenu horizontalement
                            paddingHorizontal: 10,
                        }}
                    >
                        <View style={{ justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ color: "black", fontWeight: "bold", fontSize: 16 }}>
                                Passe à Gosial Premium +
                            </Text>
                            <Text style={{ color: "black", fontSize: 14 }}>
                                Augmente le nombre maximum de participants
                            </Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Nombre de participants hors Gocial */}
                <Text className={`font-medium text-base mt-10 px-2 ${isDarkMode ? "text-white" : ""}`}>
                    Nombre de participants hors Gocial déjà avec moi
                </Text>

                <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} p-4 rounded-md mt-2`}>

                    <View className="items-center">
                        <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : ""}`}>{nonGocialParticipants}</Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-2">
                        <Text className={`${isDarkMode ? "text-white" : ""}`}>0</Text>
                        <View className="flex-1 mx-2">
                            <Slider
                                value={nonGocialParticipants}
                                onValueChange={setNonGocialParticipants}
                                minimumValue={0}
                                maximumValue={10}
                                step={1}
                                minimumTrackTintColor="#3B82F6"
                                maximumTrackTintColor={isDarkMode ? "white" : ""}
                                thumbTintColor="#3B82F6"
                            />
                        </View>
                        <Text className={`${isDarkMode ? "text-white" : ""}`}>10</Text>
                    </View>
                </View>

                <View className="flex-row justify-between items-center py-3 px-1 mt-2">
                    <View className="flex-row items-center space-x-3">
                        <Text className={`${isDarkMode ? "text-white" : "text-gray-700"} ml-[0.3rem]`}>Parité de genres</Text>
                    </View>
                    <Switch
                        value={isDarkMode}
                        thumbColor="white"
                        trackColor={{ false: "#E5E7EB", true: "black" }}
                        ios_backgroundColor="#E5E7EB"
                        style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }], position: "relative", left: 5 }}
                    />
                </View>

            </ScrollView>

            <View className={`absolute bottom-0 left-0 right-0 ${isDarkMode ? 'bg-black' : 'bg-white'} 
                                         px-4 py-4 flex-row justify-end items-center`}
                style={{ height: 80 }} >

                <TouchableOpacity onPress={() => navigation.navigate("CATitle")} className={`px-8 py-3 ${isDarkMode ? 'bg-[#1A6EDE]' : 'bg-[#065C98]'} rounded-lg`}>
                    <Text className="text-white font-bold">Modifier 4/5</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

export default CANumberParticipants;
