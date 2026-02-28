import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import React, { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    CAVisioRestriction: undefined;
    Main: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;


const CARealInformation: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [isEditingPlace, setIsEditingPlace] = useState(false);
    const [isEditingMeeting, setIsEditingMeeting] = useState(false);

    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState<Date | null>(null);

    const onChange = (_event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const formattedDate = date
        ? `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${date.getFullYear()} ${date
                .getHours()
                .toString()
                .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
        : "__/__/____ __:__";

    return (
        <View className="flex-1">
            {/* HEADER */}
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        Créer une activité 2/5
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

                <View className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                    {isEditingPlace ? (
                        // === Mode édition ===
                        <View>
                            <Text className={`px-2 text-lg font-medium mb-2 ${isDarkMode ? "text-white" : ""}`}>Nom du lieu</Text>
                            <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-gray-100"} p-3 rounded-md space-x-2 mb-4`}>
                                <TextInput
                                    placeholder="La casa"
                                    placeholderTextColor={isDarkMode ? "#9EA1AB" : "#737373"}
                                    className={`${isDarkMode ? "bg-[#1D1E20] text-white border-white" : "bg-white text-black border-[#065C98]"} border rounded-md px-4 py-3`}
                                />
                            </View>
                        </View>
                    ) : (
                        // === Mode affichage avec icône ===
                        <Pressable
                            onPress={() => setIsEditingPlace(true)}
                            className={`flex-row items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} p-4 rounded-md mb-4`}
                        >
                            {/* Icône + (utilise ton image locale si dispo) */}
                            <Image
                                source={require('../../../img/btnAddActivity.png')} // ← remplace ici par ton icône
                                style={{ width: 24, height: 24 }}
                            />
                            <Text className={`ml-3 text-lg font-medium ${isDarkMode ? "text-white" : ""}`}>Nom du lieu</Text>
                        </Pressable>
                    )}
                </View>

                {/* Champ de recherche "Adresse du lieu" */}
                <Text className={`text-lg mb-1 px-2 font-semibold ${isDarkMode ? "text-white" : ""}`}>Adresse du lieu <Text className="text-red-600 text-xl">*</Text></Text>
                <View className={`${isDarkMode ? "bg-black" : "bg-gray-100"} p-3 rounded-md space-x-2 mb-4`}>
                    <TextInput
                        placeholder="Rechercher une adresse"
                        placeholderTextColor={isDarkMode ? "#9EA1AB" : "#737373"}
                        className={`${isDarkMode ? "bg-[#1D1E20] text-white border-white" : "bg-white text-black border-[#065C98]"} border rounded-md px-4 py-3`}
                    />
                </View>

                <View>
                    {/* HORAIRE - DATE */}
                    <View>
                        <Text className={`${isDarkMode ? "text-white" : ""} text-lg font-medium mb-1 px-2`}>
                            Horaire - Date <Text className="text-red-600">*</Text>
                        </Text>

                        <View className={`${isDarkMode ? "bg-black" : "bg-gray-100"} p-3 rounded-md`}>
                            <TouchableOpacity
                                onPress={() => setShowPicker(true)}
                                className={`flex-row justify-between items-center border rounded-md px-4 py-3 ${isDarkMode ? "bg-[#1D1E20] border-white" : "bg-white border-[#065C98]"}`}
                            >
                                <Text className={`text-base ${isDarkMode ? "text-[#9EA1AB]" : ""}`}>Date & Heure</Text>
                                <Text className={`${isDarkMode ? "text-white" : ""}`}>{formattedDate}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Native DateTime Picker */}
                        {showPicker && (
                            <DateTimePicker
                                mode="datetime"
                                display={Platform.OS === "ios" ? "spinner" : "default"}
                                value={date || new Date()}
                                onChange={onChange}
                                minimumDate={new Date()}
                                textColor={isDarkMode ? "white" : ""}
                            />
                        )}
                    </View>

                    <View className={`${isDarkMode ? "bg-black" : "bg-white"} mt-4`}>
                        {isEditingMeeting ? (
                            // === Mode édition ===
                            <View>
                                <Text className={`px-2 text-lg font-medium mb-2 ${isDarkMode ? "text-white" : ""}`}>Point de rendez-vous</Text>
                                <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-gray-100"} p-3 rounded-md space-x-2 mb-4`}>
                                    <TextInput
                                        placeholder="Rechercher une adresse"
                                        placeholderTextColor={isDarkMode ? "#9EA1AB" : "#737373"}
                                        className={`${isDarkMode ? "bg-[#1D1E20] text-white border-white" : "bg-white text-black border-[#065C98]"} border rounded-md px-4 py-3`}
                                    />
                                </View>
                            </View>
                        ) : (
                            // === Mode affichage avec icône ===
                            <Pressable
                                onPress={() => setIsEditingMeeting(true)}
                                className={`flex-row items-center ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} p-4 rounded-md mt-4`}
                            >
                                {/* Icône + (utilise ton image locale si dispo) */}
                                <Image
                                    source={require('../../../img/btnAddActivity.png')} // ← remplace ici par ton icône
                                    style={{ width: 24, height: 24 }}
                                />
                                <Text className={`ml-3 text-lg font-medium ${isDarkMode ? "text-white" : ""}`}>Point de rendez-vous</Text>
                            </Pressable>
                        )}
                    </View>

                </View>
            </ScrollView>

            <View className="absolute bottom-[5rem] right-4">
                <TouchableOpacity onPress={() => navigation.navigate("CAVisioRestriction")}
                    className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} px-6 py-3 rounded-2xl`}>
                    <Text className="text-white font-semibold">Continuer 2/5</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

export default CARealInformation;
