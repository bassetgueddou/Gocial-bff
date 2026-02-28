import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js/mobile";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../../src/contexts/AuthContext";

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    Login: undefined;
    RegisterPerson: undefined;
    RegisterProAsso: undefined;
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

const RegisterPerson: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { register } = useAuth();
    const [selectedGender, setSelectedGender] = useState<"female" | "male" | "non-binary" | null>("female");
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>("FR"); // ISO2 (FR, BE, etc.)
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [formattedNumber, setFormattedNumber] = useState<string>("");
    const [phoneError, setPhoneError] = useState<string>("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pseudo, setPseudo] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [city, setCity] = useState("");
    const [loading, setLoading] = useState(false);

    const onPhoneChange = (text: string) => {
        // Format “as you type” selon le pays (confort utilisateur)
        const formatter = new AsYouType(selectedCountryCode as any);
        const pretty = formatter.input(text);

        setPhoneNumber(pretty);

        // Validation + format international
        const parsed = parsePhoneNumberFromString(pretty, selectedCountryCode as any);

        if (!pretty.trim()) {
            setFormattedNumber("");
            setPhoneError("");
            return;
        }

        if (parsed && parsed.isValid()) {
            setFormattedNumber(parsed.formatInternational());
            setPhoneError("");
        } else {
            setFormattedNumber("");
            setPhoneError("Numéro invalide");
        }
    };


    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}>
                {/* Header */}
                <View className="relative py-4 mt-4 flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="absolute left-0">
                        <MaterialIcons name="arrow-back-ios" size={25} color="black" />
                    </TouchableOpacity>
                    <Text className="text-xl font-semibold mx-auto">Inscription</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Login")} className="absolute right-0">
                        <MaterialIcons name="close" size={25} color="black" />
                    </TouchableOpacity>
                </View>

                {/* Champ obligatoire */}
                <Text className="text-red-500 font-medium mt-4">* Obligatoire</Text>

                {/* Sélection du genre */}
                <View className="mt-4 flex-row justify-between">
                    <TouchableOpacity
                        onPress={() => setSelectedGender("female")}
                        className={`flex-1 px-4 py-3 rounded-md mx-1 ${selectedGender === "female" ? "bg-[#2C5B90]" : "border border-[#2C5B90]"
                            }`}
                    >
                        <Text className={`text-center font-medium ${selectedGender === "female" ? "text-white" : "text-[#2C5B90]"}`}>
                            Femme
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setSelectedGender("male")}
                        className={`flex-1 px-4 py-3 rounded-md mx-1 ${selectedGender === "male" ? "bg-[#2C5B90]" : "border border-[#2C5B90]"
                            }`}
                    >
                        <Text className={`text-center font-medium ${selectedGender === "male" ? "text-white" : "text-[#2C5B90]"}`}>
                            Homme
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Non-Binaire avec même taille que les autres (1/2 largeur, centré) */}
                <TouchableOpacity
                    onPress={() => setSelectedGender("non-binary")}
                    className={`w-1/2 px-4 py-3 rounded-md border border-[#2C5B90] self-center mt-3 ${selectedGender === "non-binary" ? "bg-[#2C5B90]" : ""
                        }`}
                >
                    <Text
                        className={`text-center font-medium ${selectedGender === "non-binary" ? "text-white" : "text-[#2C5B90]"
                            }`}
                    >
                        Non-Binaire
                    </Text>
                </TouchableOpacity>

                {/* Date de naissance */}
                <View className="mt-6">
                    <Text className="text-base font-medium">Né(e) le *</Text>
                    <TextInput
                        value={birthDate}
                        onChangeText={setBirthDate}
                        placeholder="__/__/____"
                        keyboardType="numeric"
                        className="border border-gray-300 rounded-md px-4 py-3 mt-2"
                    />
                    <Text className="text-sm mt-1">Tu dois avoir au moins 18 ans 😉</Text>
                </View>

                {/* Prénom */}
                <View className="mt-6">
                    <Text className="text-base font-medium">
                        Prénom <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="(exemple : Mathilde)"
                        className="border border-gray-300 rounded-md px-4 py-3 mt-2"
                    />
                </View>

                {/* Nom */}
                <View className="mt-6">
                    <Text className="text-base font-medium">
                        Nom <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="(exemple : Dupont)"
                        className="border border-gray-300 rounded-md px-4 py-3 mt-2"
                    />
                    <Text className="text-sm mt-1">
                        Ton profil apparaîtra comme ceci : <Text className="font-bold">Mathilde N.</Text> (ton nom de famille restera
                        secret 😉)
                    </Text>
                </View>

                {/* Ville */}
                <View className="mt-6">
                    <Text className="text-base font-medium">
                        Ville <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        value={city}
                        onChangeText={setCity}
                        placeholder=""
                        className="border border-gray-300 rounded-md px-4 py-3 mt-2"
                    />
                    <Text className="text-sm mt-1">Hâte de proposer des activités autour de chez toi !</Text>
                </View>

                {/* Téléphone avec sélection de pays */}
                <View className="mt-6">
                    <Text className="text-base font-medium">Téléphone</Text>
                    
                    <View className="border border-[#2C5B90] rounded-md flex-row items-center p-3 mt-2">
                        {/* Drapeau du pays sélectionné */}
                        <Image
                            source={{ uri: `https://flagcdn.com/w40/${selectedCountryCode.toLowerCase()}.png` }}
                            className="w-8 h-6 mr-2"
                            resizeMode="contain"
                        />

                        {/* (Option simple) indicatif + champ */}
                        <Text className="mr-2 text-base font-medium">
                            {selectedCountryCode === "FR" ? "+33" : ""}
                        </Text>

                        <TextInput
                            value={phoneNumber}
                            onChangeText={onPhoneChange}
                            placeholder="06 12 34 56 78"
                            keyboardType="phone-pad"
                            className="flex-1"
                        />
                    </View>

                    {!!phoneError && (
                        <Text className="text-red-500 mt-2">{phoneError}</Text>
                    )}

                    {!!formattedNumber && !phoneError && (
                        <Text className="text-sm mt-2 text-gray-600">
                            Format : {formattedNumber}
                        </Text>
                    )}
                </View>

                {/* Pseudo */}
                <View className="mt-6">
                    <Text className="text-base font-medium">
                        Pseudo <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        value={pseudo}
                        onChangeText={setPseudo}
                        placeholder="(exemple : mathilde_d)"
                        autoCapitalize="none"
                        className="border border-gray-300 rounded-md px-4 py-3 mt-2"
                    />
                    <Text className="text-sm mt-1">C'est ton identifiant unique sur Gocial</Text>
                </View>

                {/* Email */}
                <View className="mt-6">
                    <Text className="text-base font-medium">
                        Email <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="mathilde@exemple.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        className="border border-gray-300 rounded-md px-4 py-3 mt-2"
                    />
                </View>

                {/* Mot de passe */}
                <View className="mt-6">
                    <Text className="text-base font-medium">
                        Mot de passe <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Minimum 8 caractères"
                        secureTextEntry
                        className="border border-gray-300 rounded-md px-4 py-3 mt-2"
                    />
                </View>

                {/* Boutons en bas */}
                <View className="flex-row justify-between mt-8 pb-6">
                    <TouchableOpacity
                        className="flex-1 py-3 border border-[#2C5B90] rounded-md mr-2"
                        onPress={() => navigation.navigate("Login")}
                    >
                        <Text className="text-[#2C5B90] text-center font-medium">Abandonner</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 py-3 bg-[#2C5B90] rounded-md ml-2"
                        disabled={loading}
                        style={{ opacity: loading ? 0.7 : 1 }}
                        onPress={async () => {
                            if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !pseudo.trim()) {
                                Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
                                return;
                            }
                            if (password.length < 8) {
                                Alert.alert("Erreur", "Le mot de passe doit contenir au moins 8 caractères.");
                                return;
                            }
                            setLoading(true);
                            try {
                                await register({
                                    email: email.trim().toLowerCase(),
                                    password,
                                    pseudo: pseudo.trim(),
                                    first_name: firstName.trim(),
                                    last_name: lastName.trim(),
                                    birth_date: birthDate || undefined,
                                    gender: selectedGender || undefined,
                                    city: city.trim() || undefined,
                                    phone: formattedNumber || undefined,
                                    user_type: 'person',
                                });
                                // Auth context handles navigation automatically
                            } catch (err: any) {
                                const message =
                                    err?.response?.data?.error ||
                                    err?.response?.data?.message ||
                                    "Erreur lors de l'inscription.";
                                Alert.alert("Inscription échouée", message);
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center font-medium">Valider</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default RegisterPerson;
