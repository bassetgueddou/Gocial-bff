import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LinearGradient from "react-native-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    GetPremiumProAsso: undefined;
    GetPremiumPlusProAsso: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

const pricingOptions = [
    { option: "Photos de profils", premium: "3", premiumPlus: "6" },
    { option: "Ajouts d’abonnés par jour", premium: "5", premiumPlus: "10" },
    { option: "Participants max à tes activités", premium: "50", premiumPlus: "50" },
    { option: "Voir qui a vu mon profil", premium: "✔️", premiumPlus: "✔️" },
    { option: "Messages privé", premium: "✔️", premiumPlus: "✔️" },
    { option: "Voir les profils sans être vu", premium: "/", premiumPlus: "✔️" },
    { option: "Plus grandes visibilités de mes activités", premium: "Référencement +", premiumPlus: "Référencement ++" },
    { option: "Ajout des réseaux sociaux sur ton profil", premium: "/", premiumPlus: "✔️" },
    { option: "Parité de genres des participants", premium: "/", premiumPlus: "✔️" },
    { option: "Changer son nom d’utilisateur @", premium: "2 fois par mois", premiumPlus: "illimité" },
    { option: "Personnalisation paramètres de confidentialité", premium: "✔️", premiumPlus: "✔️" },
];


const PremiumOfferProAsso: React.FC = () => {
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
                    <View className="absolute left-0 right-0 items-center">
                        <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                            Offres Premium
                        </Text>
                    </View>
                </View>
            </SafeAreaView>

            {/* ScrollView contenant tout le contenu */}
            <ScrollView className={`${isDarkMode ? "bg-black" : "bg-white"} min-h-screen`} contentContainerStyle={{ paddingBottom: 300 }}>
                {/* Tableau Premium */}
                <ScrollView horizontal className={`${isDarkMode ? "bg-black" : "bg-white"} rounded-lg shadow-lg p-2 mx-auto w-[90%] min-h-[400px]`}>
                    <View className={`border-b ${isDarkMode ? "border-white" : "border-black"} rounded-lg`}>
                        {/* En-tête (sans bordures latérales et inférieures) */}
                        <View className="flex-row bg-gray-200">
                            <Text className="w-40 py-3 font-bold text-black text-sm text-center">Options</Text>
                            <LinearGradient
                                colors={["#2B2D33", "#828799", "#6A6E7C", "#3D3F48"]}
                                locations={[0, 0.16, 0.89, 1]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                            >
                                <Text className="w-28 py-3 font-bold text-white text-center text-sm">Premium</Text>
                            </LinearGradient>
                            <LinearGradient
                                colors={["#5D533A", "#C3AE79", "#C3AE79", "#5D533A"]}
                                locations={[0, 0.16, 0.89, 1]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                            >
                                <Text className="w-28 py-3 font-bold text-white text-center text-sm">Premium +</Text>
                            </LinearGradient>
                        </View>

                        {/* Contenu du tableau (avec bordures normales) */}
                        {pricingOptions.map((item, index) => (
                            <View key={index} className={`flex-row ${index !== 0 ? `border-t ${isDarkMode ? "border-white" : "border-black"}` : ""}`}>
                                {/* Option */}
                                <Text className={`w-40 py-3 ${isDarkMode ? "text-white" : "text-black"} border-r ${isDarkMode ? "border-white" : "border-black"} text-sm text-center`}>
                                    {item.option}
                                </Text>

                                {/* Premium */}
                                <View className={`w-28 py-3 border-r ${isDarkMode ? "border-white" : "border-black"} flex items-center justify-center`}>
                                    {item.premium === "✔️" ? (
                                        <Image source={require("../../img/great.png")} className="h-5 w-5" />
                                    ) : (
                                        <Text className={`text-sm ${isDarkMode ? "text-white" : "text-black"} text-center`}>{item.premium}</Text>
                                    )}
                                </View>

                                {/* Premium Plus */}
                                <View className="w-28 py-3 flex items-center justify-center">
                                    {item.premiumPlus === "✔️" ? (
                                        <Image source={require("../../img/great.png")} className="h-5 w-5" />
                                    ) : (
                                        <Text className={`text-sm ${isDarkMode ? "text-white" : "text-black"} text-center`}>{item.premiumPlus}</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </ScrollView>

            {/* Boutons d'action */}
            <View className={`absolute bottom-0 left-0 right-0 mb-2 ${isDarkMode ? "bg-black" : "bg-white"} p-4 flex-row justify-between items-center h-[100px]`}>
                {/* Bouton Obtenir Premium */}
                <TouchableOpacity onPress={() => navigation.navigate("GetPremiumProAsso")}>
                    <LinearGradient
                        colors={["#828799", "#626674", "#2B2D33"]}
                        locations={[0.32, 0.56, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ borderRadius: 8, width: 150, height: 50, justifyContent: "center", alignItems: "center" }}
                    >
                        <Text className="text-white font-bold text-base">Obtenir Premium</Text>
                        <Text className="text-white text-sm">5.99 €/mois</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Bouton Obtenir Premium+ */}
                <TouchableOpacity onPress={() => navigation.navigate("GetPremiumPlusProAsso")}>
                    <LinearGradient
                        colors={["#C3AE79", "#AC9A6B", "#8B794B"]}
                        locations={[0.32, 0.56, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ borderRadius: 8, width: 150, height: 50, justifyContent: "center", alignItems: "center" }}
                    >
                        <Text className="font-bold text-base">Obtenir Premium +</Text>
                        <Text className="text-sm">8.99 €/mois</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PremiumOfferProAsso;
