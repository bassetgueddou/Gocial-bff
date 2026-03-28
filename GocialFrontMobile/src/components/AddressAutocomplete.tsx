import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import type { NominatimResult, AddressAutocompleteResult } from '../types';

interface AddressAutocompleteProps {
  onSelect: (result: AddressAutocompleteResult) => void;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  className?: string;
  isDarkMode: boolean;
  initialValue?: string;
}

const DEBOUNCE_MS = 500;
const NOMINATIM_URL =
  'https://nominatim.openstreetmap.org/search';

function extractCity(address: NominatimResult['address']): string {
  return address.city || address.town || address.village || address.municipality || '';
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onSelect,
  onChangeText: onChangeTextProp,
  placeholder = 'Rechercher une adresse',
  className,
  isDarkMode,
  initialValue = '',
}) => {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchAddress = useCallback(async (text: string) => {
    if (text.trim().length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: text,
        format: 'json',
        addressdetails: '1',
        limit: '5',
        countrycodes: 'fr',
      });
      const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
        headers: {
          'User-Agent': 'Gocial-App/1.0',
          Accept: 'application/json',
        },
      });
      const data: NominatimResult[] = await response.json();
      setResults(data);
      setShowResults(data.length > 0);
    } catch {
      setResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      onChangeTextProp?.(text);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        searchAddress(text);
      }, DEBOUNCE_MS);
    },
    [searchAddress, onChangeTextProp],
  );

  const handleSelect = useCallback(
    (item: NominatimResult) => {
      const city = extractCity(item.address);
      setQuery(item.display_name);
      setShowResults(false);
      setResults([]);
      onSelect({
        address: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        city,
      });
    },
    [onSelect],
  );

  return (
    <View className={className}>
      <View
        className={`flex-row items-center border rounded-md px-4 py-3 ${
          isDarkMode
            ? 'bg-[#1D1E20] border-white'
            : 'bg-white border-[#065C98]'
        }`}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={isDarkMode ? '#9EA1AB' : '#737373'}
          className={`flex-1 ${isDarkMode ? 'text-white' : 'text-black'}`}
          value={query}
          onChangeText={handleChangeText}
        />
        {loading && <ActivityIndicator size="small" color={isDarkMode ? '#1A6EDE' : '#065C98'} />}
      </View>

      {showResults && (
        <View
          className={`border rounded-md mt-1 max-h-48 ${
            isDarkMode
              ? 'bg-[#1D1E20] border-gray-700'
              : 'bg-white border-gray-300'
          }`}
        >
          <FlatList
            data={results}
            keyExtractor={(item) => item.place_id.toString()}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                className={`px-4 py-3 border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <Text
                  className={`text-sm ${
                    isDarkMode ? 'text-white' : 'text-black'
                  }`}
                  numberOfLines={2}
                >
                  {item.display_name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default AddressAutocomplete;
