import { View, Text, TouchableOpacity, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../ThemeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import React, { useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import MultiSlider from '@ptomasroos/react-native-multi-slider';

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    CANumberParticipants: undefined;
    Main: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

type VisibilityOption = "public" | "friends" | "invite";

const visibilityLabels: Record<VisibilityOption, string> = {
    public: "Publique",
    friends: "Mes amis Gocial",
    invite: "Sur lien d’invitation",
};

type ParticipantType =
    | "all"
    | "men"
    | "women"
    | "non-binary"
    | "families"
    | "students"
    | "singles";

const options: { key: ParticipantType; label: string }[] = [
    { key: "all", label: "Tout le monde" },
    { key: "men", label: "Hommes" },
    { key: "women", label: "Femmes" },
    { key: "non-binary", label: "Non-Binaires" },
    { key: "families", label: "Familles" },
    { key: "students", label: "Etudiants" },
    { key: "singles", label: "Célibataires" },
];



const CAVisioRestriction: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [selected, setSelected] = useState<VisibilityOption>("friends");

    const [selectedType, setSelectedType] = useState<ParticipantType>("all");
    const [ageRange, setAgeRange] = useState<[number, number]>([18, 122]);

    const [validation, setValidation] = useState<'automatique' | 'manuelle'>('manuelle');
    const [nonVerifies, setNonVerifies] = useState<'autorises' | 'refuses'>('refuses');
    const [nonGocial, setNonGocial] = useState<'autorises' | 'refuses'>('refuses');

    const ToggleButton = ({
        label,
        selected,
        onPress,
    }: {
        label: string;
        selected: boolean;
        onPress: () => void;
    }) => (
        <Pressable
            onPress={onPress}
            className={`mx-1 px-4 py-2 rounded-md  text-sm font-medium ${selected ? isDarkMode ? "bg-[#1A6EDE]" : 'bg-[#065C98]' : isDarkMode ? "bg-black border-[0.3px] border-white" : 'border border-[#065C98] bg-white'
                }`}
        >
            <Text className={`${selected ? "text-white" : isDarkMode ? "text-white" : "text-[#065C98]"}`}>{label}</Text>
        </Pressable>
    );


    return (
        <View className="flex-1">
            {/* HEADER */}
            <SafeAreaView className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
                <View className="flex-row items-center justify-between px-4 py-2">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        Créer une activité 3/5
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

                <View className="gap-2 mt-2">
                    <Text className={` ${isDarkMode ? "text-white" : ""} font-semibold text-base px-2`}>
                        Visibilité <Text className="text-red-500">*</Text>
                    </Text>
                    <View className={`flex-row ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} p-2 rounded-xl justify-between space-x-2`}>
                        {Object.entries(visibilityLabels).map(([key, label]) => {
                            const isActive = selected === key;
                            return (
                                <Pressable
                                    key={key}
                                    className={`px-4 py-2 rounded-md border font-medium
                                        ${isActive
                                            ? isDarkMode ? "bg-[#1A6EDE] border-[#1A6EDE]" : "bg-[#065C98] border-[#065C98] text-white"
                                            : isDarkMode ? "bg-black border-[0.3px] border-white" : "bg-white border-[#065C98] text-[#065C98]"}
                                    `}
                                    onPress={() => setSelected(key as VisibilityOption)}
                                >
                                    <Text className={`${isActive ? "text-white" : isDarkMode ? "text-white" : ""} text-sm`}>{label}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View className="rounded-lg mt-4">
                    <Text className={`font-semibold text-base mb-1 px-2 ${isDarkMode ? "text-white" : ""}`}>
                        Types de participants <Text className="text-red-500">*</Text>
                    </Text>

                    <View className={`flex-row flex-wrap gap-2 ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} p-3`}>
                        {options.map(({ key, label }) => {
                            const isActive = selectedType === key;
                            return (
                                <Pressable
                                    key={key}
                                    onPress={() => setSelectedType(key)}
                                    className={`px-4 py-2 rounded-md border font-medium   ${isActive
                                        ? isDarkMode ? "bg-[#1A6EDE] border-[#1A6EDE]" : "bg-[#065C98] border-[#065C98] text-white"
                                        : isDarkMode ? "bg-black border-[0.3px] border-white" : "bg-white border-[#065C98] text-[#065C98]"}`}
                                >
                                    <Text
                                        className={`text-sm ${isActive ? "text-white" : isDarkMode ? "text-white" : ""}`}
                                    >
                                        {label}
                                    </Text>
                                </Pressable>
                            );
                        })}

                        <View className="px-4 py-6 rounded-xl items-center w-full">
                            <Text className={`${isDarkMode ? "text-white" : ""} text-base font-medium mb-6`}>
                                de {ageRange[0]} ans à {ageRange[1]} ans
                            </Text>

                            <MultiSlider
                                values={ageRange}
                                onValuesChange={(values) => setAgeRange([values[0], values[1]])}
                                min={18}
                                max={122}
                                step={1}
                                selectedStyle={{ backgroundColor: '#1A6EDE' }}
                                unselectedStyle={{ backgroundColor: '#d1d5db' }}
                                trackStyle={{ height: 3 }}
                                markerStyle={{
                                    height: 24,
                                    width: 24,
                                    borderRadius: 12,
                                    backgroundColor: '#1A6EDE',
                                }}
                                containerStyle={{ width: '100%' }}
                            />
                        </View>

                    </View>
                </View>

                {/* Validation des participants */}
                <Text className={`text-base font-medium mb-2 mt-4 px-2 ${isDarkMode ? "text-white" : ""}`}>
                    Validation des participants <Text className="text-red-600">*</Text>
                </Text>
                <View className={`flex-row space-x-2 mb-4 p-2 ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"}`}>
                    <ToggleButton
                        label="Automatique"
                        selected={validation === 'automatique'}
                        onPress={() => setValidation('automatique')}
                    />
                    <ToggleButton
                        label="Manuelle"
                        selected={validation === 'manuelle'}
                        onPress={() => setValidation('manuelle')}
                    />
                </View>

                {/* Participants non Vérifier */}
                <Text className={`text-base font-medium mb-2 px-2 ${isDarkMode ? "text-white" : ""}`}>
                    Les participants non Vérifier seront <Text className="text-red-600">*</Text>
                </Text>
                <View className={`flex-row space-x-2 mb-4 p-2 ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"}`}>
                    <ToggleButton
                        label="Autorisés"
                        selected={nonVerifies === 'autorises'}
                        onPress={() => setNonVerifies('autorises')}
                    />
                    <ToggleButton
                        label="Refusés"
                        selected={nonVerifies === 'refuses'}
                        onPress={() => setNonVerifies('refuses')}
                    />
                </View>

                {/* Participants non Gocial */}
                <Text className={`text-base font-medium mb-2 px-2 ${isDarkMode ? "text-white" : ""}`}>
                    Les participants non Gocial seront <Text className="text-red-600">*</Text>
                </Text>
                <View className={`flex-row space-x-2 mb-1 p-2 ${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"}`}>
                    <ToggleButton
                        label="Autorisés"
                        selected={nonGocial === 'autorises'}
                        onPress={() => setNonGocial('autorises')}
                    />
                    <ToggleButton
                        label="Refusés"
                        selected={nonGocial === 'refuses'}
                        onPress={() => setNonGocial('refuses')}
                    />
                </View>

                {/* Message de sécurité */}
                <Text className={`text-sm px-2 ${isDarkMode ? "text-white" : ""}`}>
                    Pour ta <Text className="font-bold">sécurité</Text>, nous te conseillons d'accepter{' '}
                    <Text className="font-bold">uniquement des amis Gocial</Text> pour ton activité, afin
                    d’être sûr(e) de savoir qui tu vas rencontrer.
                </Text>


            </ScrollView>

            <View className={`absolute bottom-0 left-0 right-0 ${isDarkMode ? 'bg-black' : 'bg-white'} 
                             px-4 py-4 flex-row justify-end items-center`}
                style={{ height: 80 }} >

                <TouchableOpacity onPress={() => navigation.navigate("CANumberParticipants")} className={`px-8 py-3 ${isDarkMode ? 'bg-[#1A6EDE]' : 'bg-[#065C98]'} rounded-lg`}>
                    <Text className="text-white font-bold">Modifier 3/5</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

export default CAVisioRestriction;
