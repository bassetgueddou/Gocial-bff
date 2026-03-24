import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../screens/ThemeContext';

interface PhoneInputProps {
  value: string;
  onChangeText: (localText: string, fullNumber: string) => void;
  error?: string;
}

// Supported country codes with calling codes
const COUNTRIES: { cca2: string; flag: string; callingCode: string; name: string }[] = [
  { cca2: 'FR', flag: '🇫🇷', callingCode: '33', name: 'France' },
  { cca2: 'BE', flag: '🇧🇪', callingCode: '32', name: 'Belgique' },
  { cca2: 'CH', flag: '🇨🇭', callingCode: '41', name: 'Suisse' },
  { cca2: 'LU', flag: '🇱🇺', callingCode: '352', name: 'Luxembourg' },
  { cca2: 'MC', flag: '🇲🇨', callingCode: '377', name: 'Monaco' },
  { cca2: 'CA', flag: '🇨🇦', callingCode: '1', name: 'Canada' },
  { cca2: 'US', flag: '🇺🇸', callingCode: '1', name: 'États-Unis' },
  { cca2: 'GB', flag: '🇬🇧', callingCode: '44', name: 'Royaume-Uni' },
  { cca2: 'DE', flag: '🇩🇪', callingCode: '49', name: 'Allemagne' },
  { cca2: 'ES', flag: '🇪🇸', callingCode: '34', name: 'Espagne' },
  { cca2: 'IT', flag: '🇮🇹', callingCode: '39', name: 'Italie' },
  { cca2: 'PT', flag: '🇵🇹', callingCode: '351', name: 'Portugal' },
  { cca2: 'NL', flag: '🇳🇱', callingCode: '31', name: 'Pays-Bas' },
  { cca2: 'PL', flag: '🇵🇱', callingCode: '48', name: 'Pologne' },
  { cca2: 'RO', flag: '🇷🇴', callingCode: '40', name: 'Roumanie' },
  { cca2: 'TR', flag: '🇹🇷', callingCode: '90', name: 'Turquie' },
  { cca2: 'MA', flag: '🇲🇦', callingCode: '212', name: 'Maroc' },
  { cca2: 'DZ', flag: '🇩🇿', callingCode: '213', name: 'Algérie' },
  { cca2: 'TN', flag: '🇹🇳', callingCode: '216', name: 'Tunisie' },
  { cca2: 'LY', flag: '🇱🇾', callingCode: '218', name: 'Libye' },
  { cca2: 'EG', flag: '🇪🇬', callingCode: '20', name: 'Égypte' },
  { cca2: 'SN', flag: '🇸🇳', callingCode: '221', name: 'Sénégal' },
  { cca2: 'CI', flag: '🇨🇮', callingCode: '225', name: "Côte d'Ivoire" },
  { cca2: 'CM', flag: '🇨🇲', callingCode: '237', name: 'Cameroun' },
  { cca2: 'MG', flag: '🇲🇬', callingCode: '261', name: 'Madagascar' },
  { cca2: 'CD', flag: '🇨🇩', callingCode: '243', name: 'Congo (RDC)' },
  { cca2: 'BR', flag: '🇧🇷', callingCode: '55', name: 'Brésil' },
  { cca2: 'MX', flag: '🇲🇽', callingCode: '52', name: 'Mexique' },
  { cca2: 'AR', flag: '🇦🇷', callingCode: '54', name: 'Argentine' },
  { cca2: 'JP', flag: '🇯🇵', callingCode: '81', name: 'Japon' },
  { cca2: 'CN', flag: '🇨🇳', callingCode: '86', name: 'Chine' },
  { cca2: 'IN', flag: '🇮🇳', callingCode: '91', name: 'Inde' },
  { cca2: 'AU', flag: '🇦🇺', callingCode: '61', name: 'Australie' },
];

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChangeText, error }) => {
  const { isDarkMode } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);

  const handleSelect = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    setShowPicker(false);
    onChangeText(value, `+${country.callingCode}${value}`);
  };

  const handleChange = (text: string) => {
    onChangeText(text, `+${selectedCountry.callingCode}${text}`);
  };

  return (
    <View className="mb-4">
      <View className={`flex-row items-center rounded-xl px-4 py-3 ${isDarkMode ? 'bg-[#1D1E20]' : 'bg-[#F2F5FA]'} ${error ? 'border border-red-500' : ''}`}>
        {/* Country selector */}
        <TouchableOpacity
          onPress={() => setShowPicker(!showPicker)}
          className="flex-row items-center mr-3"
        >
          <Text className="text-xl">{selectedCountry.flag}</Text>
          <Text className={`ml-1 text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>
            +{selectedCountry.callingCode}
          </Text>
          <Text className="text-gray-400 ml-1 text-xs">▼</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className={`w-px h-5 mr-3 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />

        {/* Phone number input */}
        <TextInput
          className={`flex-1 text-base leading-tight ${isDarkMode ? 'text-white' : 'text-black'}`}
          placeholder="06 12 34 56 78"
          placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
          keyboardType="phone-pad"
          value={value}
          onChangeText={handleChange}
        />
      </View>

      {/* Country picker dropdown */}
      {showPicker && (
        <View className={`mt-1 rounded-xl border ${isDarkMode ? 'bg-[#1D1E20] border-gray-700' : 'bg-white border-gray-200'}`} style={{ maxHeight: 220 }}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {COUNTRIES.map((country) => (
              <TouchableOpacity
                key={country.cca2}
                onPress={() => handleSelect(country)}
                className={`flex-row items-center px-4 py-3 ${selectedCountry.cca2 === country.cca2 ? (isDarkMode ? 'bg-[#1A6EDE22]' : 'bg-[#065C9811]') : ''}`}
              >
                <Text className="text-xl mr-3">{country.flag}</Text>
                <Text className={`flex-1 text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>{country.name}</Text>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>+{country.callingCode}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {error ? <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text> : null}
    </View>
  );
};

export default PhoneInput;
