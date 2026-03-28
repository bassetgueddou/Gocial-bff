import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { launchImageLibrary } from "react-native-image-picker";
import Toast from "react-native-toast-message";
import { useAuth } from "../../src/contexts/AuthContext";
import { userService } from "../../src/services/users";
import { compressImageIfNeeded } from "../../src/utils/imageUtils";
import type { RegisterData } from "../../src/types";

type RootStackParamList = {
    AddProfilePhotoProAsso: { registerData: RegisterData };
    Login: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, "AddProfilePhotoProAsso">;
type ScreenRouteProp = RouteProp<RootStackParamList, "AddProfilePhotoProAsso">;

const AddProfilePhotoProAsso: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { register } = useAuth();

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const registerData = route.params?.registerData;

    const handlePress = async () => {
        const response = await launchImageLibrary({
            mediaType: "photo", quality: 0.8, selectionLimit: 1,
        });
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
            try {
                const uri = await compressImageIfNeeded(asset.uri, asset.fileSize);
                setSelectedImage(uri);
            } catch (err: unknown) {
                Toast.show({
                    type: "error",
                    text1: "Image trop volumineuse",
                    text2: err instanceof Error ? err.message : "Impossible de compresser l'image.",
                    position: "top",
                    topOffset: 60,
                    visibilityTime: 4000,
                });
            }
        }
    };

    const handleFinish = async () => {
        if (!registerData) {
            Toast.show({ type: "error", text1: "Erreur", text2: "Données d'inscription manquantes.", position: "top", topOffset: 60 });
            return;
        }
        setIsLoading(true);
        try {
            await register(registerData);

            if (selectedImage) {
                const fileName = selectedImage.split("/").pop() || "avatar.jpg";
                const fileType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";
                await userService.uploadAvatar({
                    uri: Platform.OS === "android" ? selectedImage : selectedImage.replace("file://", ""),
                    type: fileType,
                    name: fileName,
                });
            }
            // Auth context handles navigation to Main automatically
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { error?: string; message?: string } } };
            const msg =
                apiErr?.response?.data?.error ||
                apiErr?.response?.data?.message ||
                "Erreur lors de l'inscription.";
            Toast.show({ type: "error", text1: "Erreur", text2: msg, position: "top", topOffset: 60 });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = async () => {
        if (!registerData) {
            Toast.show({ type: "error", text1: "Erreur", text2: "Données d'inscription manquantes.", position: "top", topOffset: 60 });
            return;
        }
        setIsLoading(true);
        try {
            await register(registerData);
            // Auth context handles navigation to Main automatically
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { error?: string; message?: string } } };
            const msg =
                apiErr?.response?.data?.error ||
                apiErr?.response?.data?.message ||
                "Erreur lors de l'inscription.";
            Toast.show({ type: "error", text1: "Erreur", text2: msg, position: "top", topOffset: 60 });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"} px-6 justify-between`}>
            {/* Message principal */}
            <View className="mt-12 items-center px-6 w-full">
                <Text className={`${isDarkMode ? "text-white" : "text-black"} text-lg text-center font-medium leading-6`}>
                    Il te reste plus qu'à ajouter une photo de profil{" "}
                </Text>
                <Image source={require("../../img/great.png")} className="w-6 h-6 relative left-[3rem] bottom-6" />
            </View>

            {/* Bouton d'ajout de photo */}
            <View className="items-center mt-8">
                <TouchableOpacity
                    onPress={handlePress}
                    className="w-[13rem] h-[13rem] bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden"
                >
                    {selectedImage ? (
                        <Image source={{ uri: selectedImage }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <Image source={require("../../img/add-profile-photo.png")} className="w-[7rem] h-[7rem]" />
                    )}
                </TouchableOpacity>
                <Text className={`${isDarkMode ? "text-white" : "text-black"} text-center mt-4`}>
                    Nous te conseillons de mettre ton établissement{"\n"}ou ton activité{" "}
                    <Text className="text-lg">😊</Text>
                </Text>
            </View>

            {/* Aide */}
            <View className="items-center mt-6">
                <TouchableOpacity className="flex-row items-center">
                    <Image source={require("../../img/help-icon.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} className="w-8 h-8 mr-2" />
                    <Text className={`${isDarkMode ? "text-white" : "text-black"} underline text-lg`}>Aide</Text>
                </TouchableOpacity>
            </View>

            {/* Avertissement */}
            <View className="items-center mt-6 px-6">
                <View className="flex-row items-center">
                    <Image source={require("../../img/warning-icon.png")} className="w-6 h-6 mr-2" />
                    <Text className={`${isDarkMode ? "text-white" : "text-black"} text-sm text-center`}>
                        Une photo inappropriée (dénudé, fake...) aura pour{"\n"}conséquence la suppression du compte !
                    </Text>
                </View>
            </View>

            {/* Boutons */}
            <View className="flex-row justify-between mt-8 pb-6">
                <TouchableOpacity
                    onPress={handleSkip}
                    disabled={isLoading}
                    className={`flex-1 py-3 border ${isDarkMode ? "border-[#0A99FE]" : "border-[#2C5B90]"} rounded-md mr-2`}
                >
                    {isLoading && !selectedImage ? (
                        <ActivityIndicator color={isDarkMode ? "#0A99FE" : "#2C5B90"} />
                    ) : (
                        <Text className={`${isDarkMode ? "text-[#0A99FE]" : "text-[#2C5B90]"} text-center font-medium`}>Plus tard</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleFinish}
                    disabled={isLoading}
                    className={`flex-1 py-3 ${isDarkMode ? "bg-[#0A99FE]" : "bg-[#2C5B90]"} rounded-md ml-2`}
                >
                    {isLoading && selectedImage ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-medium">Terminer</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default AddProfilePhotoProAsso;
