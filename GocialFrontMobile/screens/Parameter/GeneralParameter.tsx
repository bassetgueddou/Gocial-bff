import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Switch, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import Svg, { Line, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import LinearGradient from "react-native-linear-gradient";
import GirlsOnlyModal from "./GirlsOnlyModal";
import HelpModal from "./HelpModal";
import DeleteAccountModal from "./DeleteAccountModal";
import SuspendAccountModal from "./SuspendAccountModal";
import { StackNavigationProp } from "@react-navigation/stack";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import GirlsOnlyActiveModal from "./GirlsOnlyActiveModal";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    AccountPrivacyProAsso: undefined;
    AccountPrivacyPerson: undefined;
    NotificationsProAsso: undefined;
    ProfilPerson: undefined;
    ProfilPersonPreview: undefined;
    Login: undefined;
    MyInformations: undefined;
    Main: undefined;
    PremiumOfferPerson: undefined;
    FriendsSponsorship: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;


const { width } = Dimensions.get("window");

const GeneralParameter: React.FC = () => {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [girlsOnly, setGirlsOnly] = useState(false);
    const [isGirlsOnlyModalVisible, setIsGirlsOnlyModalVisible] = useState(false);
    const [isGirlsOnlyActiveModalVisible, setIsGirlsOnlyActiveModalVisible] = useState(false);
    const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
    const [isDeleteAccountModalVisible, setIsDeleteAccountModalVisible] = useState(false);
    const [isSuspendAccountModalVisible, setIsSuspendAccountModalVisible] = useState(false);
    const navigation = useNavigation<NavigationProp>();


    return (
        <SafeAreaView className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"}`}>
            <ScrollView className="px-4">
                {/* Header */}
                <View className="flex-row justify-between items-center py-4">
                    <TouchableOpacity onPress={() => navigation.navigate("Main")}>
                        <MaterialIcons name="arrow-back-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>Paramètre</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Main")}>
                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>

                {/* Profil */}
                <View className="w-full px-4 mt-4 mb-5">
                    {/* Avatar + Texte à droite */}
                    <View className="flex-row items-center">
                        {/* Avatar */}
                        <TouchableOpacity onPress={() => navigation.navigate("ProfilPersonPreview")} className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center relative bottom-1">
                            <Text className="text-white font-bold text-lg">EL</Text>
                        </TouchableOpacity>

                        {/* Nom + Badge de validation */}
                        <View className="ml-2">
                            <View className="flex-row items-center">
                                <Text className={`${isDarkMode ? "text-white" : "text-black"} text-lg font-medium`}>Elodie N.</Text>
                                <Image source={require("../../img/check.png")} className="w-6 h-6 ml-1" />
                            </View>

                            {/* Boutons sous "Elodie N." */}
                            <View className="flex-row gap-2 mt-1">
                                <TouchableOpacity onPress={() => navigation.navigate("ProfilPerson")} className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-gray-200"} px-4 py-2 rounded-md`}>
                                    <Text className={`${isDarkMode ? "text-white" : "text-gray-700"}`}>Profil</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate("MyInformations")} className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-gray-200"} px-4 py-2 rounded-md`}>
                                    <Text className={`${isDarkMode ? "text-white" : "text-gray-700"}`}>Mes informations</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>


                {/* Premium + */}
                <TouchableOpacity onPress={() => navigation.navigate("PremiumOfferPerson")}>
                    <LinearGradient
                        colors={["#C3AE79", "#AC9A6B", "#8B794B"]}
                        locations={[0.32, 0.56, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }} // Dégradé horizontal
                        style={{
                            height: 60,
                            borderRadius: 5,
                            justifyContent: "center",
                            alignItems: "center", // Centre le contenu horizontalement
                            paddingHorizontal: 10,
                        }}
                    >
                        <View style={{ justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ color: "black", fontWeight: "bold", fontSize: 16 }}>
                                Passe à Gosial Premium +
                            </Text>
                            <Text style={{ color: "black", fontSize: 14 }}>
                                Augmente le nombre maximum de participants
                            </Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>


                <Text className={`${isDarkMode ? "text-white" : "text-black"} font-semibold relative top-3 text-lg mt-1`}>Général</Text>
                <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-gray-100"} rounded-md mt-6 p-4`}>

                    <TouchableOpacity onPress={() => navigation.navigate("PremiumOfferPerson")} className="flex-row justify-between items-center py-3">
                        <Text className={`${isDarkMode ? "text-white" : "text-gray-700"}`}>Passer à Premium</Text>
                        <MaterialIcons name="arrow-forward-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>

                    <View className="flex-row justify-between items-center py-3">
                        <View className="flex-row items-center space-x-3">
                            <Image source={require("../../img/dark-mode.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} className="h-6 w-6" />
                            <Text className={`${isDarkMode ? "text-white" : "text-gray-700"} ml-[0.3rem]`}>Mode sombre</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleDarkMode}
                            thumbColor="white"
                            trackColor={{ false: "#E5E7EB", true: "black" }}
                            ios_backgroundColor="#E5E7EB"
                            style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }], position: "relative", left: 5 }}
                        />
                    </View>

                    <TouchableOpacity onPress={() => navigation.navigate("AccountPrivacyPerson")} className="flex-row justify-between items-center py-3">
                        <Text className={`${isDarkMode ? "text-white" : "text-gray-700"}`}>🔒 Confidentialité du compte</Text>
                        <MaterialIcons name="arrow-forward-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row justify-between items-center py-3">
                        <View className="flex-row items-center space-x-3">
                            <Image source={require("../../img/check.png")} className="h-6 w-6" />
                            <Text className={`${isDarkMode ? "text-white" : "text-gray-700"} ml-[0.3rem]`}>Vérifier mon profil</Text>
                        </View>
                        <MaterialIcons name="arrow-forward-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>

                    {/* <TouchableOpacity className="flex-row justify-between items-center py-3">
                        <Text className={`${isDarkMode ? "text-white" : "text-gray-700"}`}>👛 Porte-monnaie</Text>
                        <MaterialIcons name="arrow-forward-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity> */}

                    <TouchableOpacity onPress={() => navigation.navigate("NotificationsProAsso")} className="flex-row justify-between items-center py-3">
                        <Text className={`${isDarkMode ? "text-white" : "text-gray-700"}`}>🔔 Notifications</Text>
                        <MaterialIcons name="arrow-forward-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>

                    <View className="flex-row justify-between items-center py-3">
                        <View className="flex-row items-center space-x-3">
                            <Image source={require("../../img/girls-only.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} className="h-6 w-6" />
                            <Text className={`${isDarkMode ? "text-white" : "text-gray-700"}`}>Girls only</Text>
                        </View>

                        {/* Conteneur pour Switch et Image alignés */}
                        <View className="flex-row items-center space-x-3">
                            <Switch
                                value={girlsOnly}
                                onValueChange={(value) => {
                                    setGirlsOnly(value);
                                    if (value) {
                                        setIsGirlsOnlyActiveModalVisible(true);
                                    }
                                }}
                                thumbColor="white"
                                trackColor={{ false: "#E5E7EB", true: "green" }}
                                ios_backgroundColor="#E5E7EB"
                                style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                            />
                            <TouchableOpacity onPress={() => setIsGirlsOnlyModalVisible(true)}>
                                <Image
                                    source={require("../../img/info.png")}
                                    style={{ width: 20, height: 20, marginLeft: 5, tintColor: isDarkMode ? "white" : "black" }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>


                {/* Parrainage */}
                <Text className={`${isDarkMode ? "text-white" : "text-black"} font-semibold relative top-3 text-lg`}>Parrainage</Text>
                <TouchableOpacity onPress={() => navigation.navigate("FriendsSponsorship")} className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-gray-100"} rounded-md mt-6 p-4 flex-row justify-between`}>
                    <Text className={`${isDarkMode ? "text-white" : "text-gray-700"} font-semibold`}>🤝 Parraine des amis</Text>
                </TouchableOpacity>

                {/* Info et Assistance */}
                <Text className={`${isDarkMode ? "text-white" : "text-black"} font-semibold relative top-3 text-lg`}>Info et assistance</Text>
                <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-gray-100"} rounded-md mt-6 p-4`}>
                    <TouchableOpacity onPress={() => setIsHelpModalVisible(true)} className="flex-row justify-between py-3">
                        <View className="flex-row items-center space-x-3">
                            <Image source={require("../../img/help-icon.png")} className="h-7 w-7" style={{ tintColor: isDarkMode ? "white" : "black" }} />
                            <Text className={`${isDarkMode ? "text-white" : "text-gray-700"} ml-[0.3rem]`}>Aide</Text>
                        </View>
                        <MaterialIcons name="arrow-forward-ios" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row justify-between py-3">
                        <Text className={`${isDarkMode ? "text-white" : "text-gray-700"}`}>Politique de confidentialité</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row justify-between py-3">
                        <Text className={`${isDarkMode ? "text-white" : "text-gray-700"}`}>Conditions d’utilisation</Text>
                    </TouchableOpacity>
                </View>

                {/* Section Compte */}
                <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-gray-100"} rounded-md mt-6 p-4`}>
                    <TouchableOpacity onPress={() => setIsSuspendAccountModalVisible(true)} className="bg-[#FF4D4D] py-3 px-6 rounded-md w-3/4 self-start">
                        <Text className={`${isDarkMode ? "text-black" : "text-white"} text-center font-semibold`}>Désactiver le compte</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setIsDeleteAccountModalVisible(true)} className="bg-black py-3 px-6 rounded-md w-3/4 self-start mt-2">
                        <Text className="text-[#FF4D4D] text-center font-semibold">Supprimer le compte</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate("Login")} className={`${isDarkMode ? "bg-[#F00020]" : "bg-[#FF4D4D]"} py-3 rounded-md mt-6`}>
                    <Text className="text-white text-center font-semibold">Déconnexion</Text>
                </TouchableOpacity>

                {/* Réseaux sociaux */}
                <View className="flex-row justify-center gap-6 mt-6">
                    <TouchableOpacity>
                        <Image className="w-8 h-8 mr-10" source={require("../../img/facebook-parameter.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Image className="w-8 h-8" source={require("../../img/instagram-parameter.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Image className="w-8 h-8 ml-[2.9rem]" source={require("../../img/tiktok-parameter.png")} style={{ tintColor: isDarkMode ? "white" : "black" }} />
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <Text className={`text-center ${isDarkMode ? "text-white" : "text-gray-500"} text-sm mt-4`}>
                    Made with ❤️ in France
                </Text>

                <View className="relative right-4 mt-4">
                    <Svg height="10" width={width}>
                        <Defs>
                            <SvgLinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                                <Stop offset="0%" stopColor="#000091" stopOpacity="1" />
                                <Stop offset="33.3%" stopColor="#000091" stopOpacity="1" />
                                <Stop offset="33.4%" stopColor="#E4E4E4" stopOpacity="1" />
                                <Stop offset="66.6%" stopColor="#E4E4E4" stopOpacity="1" />
                                <Stop offset="66.7%" stopColor="#E1000F" stopOpacity="1" />
                                <Stop offset="100%" stopColor="#E1000F" stopOpacity="1" />
                            </SvgLinearGradient>
                        </Defs>
                        <Line x1="0" y1="5" x2={width} y2="5" stroke="url(#grad)" strokeWidth="3" />
                    </Svg>
                </View>

            </ScrollView>

            <GirlsOnlyModal
                visible={isGirlsOnlyModalVisible}
                onClose={() => setIsGirlsOnlyModalVisible(false)}
            />
            <GirlsOnlyActiveModal
                visible={isGirlsOnlyActiveModalVisible}
                onClose={() => setIsGirlsOnlyActiveModalVisible(false)}
            />
            <HelpModal
                visible={isHelpModalVisible}
                onClose={() => setIsHelpModalVisible(false)}
            />
            <DeleteAccountModal
                visible={isDeleteAccountModalVisible}
                onClose={() => setIsDeleteAccountModalVisible(false)}
            />
            <SuspendAccountModal
                visible={isSuspendAccountModalVisible}
                onClose={() => setIsSuspendAccountModalVisible(false)}
            />

        </SafeAreaView>
    );
};


export default GeneralParameter;
