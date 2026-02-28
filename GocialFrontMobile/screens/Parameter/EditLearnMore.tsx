import { useState } from "react";
import { View, Text, TextInput, Pressable, TouchableOpacity, Image } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const EditLearnMore : React.FC = () => {
    const [languages, setLanguages] = useState("Français, Anglais...");
    const [profession, setProfession] = useState("Agent d’entretien...");
    const [passions, setPassions] = useState("Cinéma, Billard...");
    const [school, setSchool] = useState("Université Paris Dauphine");
    const [allergies, setAllergies] = useState("Gluten, Arachide...");
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string | null>>({});

    const toggleOption = (category: string, option: string) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [category]: prev[category] === option ? null : option,
        }));
    };

    const renderOptions = (category: string, options: string[]) => {
        return (
            <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg mt-2 w-full`}>
                <View className={`flex flex-wrap flex-row gap-2`}>
                    {options.map((option) => (
                        <Pressable
                            key={option}
                            className={`px-4 py-2 rounded-md ${selectedOptions[category] === option ?
                                isDarkMode ? "bg-[#1A6EDE] text-white" : "bg-[#065C98] text-white"
                                :
                                isDarkMode ? "border-[0.3px] border-white" : "border border-[#065C98]"
                                }`}
                            onPress={() => toggleOption(category, option)}
                        >
                            <Text className={`${selectedOptions[category] === option ? "text-white" :
                                isDarkMode ? "text-white" : "text-[#065C98]"}`}>{option}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>
        );
    };

    const renderTextInput = (label: string, value: string, setValue: (text: string) => void) => {
        return (
            <View className={`mt-2 w-full`}>
                <Text className={`font-bold text-lg px-4 mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>{label}</Text>
                <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                    <TextInput
                        className={`border ${isDarkMode ? "border-[0.3px] border-white" : "border-[#065C98]"} p-3 rounded-lg ${isDarkMode ? "bg-black" : "bg-white"} text-[#ABABAB]`}
                        value={value}
                        onChangeText={setValue}
                    />
                </View>
            </View>
        );
    };

    const { isDarkMode } = useTheme();
    const navigation = useNavigation();
    return (

        <View className="flex-1">
            {/* HEADER */}
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        En savoir plus
                    </Text>
                    <TouchableOpacity>
                       <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView >

            <ScrollView className={`p-0 ${isDarkMode ? "bg-black" : "bg-white"} min-h-screen`} contentContainerStyle={{ paddingBottom: 170 }}>
                {/* Langues */}
                {renderTextInput("Langues", languages, setLanguages)}

                {/* Profession */}
                {renderTextInput("Profession", profession, setProfession)}

                {/* Passions */}
                {renderTextInput("Passions", passions, setPassions)}

                {/* Etudes */}
                <Text className={`font-bold text-lg mt-4 px-4 ${isDarkMode ? "text-white" : "text-black"}`}>Etudes</Text>
                {renderOptions("studies", ["Privé", "CAP", "Bac", "Bac +2", "Licence", "Master", "Doctorat", "Formation professionnelle"])}

                {/* École */}
                {renderTextInput("Ecole", school, setSchool)}

                {/* Alcool */}
                <Text className={`font-bold text-lg mt-4 px-4 ${isDarkMode ? "text-white" : "text-black"}`}>Alcool</Text>
                {renderOptions("alcohol", ["Privé", "Non", "Parfois", "Lors de sorties entre amis"])}

                {/* Tabac */}
                <Text className={`font-bold text-lg mt-4 px-4 ${isDarkMode ? "text-white" : "text-black"}`}>Tabac</Text>
                {renderOptions("tobacco", ["Privé", "Non", "J’essaie d’arrêter", "Lors de sorties entre amis", "Régulièrement"])}

                {/* Alimentation */}
                <Text className={`font-bold text-lg mt-4 px-4 ${isDarkMode ? "text-white" : "text-black"}`}>Alimentation</Text>
                {renderOptions("food", ["Privé", "Bio", "Mange de tout", "Végétarien", "Vegan", "Végétalien", "Halal", "Cacher"])}

                {/* Allergies */}
                {renderTextInput("Allergies", allergies, setAllergies)}

                {/* Boutons */}
                <View className={`flex flex-row justify-between mt-6 px-4`}>
                    <TouchableOpacity className={`px-8 py-3 border ${isDarkMode ? "border-[#FF4D4D]" : "border-[#FF4D4D]"} rounded-lg`}>
                        <Text className={`text-[#FF4D4D] font-bold`}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className={`px-8 py-3 ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} rounded-lg`}>
                        <Text className={`text-white font-bold`}>Enregistrer</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default EditLearnMore;