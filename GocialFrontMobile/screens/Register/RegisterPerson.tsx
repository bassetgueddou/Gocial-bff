import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import PhoneInput from "../../src/components/PhoneInput";
import AddressAutocomplete from "../../src/components/AddressAutocomplete";
import { StackNavigationProp } from "@react-navigation/stack";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import { useAuth } from "../../src/contexts/AuthContext";
import { authService } from "../../src/services/auth";
import { useTheme } from "../ThemeContext";
import type { InlineErrors, AddressAutocompleteResult } from "../../src/types";

const getPasswordStrength = (pwd: string): number => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    return score;
};
const strengthColors = ['#EF4444', '#F97316', '#EAB308', '#22C55E'];
const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Fort'];

// Définition des noms d'écrans dans le Stack.Navigator
type RootStackParamList = {
    Login: undefined;
    RegisterPerson: undefined;
    RegisterProAsso: undefined;
    AddProfilePhotoPerson: { registerData: import("../../src/types").RegisterData };
};

// Typage de la navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

const RegisterPerson: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { register } = useAuth();
    const { isDarkMode } = useTheme();
    const [selectedGender, setSelectedGender] = useState<"female" | "male" | "non-binary" | null>("female");
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<InlineErrors>({});

    // Date de naissance — TextInput avec auto-formatage JJ/MM/AAAA
    const [birthDateDisplay, setBirthDateDisplay] = useState('');

    const handleBirthDateChange = (text: string) => {
        // Ne garder que les chiffres
        const digits = text.replace(/\D/g, '').slice(0, 8);

        // Auto-insertion des /
        let formatted = '';
        for (let i = 0; i < digits.length; i++) {
            if (i === 2 || i === 4) formatted += '/';
            formatted += digits[i];
        }
        setBirthDateDisplay(formatted);

        // Reset si incomplet
        if (digits.length < 8) {
            setBirthDate('');
            setErrors(prev => { const u = { ...prev }; delete u.birth_date; return u; });
            return;
        }

        // Parse et validation
        const day = parseInt(digits.slice(0, 2), 10);
        const month = parseInt(digits.slice(2, 4), 10);
        const year = parseInt(digits.slice(4, 8), 10);

        if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1920) {
            setErrors(prev => ({ ...prev, birth_date: 'Date invalide' }));
            setBirthDate('');
            return;
        }

        // Vérifier que la date existe réellement (ex: pas 31/02)
        const date = new Date(year, month - 1, day);
        if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
            setErrors(prev => ({ ...prev, birth_date: 'Date invalide' }));
            setBirthDate('');
            return;
        }

        // Vérifier pas dans le futur
        if (date > new Date()) {
            setErrors(prev => ({ ...prev, birth_date: 'Date invalide' }));
            setBirthDate('');
            return;
        }

        // Vérifier âge minimum 13 ans
        const today = new Date();
        let age = today.getFullYear() - year;
        if (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)) {
            age--;
        }

        if (age < 13) {
            setErrors(prev => ({ ...prev, birth_date: 'Tu dois avoir au moins 13 ans' }));
            setBirthDate('');
            return;
        }

        // Tout OK — stocker en ISO pour le backend
        const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setBirthDate(iso);
        setErrors(prev => { const u = { ...prev }; delete u.birth_date; return u; });
    };

    const validateEmail = (val: string) => {
        setErrors(prev => {
            const u = { ...prev };
            if (!val.trim()) { u.email = "L'email est obligatoire"; }
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { u.email = "Format d'email invalide"; }
            else { delete u.email; }
            return u;
        });
    };

    const validatePassword = (val: string) => {
        setErrors(prev => {
            const u = { ...prev };
            if (!val) { u.password = 'Le mot de passe est obligatoire'; }
            else if (val.length < 8) { u.password = '8 caractères minimum'; }
            else if (!/[A-Z]/.test(val)) { u.password = '1 majuscule requise'; }
            else if (!/[a-z]/.test(val)) { u.password = '1 minuscule requise'; }
            else if (!/[0-9]/.test(val)) { u.password = '1 chiffre requis'; }
            else if (!/[^a-zA-Z0-9]/.test(val)) { u.password = '1 caractère spécial requis (!@#$%...).'; }
            else { delete u.password; }
            return u;
        });
    };

    const validatePseudo = (val: string) => {
        setErrors(prev => {
            const u = { ...prev };
            if (val.length > 0 && val.length < 3) { u.pseudo = '3 caractères minimum'; } else { delete u.pseudo; }
            return u;
        });
    };

    const passwordStrength = getPasswordStrength(password);

    const clearError = (field: string) => setErrors(prev => ({ ...prev, [field]: '' }));

    const handleCitySelect = (result: AddressAutocompleteResult) => {
        setCity(result.city || result.address);
    };

    const parseBackendError = (message: string): Partial<InlineErrors> => {
        const lower = message.toLowerCase();
        if (lower.includes('email')) return { email: message };
        if (lower.includes('mot de passe') || lower.includes('password')) return { password: message };
        if (lower.includes('pseudo')) return { pseudo: message };
        if (lower.includes('téléphone') || lower.includes('phone')) return { phone: message };
        if (lower.includes('date') || lower.includes('naissance') || lower.includes('ans')) return { birth_date: message };
        return {};
    };



    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
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
                <Text className="text-red-700 font-medium mt-4">* Obligatoire</Text>

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

                {/* Date de naissance — TextInput auto-formaté */}
                <View className="mt-6">
                    <Text className="text-base font-medium">
                        Né(e) le <Text className="text-red-700">*</Text>
                    </Text>
                    <View className={`flex-row items-center rounded-md px-4 mt-2 border ${errors.birth_date ? 'border-red-500' : 'border-gray-300'}`}>
                        <MaterialIcons name="event" size={20} color="#6B7280" />
                        <TextInput
                            value={birthDateDisplay}
                            onChangeText={handleBirthDateChange}
                            placeholder="JJ/MM/AAAA"
                            keyboardType="numeric"
                            maxLength={10}
                            className="flex-1 ml-2 py-3"
                        />
                    </View>
                    {errors.birth_date ? (
                        <Text className="text-red-700 text-xs mt-1 ml-1">{errors.birth_date}</Text>
                    ) : (
                        <Text className="text-sm mt-1">Tu dois avoir au moins 13 ans</Text>
                    )}
                </View>

                {/* Prénom */}
                <View className="mt-6">
                    <Text className="text-base font-medium">
                        Prénom <Text className="text-red-700">*</Text>
                    </Text>
                    <TextInput
                        value={firstName}
                        onChangeText={t => { setFirstName(t); clearError('first_name'); }}
                        onBlur={() => { if (!firstName.trim()) setErrors(p => ({ ...p, first_name: 'Le prénom est obligatoire' })); }}
                        placeholder="(exemple : Mathilde)"
                        className={`border rounded-md px-4 py-3 mt-2 ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.first_name ? <Text className="text-red-700 text-xs mt-1 ml-1">{errors.first_name}</Text> : null}
                </View>

                {/* Nom */}
                <View className="mt-6">
                    <Text className="text-base font-medium">
                        Nom <Text className="text-red-700">*</Text>
                    </Text>
                    <TextInput
                        value={lastName}
                        onChangeText={t => { setLastName(t); clearError('last_name'); }}
                        onBlur={() => { if (!lastName.trim()) setErrors(p => ({ ...p, last_name: 'Le nom est obligatoire' })); }}
                        placeholder="(exemple : Dupont)"
                        className={`border rounded-md px-4 py-3 mt-2 ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.last_name ? <Text className="text-red-700 text-xs mt-1 ml-1">{errors.last_name}</Text> : null}
                    <Text className="text-sm mt-1">
                        Ton profil apparaîtra comme ceci : <Text className="font-bold">Mathilde N.</Text> (ton nom de famille restera
                        secret 😉)
                    </Text>
                </View>

                {/* Ville */}
                <View className="mt-6">
                    <Text className="text-base font-medium">
                        Ville <Text className="text-red-700">*</Text>
                    </Text>
                    <AddressAutocomplete
                        onSelect={handleCitySelect}
                        placeholder="Rechercher une ville"
                        isDarkMode={isDarkMode}
                        initialValue={city}
                        className="mt-2"
                    />
                    <Text className="text-sm mt-1">Hâte de proposer des activités autour de chez toi !</Text>
                </View>

                {/* Téléphone avec sélection de pays */}
                <View className="mt-6">
                    <Text className="text-base font-medium mb-2">Téléphone</Text>
                    <PhoneInput
                        value={phoneNumber}
                        onChangeText={(local, full) => {
                            setPhoneNumber(local);
                            setFormattedNumber(full);
                            setPhoneError('');
                        }}
                        error={errors.phone || phoneError}
                    />
                </View>

                {/* Pseudo */}
                <View className="mt-6">
                    <Text className="text-base font-medium">
                        Pseudo <Text className="text-red-700">*</Text>
                    </Text>
                    <TextInput
                        value={pseudo}
                        onChangeText={t => { setPseudo(t); clearError('pseudo'); }}
                        onBlur={() => validatePseudo(pseudo)}
                        placeholder="(exemple : mathilde_d)"
                        autoCapitalize="none"
                        className={`border rounded-md px-4 py-3 mt-2 ${errors.pseudo ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.pseudo ? (
                        <Text className="text-red-700 text-xs mt-1 ml-1">{errors.pseudo}</Text>
                    ) : (
                        <Text className="text-sm mt-1">C'est ton identifiant unique sur Gocial</Text>
                    )}
                </View>

                {/* Email */}
                <View className="mt-6">
                    <Text className="text-base font-medium">
                        Email <Text className="text-red-700">*</Text>
                    </Text>
                    <TextInput
                        value={email}
                        onChangeText={t => { setEmail(t); clearError('email'); }}
                        onBlur={() => validateEmail(email)}
                        placeholder="mathilde@exemple.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        className={`border rounded-md px-4 py-3 mt-2 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.email ? <Text className="text-red-700 text-xs mt-1 ml-1">{errors.email}</Text> : null}
                </View>

                {/* Mot de passe */}
                <View className="mt-6">
                    <Text className="text-base font-medium">
                        Mot de passe <Text className="text-red-700">*</Text>
                    </Text>
                    <TextInput
                        value={password}
                        onChangeText={t => { setPassword(t); clearError('password'); }}
                        onBlur={() => validatePassword(password)}
                        placeholder="Minimum 8 caractères"
                        secureTextEntry
                        className={`border rounded-md px-4 py-3 mt-2 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.password ? <Text className="text-red-700 text-xs mt-1 ml-1">{errors.password}</Text> : null}
                    {/* Indicateur de force du mot de passe */}
                    {password.length > 0 && (
                        <View className="mt-2">
                            <View className="flex-row gap-1 mt-1">
                                {[0, 1, 2, 3].map((i) => (
                                    <View
                                        key={i}
                                        className="flex-1 h-1 rounded-full"
                                        style={{ backgroundColor: i < passwordStrength ? strengthColors[passwordStrength - 1] : '#E5E7EB' }}
                                    />
                                ))}
                            </View>
                            {passwordStrength > 0 && (
                                <Text className="text-xs mt-1" style={{ color: strengthColors[passwordStrength - 1] }}>
                                    {strengthLabels[passwordStrength - 1]}
                                </Text>
                            )}
                        </View>
                    )}
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
                        className={`flex-1 py-3 bg-[#2C5B90] rounded-md ml-2 ${isSubmitting ? 'opacity-50' : ''}`}
                        disabled={isSubmitting}
                        onPress={async () => {
                            // Inline validation
                            const validationErrors: InlineErrors = {};
                            if (!firstName.trim()) validationErrors.first_name = 'Le prénom est obligatoire.';
                            if (!lastName.trim()) validationErrors.last_name = 'Le nom est obligatoire.';
                            if (!email.trim()) {
                                validationErrors.email = "L'email est obligatoire.";
                            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                                validationErrors.email = "Format d'email invalide";
                            }
                            if (!pseudo.trim()) {
                                validationErrors.pseudo = 'Le pseudo est obligatoire.';
                            } else if (pseudo.length < 3) {
                                validationErrors.pseudo = '3 caractères minimum';
                            }
                            if (!password) {
                                validationErrors.password = 'Le mot de passe est obligatoire.';
                            } else if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
                                validationErrors.password = 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 chiffre et 1 caractère spécial (!@#$%...).';
                            }
                            if (!birthDate) {
                                validationErrors.birth_date = 'La date de naissance est obligatoire.';
                            }
                            if (Object.keys(validationErrors).length > 0) {
                                setErrors(validationErrors);
                                const nbChamps = Object.keys(validationErrors).length;
                                Toast.show({
                                    type: 'error',
                                    text1: 'Champs obligatoires manquants',
                                    text2: nbChamps === 1
                                        ? 'Veuillez remplir le champ indiqué en rouge.'
                                        : `Veuillez remplir les ${nbChamps} champs indiqués en rouge.`,
                                    position: 'top',
                                    topOffset: 60,
                                });
                                return;
                            }

                            // Vérifier disponibilité email + pseudo côté serveur
                            setIsSubmitting(true);
                            try {
                                const [emailCheck, pseudoCheck] = await Promise.all([
                                    authService.checkEmail(email.trim().toLowerCase()),
                                    authService.checkPseudo(pseudo.trim()),
                                ]);
                                const serverErrors: InlineErrors = {};
                                if (!emailCheck.available) {
                                    serverErrors.email = emailCheck.reason || 'Cet email est déjà utilisé';
                                }
                                if (!pseudoCheck.available) {
                                    serverErrors.pseudo = pseudoCheck.reason || 'Ce pseudo est déjà pris';
                                }
                                if (Object.keys(serverErrors).length > 0) {
                                    setErrors(serverErrors);
                                    Toast.show({
                                        type: 'error',
                                        text1: 'Inscription impossible',
                                        text2: Object.values(serverErrors).join('. '),
                                        position: 'top',
                                        topOffset: 60,
                                    });
                                    return;
                                }
                            } catch {
                                Toast.show({
                                    type: 'error',
                                    text1: 'Erreur de connexion',
                                    text2: 'Impossible de vérifier la disponibilité. Réessaie.',
                                    position: 'top',
                                    topOffset: 60,
                                });
                                return;
                            } finally {
                                setIsSubmitting(false);
                            }

                            navigation.navigate("AddProfilePhotoPerson", {
                                registerData: {
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
                                },
                            });
                        }}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text className="text-white text-center font-medium">Créer mon compte</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RegisterPerson;
