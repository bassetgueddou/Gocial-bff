import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Pressable, Vibration } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import Icon from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import moment from "moment";
import ShareModal from "../Home/ShareModal";

const EventCard: React.FC = () => {
    const [modalShareVisible, setModalShareVisible] = useState(false);

    const { isDarkMode } = useTheme();

    const [isVisible, setIsVisible] = useState<boolean>(false);
    const toggleVisibility = () => setIsVisible(!isVisible);

    const [liked, setLiked] = useState(false);
    const handleLike = () => {
        setLiked(!liked);
        Vibration.vibrate(50); // Vibre pendant 50ms
    };


    return (
        <View className="mt-4">
            <ShareModal visible={modalShareVisible} onClose={() => setModalShareVisible(false)} />

            <Text className={`font-bold text-lg ml-3 ${isDarkMode ? "text-white" : "text-black"}`}>Activités</Text>
            <View className={`${isDarkMode ? "bg-black" : "bg-[#F2F5FA]"} pb-[3.5rem] mt-2 pt-4>`}>
                <Text className={`font-bold ml-6 ${isDarkMode ? "text-white" : "text-black"}`}>A venir (1)</Text>
                <TouchableOpacity className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} rounded-lg shadow-md p-4 w-full mt-4`}
                    style={{
                        shadowOffset: { width: 0, height: 4 }, // X = 0, Y = 4
                        shadowOpacity: 0.9, // 25% d’opacité
                        shadowRadius: 4, // Blur = 4
                        elevation: 4, // Ombre pour Android
                    }}>
                    <View className={`flex-row items-start`}>
                        {/* Event Image */}
                        <Image className={`h-[98px] w-[130px] rounded-lg`} source={require("../../img/billard-exemple.jpg")} />

                        {/* Event Details */}
                        <View className={`ml-4 flex-1`}>
                            <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>Soirée à B&CO</Text>
                            <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>Dim. 12 oct. - 08:45</Text>
                            <View className={`flex-row items-center mt-1`}>
                                <Image source={require("../../img/videoconference.png")} className="h-4 w-4" />
                                <Text className={`ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>Visio</Text>
                            </View>
                        </View>

                        {/* User Badge */}
                        <View className={`bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center`}>
                            <Text className={`text-white font-semibold`}>EL</Text>
                        </View>
                    </View>

                    {/* Bottom Actions */}
                    <View className={`flex-row items-center justify-between mt-3`}>
                        {/* Visibility Button */}
                        <TouchableOpacity
                            onPress={toggleVisibility}
                            className={`flex-row items-center px-4 py-2 rounded-lg ${isDarkMode ? "bg-black" : isVisible ? "bg-gray-300" : "bg-gray-200"}`}
                        >
                            <MaterialIcons name={isVisible ? "visibility" : "visibility-off"} size={16} color={isDarkMode ? "white" : "black"} />
                            <Text className={`ml-2 ${isDarkMode ? "text-white" : "text-black"}`}>{isVisible ? "Visible" : "Invisible"}</Text>
                        </TouchableOpacity>

                        {/* Participants and Likes */}
                        <View className={`flex-row items-center gap-4`}>
                            <View className={`flex-row items-center`}>
                                <Image source={require("../../img/people.png")} className="h-5 w-5" style={{ tintColor: isDarkMode ? "white" : "black" }} />
                                <Text className={`ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>1/10</Text>
                            </View>

                            <Pressable
                                onPress={handleLike}
                                className={`flex-row items-center ${isDarkMode ? "bg-black" : "bg-[#F3F3F3]"} rounded-xl p-2`}
                                style={({ pressed }) => [
                                    { opacity: pressed ? 0.6 : 1 }, // Effet visuel au clic
                                ]}
                            >
                                <MaterialIcons
                                    name={liked ? "favorite" : "favorite-border"}
                                    size={13}
                                    color={liked ? "red" : isDarkMode ? "white" : "black"}
                                />
                                <Text className={`${isDarkMode ? "text-white" : "text-black"}`} style={{ minWidth: 16, textAlign: "center" }}>
                                    {liked ? "1" : "0"}
                                </Text>
                            </Pressable>

                            <TouchableOpacity onPress={() => setModalShareVisible(true)} className={`${isDarkMode ? "bg-black" : "bg-[#F3F3F3]"}  rounded-xl p-[0.7rem]`}>
                                <Icon name="share" size={13} color={isDarkMode ? "white" : "black"} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>

                <Text className={`font-bold ml-6 mt-10 ${isDarkMode ? "text-white" : "text-black"}`}>Passées (1)</Text>
                <TouchableOpacity className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-white"} rounded-lg shadow-md p-4 w-full mt-4`}
                    style={{
                        shadowOffset: { width: 0, height: 4 }, // X = 0, Y = 4
                        shadowOpacity: 0.9, // 25% d’opacité
                        shadowRadius: 4, // Blur = 4
                        elevation: 4, // Ombre pour Android
                    }}>
                    <View className={`flex-row items-start`}>
                        {/* Event Image */}
                        <Image className={`h-[98px] w-[130px] rounded-lg`} source={require("../../img/billard-exemple.jpg")} />

                        {/* Event Details */}
                        <View className={`ml-4 flex-1`}>
                            <Text className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>Soirée à B&CO</Text>
                            <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>Dim. 12 oct. - 08:45</Text>
                            <View className={`flex-row items-center mt-1`}>
                                <Image source={require("../../img/videoconference.png")} className="h-4 w-4" />
                                <Text className={`ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>Visio</Text>
                            </View>
                        </View>

                        {/* User Badge */}
                        <View className={`bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center`}>
                            <Text className={`text-white font-semibold`}>EL</Text>
                        </View>
                    </View>

                    {/* Bottom Actions */}
                    <View className={`flex-row items-center justify-between mt-3`}>

                        {/* Delete Button */}
                        <TouchableOpacity className={`flex-row items-center px-4 py-2 rounded-lg bg-[#FF4D4D]`}>
                            <Text className={`ml-2 text-white`}>Supprimer</Text>
                        </TouchableOpacity>

                        {/* Participants and Likes */}
                        <View className={`flex-row items-center gap-4`}>
                            <View className={`flex-row items-center`}>
                                <Image source={require("../../img/people.png")} className="h-5 w-5" style={{ tintColor: isDarkMode ? "white" : "black" }} />
                                <Text className={`ml-1 ${isDarkMode ? "text-white" : "text-black"}`}>1/10</Text>
                            </View>

                            <Pressable
                                onPress={handleLike}
                                className={`flex-row items-center ${isDarkMode ? "bg-black" : "bg-[#F3F3F3]"} rounded-xl p-2`}
                                style={({ pressed }) => [
                                    { opacity: pressed ? 0.6 : 1 }, // Effet visuel au clic
                                ]}
                            >
                                <MaterialIcons
                                    name={liked ? "favorite" : "favorite-border"}
                                    size={13}
                                    color={liked ? "red" : isDarkMode ? "white" : "black"}
                                />
                                <Text className={`${isDarkMode ? "text-white" : "text-black"}`} style={{ minWidth: 16, textAlign: "center" }}>
                                    {liked ? "1" : "0"}
                                </Text>
                            </Pressable>

                            <TouchableOpacity onPress={() => setModalShareVisible(true)} className={`${isDarkMode ? "bg-black" : "bg-[#F3F3F3]"}  rounded-xl p-[0.7rem]`}>
                                <Icon name="share" size={13} color={isDarkMode ? "white" : "black"} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const EditIdentity: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();

    const [lastname, setLastname] = useState<string>("Sophie");
    const [firstname, setFirstname] = useState<string>("Labeau");
    const [city, setCity] = useState<string>("Paris 75018");
    const [gender, setGender] = useState<string>("Femme");
    const [birthDate, setBirthDate] = useState<string>("02/01/2000");

    const renderTextInput = (label: string, value: string, setValue: (text: string) => void, editable: boolean = true) => {
        return (
            <View className="mt-2 w-full">
                {/* Label */}
                <Text className={`font-bold text-lg px-4 mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>
                    {label}
                </Text>

                {/* Conteneur du champ */}
                <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} py-4 px-6 rounded-lg w-full`}>
                    <TextInput
                        className={`border p-3 rounded-lg text-[#ABABAB] 
                                    ${isDarkMode ? "border-[0.3px] border-white bg-black" : "border-[#065C98] bg-white"} 
                                    ${["Prénom", "Nom", "Ville"].includes(label) ? (isDarkMode ? "text-white" : "text-black") : ""}
                                `}
                        value={value}
                        onChangeText={setValue}
                        editable={editable}
                    />
                </View>
            </View>
        );
    };

    const renderTextAgeInput = (label: string, birthDate: string, setBirthDate: (text: string) => void, editable: boolean = true) => {
        // Calculer l'âge dynamiquement
        const birthMoment = moment(birthDate, "DD/MM/YYYY");
        const age = birthMoment.isValid() ? moment().diff(birthMoment, "years").toString() : "";

        return (
            <View className="mt-2 w-full">
                {/* Label */}
                <Text className={`font-bold text-lg px-4 mb-2 ${isDarkMode ? "text-white" : "text-black"}`}>
                    {label}
                </Text>

                {/* Conteneur du champ */}
                <View className={`${isDarkMode ? "bg-[#1D1E20]" : "bg-[#F2F5FA]"} w-full rounded-lg px-6 py-4`}>
                    <View className="border flex-row items-center justify-between px-3 py-2 rounded-lg w-full"
                        style={{
                            borderColor: isDarkMode ? "white" : "#065C98",
                            borderWidth: isDarkMode ? 0.3 : 1,
                            backgroundColor: isDarkMode ? "black" : "white"
                        }}>

                        {/* Input pour la date */}
                        <TextInput
                            className={`flex-1 text-[#ABABAB] text-lg relative bottom-[0.4rem]`}
                            value={birthDate}
                            onChangeText={setBirthDate}
                            keyboardType="numeric"
                        />

                        {/* Affichage de l'âge à droite */}
                        <Text className="text-[#ABABAB] text-lg">
                            {age ? `${age} ans` : ""}
                        </Text>
                    </View>
                </View>
            </View>
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
                        Identité
                    </Text>
                    <TouchableOpacity>
                        <MaterialIcons name="close" size={25} color={isDarkMode ? "white" : "black"} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* ScrollView avec padding bas pour éviter le chevauchement */}
            <ScrollView
                className={`p-0 ${isDarkMode ? "bg-black" : "bg-white"} flex-1`}
                contentContainerStyle={{ paddingBottom: 10 }} // Espace pour éviter que le dernier élément soit caché
                keyboardShouldPersistTaps="handled"
            >
                {renderTextInput("Prénom", lastname, setLastname)}
                {renderTextInput("Nom", firstname, setFirstname)}
                {renderTextInput("Ville", city, setCity)}
                {renderTextAgeInput("Age", birthDate, setBirthDate)}
                {renderTextInput("Genre", gender, setGender, false)}

                {/* Event Section */}
                <EventCard />
            </ScrollView>

            <View className={`bg-${isDarkMode ? "black" : "white"} p-6 flex-row justify-between`}>
                <TouchableOpacity className="px-8 py-3 border border-[#FF4D4D] rounded-lg">
                    <Text className="text-[#FF4D4D] font-bold">Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity className={`px-8 py-3 ${isDarkMode ? "bg-[#1A6EDE]" : "bg-[#065C98]"} rounded-lg`}>
                    <Text className="text-white font-bold">Enregistrer</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

};

export default EditIdentity;