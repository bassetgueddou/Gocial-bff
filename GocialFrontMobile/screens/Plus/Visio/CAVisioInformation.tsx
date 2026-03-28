import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import React, { useState } from "react";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useCreateActivity } from "../../../src/contexts/CreateActivityContext";
import AddressAutocomplete from "../../../src/components/AddressAutocomplete";
import type { AddressAutocompleteResult } from "../../../src/types";

const ProgressBar = ({ current, total }: { current: number; total: number }) => {
    const { isDarkMode } = useTheme();
    return (
        <View className="flex-row justify-center items-center gap-2 py-3">
            {Array.from({ length: total }, (_, i) => (
                <View
                    key={i}
                    className={`h-2 rounded-full ${i < current ? 'w-8 bg-[#065C98]' : isDarkMode ? 'w-2 bg-gray-700' : 'w-2 bg-gray-300'}`}
                />
            ))}
        </View>
    );
};

type RootStackParamList = {
    CAVisioRestriction: undefined;
    Main: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;


const CAVisioInformation: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { updateForm, formData } = useCreateActivity();

    const [selectedOption, setSelectedOption] = useState<"partout" | "ville">("partout");
    const [city, setCity] = useState(formData.city || "");

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [date, setDate] = useState<Date | null>(formData.date ? new Date(formData.date) : null);
    const [link, setLink] = useState(formData.visio_link || "");

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (event.type === 'dismissed') return;
        if (selectedDate) {
            const newDate = date ? new Date(date) : new Date();
            newDate.setFullYear(selectedDate.getFullYear());
            newDate.setMonth(selectedDate.getMonth());
            newDate.setDate(selectedDate.getDate());
            setDate(newDate);
            updateForm({ date: newDate.toISOString() });
            if (Platform.OS === 'android') {
                setShowTimePicker(true);
            }
        }
    };

    const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (event.type === 'dismissed') return;
        if (selectedTime) {
            const newDate = date ? new Date(date) : new Date();
            newDate.setHours(selectedTime.getHours());
            newDate.setMinutes(selectedTime.getMinutes());
            setDate(newDate);
            updateForm({ date: newDate.toISOString() });
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

            <ProgressBar current={2} total={5} />

            {/* ScrollView contenant tout le contenu */}
            <ScrollView className={`${isDarkMode ? "bg-black" : "bg-white"} min-h-screen`} contentContainerStyle={{ paddingBottom: 300 }}>

                {/* Label obligatoire */}
                <Text className={`text-base ${isDarkMode ? "text-white" : "text-black"} mb-2 px-1`}>
                    <Text className="text-red-600 text-xl">*</Text> Obligatoire
                </Text>

                {/* Titre */}
                <Text className={`${isDarkMode ? "text-white" : ""} text-lg font-semibold mb-2 px-2`}>Lieu</Text>

                {/* Boutons Partout / Ville */}
                <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-gray-100"} flex-row p-2 justify-center rounded-md mb-4`}>
                    <TouchableOpacity
                        className={`mr-2 w-[30%] items-center justify-center px-4 py-1 rounded-md ${selectedOption === "partout"
                            ? isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"
                            : isDarkMode ? "border-[0.3px] border-white" : "border border-[#065C98]"
                            }`}
                        onPress={() => setSelectedOption("partout")}
                    >
                        <Text className={`text-base ${selectedOption === "partout" ? "text-white" : isDarkMode ? "text-white" : "text-[#065C98]"}`}>Partout</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={`ml-2 items-center justify-center w-[30%] px-4 py-1 rounded-md ${selectedOption === "ville"
                            ? isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"
                            : isDarkMode ? "border-[0.3px] border-white" : "border border-[#065C98]"
                            }`}
                        onPress={() => setSelectedOption("ville")}
                    >
                        <Text className={`text-base ${selectedOption === "ville" ? "text-white" : isDarkMode ? "text-white" : "text-[#065C98]"}`}>Ville</Text>
                    </TouchableOpacity>
                </View>

                {/* Champ de recherche si "Ville" est sélectionné */}
                {selectedOption === "ville" && (
                    <Text className={`text-lg mb-1 px-2 font-semibold ${isDarkMode ? "text-white" : ""}`}>Ville</Text>
                )}
                {selectedOption === "ville" && (
                    <View className={`${isDarkMode ? "bg-black" : "bg-gray-100"} p-3 rounded-md space-x-2 mb-4`}>
                        <AddressAutocomplete
                            onSelect={(result: AddressAutocompleteResult) => {
                                setCity(result.city || result.address);
                                updateForm({ city: result.city || result.address });
                            }}
                            onChangeText={setCity}
                            placeholder="Rechercher une ville"
                            isDarkMode={isDarkMode}
                            initialValue={city}
                        />
                    </View>
                )}

                <View>
                    {/* HORAIRE - DATE */}
                    <View>
                        <Text className={`${isDarkMode ? "text-white" : ""} text-lg font-medium mb-1 px-2`}>
                            Horaire - Date <Text className="text-red-600">*</Text>
                        </Text>

                        <View className={`${isDarkMode ? "bg-black" : "bg-gray-100"} p-3 rounded-md`}>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                className={`flex-row justify-between items-center border rounded-md px-4 py-3 ${isDarkMode ? "bg-[#1D1E20] border-white" : "bg-white border-[#065C98]"}`}
                            >
                                <Text className={`text-base ${isDarkMode ? "text-[#9EA1AB]" : ""}`}>Date & Heure</Text>
                                <Text className={`${isDarkMode ? "text-white" : ""}`}>{formattedDate}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* iOS : picker datetime unique */}
                        {Platform.OS === 'ios' && showDatePicker && (
                            <DateTimePicker
                                mode="datetime"
                                display="spinner"
                                value={date || new Date()}
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (event.type === 'dismissed') return;
                                    if (selectedDate) {
                                        setDate(selectedDate);
                                        updateForm({ date: selectedDate.toISOString() });
                                    }
                                }}
                                minimumDate={new Date()}
                                textColor={isDarkMode ? "white" : ""}
                            />
                        )}

                        {/* Android : date picker (étape 1) */}
                        {Platform.OS === 'android' && showDatePicker && (
                            <DateTimePicker
                                mode="date"
                                display="default"
                                value={date || new Date()}
                                onChange={onDateChange}
                                minimumDate={new Date()}
                            />
                        )}

                        {/* Android : time picker (étape 2, après sélection de la date) */}
                        {Platform.OS === 'android' && showTimePicker && (
                            <DateTimePicker
                                mode="time"
                                display="default"
                                value={date || new Date()}
                                onChange={onTimeChange}
                            />
                        )}
                    </View>

                    {/* LIEN */}
                    <View className="mt-4">
                        <View className="flex-row justify-between items-center mb-1">
                            <Text className={`text-lg font-medium px-2 ${isDarkMode ? "text-white" : ""}`}>
                                Lien <Text className="text-red-600">*</Text>
                            </Text>
                            <Text className={`text-sm pr-1 ${isDarkMode ? "text-white" : ""}`}>(exemple : https://visio.com)</Text>
                        </View>

                        <View className={`${isDarkMode ? "bg-black" : "bg-gray-100"} p-3 rounded-md`}>
                            <TextInput
                                placeholder="https://"
                                placeholderTextColor="#999"
                                className={`border ${isDarkMode ? "bg-[#1D1E20] text-white border-white" : "border-[#065C98] bg-white text-black"} rounded-md px-4 py-3 `}
                                value={link}
                                onChangeText={setLink}
                                keyboardType="url"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <Text className={`text-xs mt-2 px-2 ${isDarkMode ? "text-white" : ""}`}>
                            <Text className={`font-semibold ${isDarkMode ? "text-white" : ""}`}>Le lien</Text> ne sera affiché qu’aux participants (et accepté si option cochée) de l’activité
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View className="absolute bottom-[2rem] right-4">
                <TouchableOpacity onPress={() => {
                    if (!date) {
                        Toast.show({ type: 'error', text1: 'Champ obligatoire', text2: 'Veuillez remplir tous les champs obligatoires', position: 'top', topOffset: 60 });
                        return;
                    }
                    if (!link.trim()) {
                        Toast.show({ type: 'error', text1: 'Champ obligatoire', text2: 'Veuillez remplir tous les champs obligatoires', position: 'top', topOffset: 60 });
                        return;
                    }
                    updateForm({
                        date: date.toISOString(),
                        visio_link: link || undefined,
                        city: selectedOption === 'ville' ? city : undefined,
                    });
                    navigation.navigate("CAVisioRestriction");
                }}
                    className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} px-6 py-3 rounded-2xl`}>
                    <Text className="text-white font-semibold">Continuer 2/5</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

export default CAVisioInformation;
