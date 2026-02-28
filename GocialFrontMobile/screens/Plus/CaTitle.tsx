import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import React, { useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    CAVisioPreview: undefined;
    Main: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

const CANumberParticipants: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    return (
        <View className="flex-1">
            {/* HEADER */}
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        Créer une activité 5/5
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
                    <Text className={`text-base font-medium mb-2 mt-4 px-2 ${isDarkMode ? "text-white" : ""}`}>
                        Titre de ton activité <Text className="text-red-600">*</Text>
                    </Text>

                    <View className={`${isDarkMode ? "bg-black" : "bg-[#F2F5FA]"} p-2`}>
                        <TextInput
                            placeholder="Par exemple : Conversation Anglais en ligne"
                            placeholderTextColor={isDarkMode ? "#9EA1AB" : "#737373"}
                            className={`border ${isDarkMode ? "bg-[#1D1E20] text-white border-white" : "border-[#065C98] bg-white text-black"} rounded-md px-4 py-3 `}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>
                </View>

                <View className={`${isDarkMode ? "bg-black" : "bg-white"} mt-4`}>
                    <Text className={`text-base font-medium mb-2 px-2 ${isDarkMode ? "text-white" : ""}`}>
                        Description de l’activité <Text className="text-red-600">*</Text>
                    </Text>

                    <View className={`${isDarkMode ? "bg-black" : "bg-[#F2F5FA]"} p-2 rounded-md`}>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Par exemple : Discutons de l’actualité du jour en anglais, dans un esprit conviviale. Tout les niveaux sont les bienvenus."
                            className={`${isDarkMode ? "bg-[#1D1E20] border-[0.3px] border-white" : "bg-white border border-[#065C98]"} rounded-md px-3 py-2 text-base h-[10rem] text-left`}
                            placeholderTextColor={isDarkMode ? "#9EA1AB" : "#737373"}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                <TouchableOpacity className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                    {/* Titre */}
                    <Text className="text-base font-medium mt-4 px-2">
                        Image par défaut (modifiable)
                    </Text>
                    <Text className="text-sm font-medium mb-3 px-2 text-[#727683]">
                       (L'image ne doit pas dépasser 300ko)
                    </Text>

                    {/* Image avec bouton en overlay */}
                    <View className="relative overflow-hidden">
                        <Image
                            source={require("../../img/billard-exemple.jpg")}
                            className="w-full h-56"
                            resizeMode="cover"
                        />
                        <Text className="px-2 mt-1 text-[#FF0000]">Ton image dépasse 300ko !</Text>
                        <Text className="px-2 mt-1 text-[#FF0000]">(Choisis une autre image, ou compresse celle-ci)</Text>

                        {/* Bouton d'édition */}
                        <View className="absolute top-2 left-2 bg-[#D9D9D9] rounded-xl p-2">
                            <Image source={require("../../img/add-img.png")} className="h-8 w-8" />
                        </View>
                    </View>
                </TouchableOpacity>

            </ScrollView>


            <View className={`absolute bottom-0 left-0 right-0 ${isDarkMode ? 'bg-black' : 'bg-white'} 
                                                     px-4 py-4 flex-row justify-end items-center`}
                style={{ height: 80 }} >

                <TouchableOpacity onPress={() => navigation.navigate("CAVisioPreview")} className={`px-8 py-3 ${isDarkMode ? 'bg-[#1A6EDE]' : 'bg-[#065C98]'} rounded-lg`}>
                    <Text className="text-white font-bold">Aperçu</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

export default CANumberParticipants;
