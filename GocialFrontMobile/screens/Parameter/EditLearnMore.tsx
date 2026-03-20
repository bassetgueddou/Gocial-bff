import { useState } from "react";
import { View, Text, TextInput, Pressable, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../../src/contexts/AuthContext";
import { userService } from "../../src/services/users";
import Toast from "react-native-toast-message";

const EditLearnMore: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation();
    const { user, refreshUser } = useAuth();
    const [saving, setSaving] = useState(false);

    const [languages, setLanguages] = useState(user?.languages || "");
    const [profession, setProfession] = useState(user?.profession || "");
    const [passions, setPassions] = useState(user?.passions || "");
    const [school, setSchool] = useState(user?.school || "");
    const [allergies, setAllergies] = useState(user?.allergies || "");
    const [children, setChildren] = useState(user?.children || "");
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string | null>>({
        studies: user?.studies || null,
        alcohol: user?.alcohol || null,
        tobacco: user?.tobacco || null,
        food: user?.food_preference || null,
    });

    const toggleOption = (category: string, option: string) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [category]: prev[category] === option ? null : option,
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await userService.updateProfile({
                languages,
                profession,
                passions,
                school,
                allergies,
                children,
                studies: selectedOptions.studies,
                alcohol: selectedOptions.alcohol,
                tobacco: selectedOptions.tobacco,
                food_preference: selectedOptions.food,
            });
            await refreshUser();
            Toast.show({ type: "success", text1: "Profil mis à jour" });
            navigation.goBack();
        } catch (e: any) {
            Toast.show({ type: "error", text1: "Erreur", text2: e?.response?.data?.error || "Impossible de sauvegarder" });
        } finally {
            setSaving(false);
        }
    };

    const renderOptions = (category: string, options: string[]) => (
        <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg mt-2 w-full`}>
            <View className="flex flex-wrap flex-row gap-2">
                {options.map((option) => (
                    <Pressable
                        key={option}
                        className={`px-4 py-2 rounded-md ${selectedOptions[category] === option
                            ? isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"
                            : isDarkMode ? "border-[0.3px] border-white" : "border border-[#065C98]"
                        }`}
                        onPress={() => toggleOption(category, option)}
                    >
                        <Text className={`${selectedOptions[category] === option ? "text-white" : isDarkMode ? "text-white" : "text-[#065C98]"}`}>{option}</Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );

    const getLearnMorePlaceholder = (label: string): string => {
        switch (label) {
            case "Langues": return "Ex : Français, Anglais, Espagnol...";
            case "Profession": return "Ex : Développeur, Étudiant, Designer...";
            case "Passions": return "Ex : Sport, Musique, Voyage...";
            case "École": return "Ex : Université Paris-Saclay...";
            case "Allergies": return "Ex : Gluten, Arachides...";
            case "Enfants": return "Ex : 2 enfants";
            default: return "";
        }
    };

    const renderTextInput = (label: string, value: string, setValue: (text: string) => void) => (
        <View className="mt-2 w-full">
            <Text className={`font-bold text-lg px-4 mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>{label}</Text>
            <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                <TextInput
                    className={`border ${isDarkMode ? "border-[0.3px] border-white" : "border-[#065C98]"} p-3 rounded-lg ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}
                    value={value}
                    onChangeText={setValue}
                    placeholder={getLearnMorePlaceholder(label)}
                    placeholderTextColor="#ABABAB"
                />
            </View>
        </View>
    );

    return (
        <View className="flex-1">
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>En savoir plus</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView className={`p-0 ${isDarkMode ? "bg-black" : "bg-white"} min-h-screen`} contentContainerStyle={{ paddingBottom: 170 }}>
                {renderTextInput("Langues", languages, setLanguages)}
                {renderTextInput("Profession", profession, setProfession)}
                {renderTextInput("Passions", passions, setPassions)}

                <Text className={`font-bold text-lg mt-4 px-4 ${isDarkMode ? "text-white" : "text-black"}`}>Études</Text>
                {renderOptions("studies", ["Privé", "CAP", "Bac", "Bac +2", "Licence", "Master", "Doctorat", "Formation professionnelle"])}

                {renderTextInput("École", school, setSchool)}

                <Text className={`font-bold text-lg mt-4 px-4 ${isDarkMode ? "text-white" : "text-black"}`}>Alcool</Text>
                {renderOptions("alcohol", ["Privé", "Non", "Parfois", "Lors de sorties entre amis"])}

                <Text className={`font-bold text-lg mt-4 px-4 ${isDarkMode ? "text-white" : "text-black"}`}>Tabac</Text>
                {renderOptions("tobacco", ["Privé", "Non", "J'essaie d'arrêter", "Lors de sorties entre amis", "Régulièrement"])}

                <Text className={`font-bold text-lg mt-4 px-4 ${isDarkMode ? "text-white" : "text-black"}`}>Alimentation</Text>
                {renderOptions("food", ["Privé", "Bio", "Mange de tout", "Végétarien", "Vegan", "Végétalien", "Halal", "Cacher"])}

                {renderTextInput("Allergies", allergies, setAllergies)}

                {renderTextInput("Enfants", children, setChildren)}

                <View className="flex flex-row justify-between mt-6 px-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="px-8 py-3 border border-[#FF4D4D] rounded-lg">
                        <Text className="text-[#FF4D4D] font-bold">Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSave} disabled={saving} className={`px-8 py-3 ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} rounded-lg ${saving ? "opacity-50" : ""}`}>
                        <Text className="text-white font-bold">{saving ? "..." : "Enregistrer"}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default EditLearnMore;
