import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import React, { useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from "react-native-image-picker";
import Toast from "react-native-toast-message";
import { useCreateActivity } from "../../src/contexts/CreateActivityContext";

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
    CAVisioPreview: undefined;
    CARealPreview: undefined;
    Main: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const CATitle: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const { updateForm, formData } = useCreateActivity();

    const [title, setTitle] = useState(formData.title || '');
    const [description, setDescription] = useState(formData.description || '');
    const [imageUri, setImageUri] = useState<string | null>(formData.imageUri || null);
    const [imageTooLarge, setImageTooLarge] = useState(false);

    const handlePickImage = () => {
        launchImageLibrary(
            { mediaType: "photo", quality: 0.8, selectionLimit: 1 },
            (response) => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    Toast.show({
                        type: "error",
                        text1: "Erreur",
                        text2: response.errorMessage || "Impossible d'ouvrir la galerie.",
                        position: "top",
                        topOffset: 60,
                    });
                    return;
                }
                const asset = response.assets?.[0];
                if (asset?.uri) {
                    const uri = Platform.OS === "android" ? asset.uri : asset.uri;
                    setImageUri(uri);
                    updateForm({ imageUri: uri });

                    // Check file size (300 KB = 307200 bytes)
                    const fileSize = asset.fileSize ?? 0;
                    setImageTooLarge(fileSize > 307200);
                }
            }
        );
    };

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

            <ProgressBar current={5} total={5} />

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
                        Description de l'activité <Text className="text-red-600">*</Text>
                    </Text>

                    <View className={`${isDarkMode ? "bg-black" : "bg-[#F2F5FA]"} p-2 rounded-md`}>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Par exemple : Discutons de l'actualité du jour en anglais, dans un esprit convivial. Tous les niveaux sont les bienvenus."
                            className={`${isDarkMode ? "bg-[#1D1E20] border-[0.3px] border-white" : "bg-white border border-[#065C98]"} rounded-md px-3 py-2 text-base h-[10rem] text-left`}
                            placeholderTextColor={isDarkMode ? "#9EA1AB" : "#737373"}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                <View className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
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
                            source={imageUri ? { uri: imageUri } : require("../../img/billard-exemple.jpg")}
                            className="w-full h-56"
                            resizeMode="cover"
                        />
                        {imageUri && imageTooLarge && (
                            <>
                                <Text className="px-2 mt-1 text-[#FF0000]">Ton image dépasse 300ko !</Text>
                                <Text className="px-2 mt-1 text-[#FF0000]">(Choisis une autre image, ou compresse celle-ci)</Text>
                            </>
                        )}

                        {/* Bouton d'édition */}
                        <TouchableOpacity onPress={handlePickImage} className="absolute top-2 left-2 bg-[#D9D9D9] rounded-xl p-2">
                            <Image source={require("../../img/add-img.png")} className="h-8 w-8" />
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>


            <View className={`absolute bottom-0 left-0 right-0 ${isDarkMode ? 'bg-black' : 'bg-white'}
                                                     px-4 py-4 flex-row justify-end items-center`}
                style={{ height: 80 }} >

                <TouchableOpacity onPress={() => {
                    updateForm({ title, description: description || undefined, imageUri: imageUri || undefined });
                    const isVisio = formData.activity_type === 'visio';
                    navigation.navigate(isVisio ? 'CAVisioPreview' : 'CARealPreview');
                }} className={`px-8 py-3 ${isDarkMode ? 'bg-[#1A6EDE]' : 'bg-[#065C98]'} rounded-lg`}>
                    <Text className="text-white font-bold">Aperçu</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

export default CATitle;
