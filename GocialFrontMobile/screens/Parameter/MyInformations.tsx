import { View, Text, TextInput, Pressable, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    ChangeEmail: undefined;
    ChangePassword: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;


const MyInformations: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    return (
        <View className="flex-1">
            {/* HEADER */}
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        Mes Informations
                    </Text>
                    <TouchableOpacity>
                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Gestion du clavier */}
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView className={`p-0 ${isDarkMode ? "bg-black" : "bg-white"} min-h-screen`} contentContainerStyle={{ paddingBottom: 120 }}>
                    <View className="mt-2 w-full">
                        {/* Label et icône */}
                        <View className="flex-row justify-between items-center px-4 mb-2">
                            <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>
                                Email
                            </Text>

                            <TouchableOpacity onPress={() => navigation.navigate("ChangeEmail")} className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} flex-row items-center px-4 py-2 rounded-lg mt-1`}>
                                <MaterialIcons name="edit" size={18} color="white" />
                                <Text className="text-white font-semibold ml-2">Modifier</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Conteneur de l'input */}
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <TextInput
                                className={`border ${isDarkMode ? "border-[0.3px] border-white" : "border-[#065C98]"}
                                    p-3 rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
                                placeholder="****em@email.com"
                                placeholderTextColor={isDarkMode ? "white" : "black"}
                                editable={false}
                            />
                        </View>
                    </View>

                    <View className="mt-4 w-full">
                        {/* Label et icône */}
                        <View className="flex-row justify-between items-center px-4 mb-2">
                            <Text className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>
                                Mot de Passe
                            </Text>

                            <TouchableOpacity onPress={() => navigation.navigate("ChangePassword")} className={`${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} flex-row items-center px-4 py-2 rounded-lg mt-1`}>
                                <MaterialIcons name="edit" size={18} color="white" />
                                <Text className="text-white font-semibold ml-2">Modifier</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Conteneur de l'input */}
                        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                            <TextInput
                                className={`border ${isDarkMode ? "border-[0.3px] border-white" : "border-[#065C98]"}
                                    p-3 rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
                                placeholder="**********"
                                placeholderTextColor={isDarkMode ? "white" : "black"}
                                editable={false}
                            />
                        </View>
                    </View>
                </ScrollView>

            </KeyboardAvoidingView>
        </View>
    );
};

export default MyInformations;
