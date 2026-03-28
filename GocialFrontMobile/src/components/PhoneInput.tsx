import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../screens/ThemeContext';

interface PhoneInputProps {
  value: string;
  onChangeText: (localText: string, fullNumber: string) => void;
  error?: string;
}

// All countries with calling codes — sorted alphabetically (French names)
const COUNTRIES: { cca2: string; flag: string; callingCode: string; name: string }[] = [
  { cca2: 'AF', flag: '🇦🇫', callingCode: '93', name: 'Afghanistan' },
  { cca2: 'ZA', flag: '🇿🇦', callingCode: '27', name: 'Afrique du Sud' },
  { cca2: 'AL', flag: '🇦🇱', callingCode: '355', name: 'Albanie' },
  { cca2: 'DZ', flag: '🇩🇿', callingCode: '213', name: 'Algérie' },
  { cca2: 'DE', flag: '🇩🇪', callingCode: '49', name: 'Allemagne' },
  { cca2: 'AD', flag: '🇦🇩', callingCode: '376', name: 'Andorre' },
  { cca2: 'AO', flag: '🇦🇴', callingCode: '244', name: 'Angola' },
  { cca2: 'AG', flag: '🇦🇬', callingCode: '1268', name: 'Antigua-et-Barbuda' },
  { cca2: 'SA', flag: '🇸🇦', callingCode: '966', name: 'Arabie saoudite' },
  { cca2: 'AR', flag: '🇦🇷', callingCode: '54', name: 'Argentine' },
  { cca2: 'AM', flag: '🇦🇲', callingCode: '374', name: 'Arménie' },
  { cca2: 'AU', flag: '🇦🇺', callingCode: '61', name: 'Australie' },
  { cca2: 'AT', flag: '🇦🇹', callingCode: '43', name: 'Autriche' },
  { cca2: 'AZ', flag: '🇦🇿', callingCode: '994', name: 'Azerbaïdjan' },
  { cca2: 'BS', flag: '🇧🇸', callingCode: '1242', name: 'Bahamas' },
  { cca2: 'BH', flag: '🇧🇭', callingCode: '973', name: 'Bahreïn' },
  { cca2: 'BD', flag: '🇧🇩', callingCode: '880', name: 'Bangladesh' },
  { cca2: 'BB', flag: '🇧🇧', callingCode: '1246', name: 'Barbade' },
  { cca2: 'BE', flag: '🇧🇪', callingCode: '32', name: 'Belgique' },
  { cca2: 'BZ', flag: '🇧🇿', callingCode: '501', name: 'Belize' },
  { cca2: 'BJ', flag: '🇧🇯', callingCode: '229', name: 'Bénin' },
  { cca2: 'BT', flag: '🇧🇹', callingCode: '975', name: 'Bhoutan' },
  { cca2: 'BY', flag: '🇧🇾', callingCode: '375', name: 'Biélorussie' },
  { cca2: 'BO', flag: '🇧🇴', callingCode: '591', name: 'Bolivie' },
  { cca2: 'BA', flag: '🇧🇦', callingCode: '387', name: 'Bosnie-Herzégovine' },
  { cca2: 'BW', flag: '🇧🇼', callingCode: '267', name: 'Botswana' },
  { cca2: 'BR', flag: '🇧🇷', callingCode: '55', name: 'Brésil' },
  { cca2: 'BN', flag: '🇧🇳', callingCode: '673', name: 'Brunei' },
  { cca2: 'BG', flag: '🇧🇬', callingCode: '359', name: 'Bulgarie' },
  { cca2: 'BF', flag: '🇧🇫', callingCode: '226', name: 'Burkina Faso' },
  { cca2: 'BI', flag: '🇧🇮', callingCode: '257', name: 'Burundi' },
  { cca2: 'KH', flag: '🇰🇭', callingCode: '855', name: 'Cambodge' },
  { cca2: 'CM', flag: '🇨🇲', callingCode: '237', name: 'Cameroun' },
  { cca2: 'CA', flag: '🇨🇦', callingCode: '1', name: 'Canada' },
  { cca2: 'CV', flag: '🇨🇻', callingCode: '238', name: 'Cap-Vert' },
  { cca2: 'CF', flag: '🇨🇫', callingCode: '236', name: 'Centrafrique' },
  { cca2: 'CL', flag: '🇨🇱', callingCode: '56', name: 'Chili' },
  { cca2: 'CN', flag: '🇨🇳', callingCode: '86', name: 'Chine' },
  { cca2: 'CY', flag: '🇨🇾', callingCode: '357', name: 'Chypre' },
  { cca2: 'CO', flag: '🇨🇴', callingCode: '57', name: 'Colombie' },
  { cca2: 'KM', flag: '🇰🇲', callingCode: '269', name: 'Comores' },
  { cca2: 'CG', flag: '🇨🇬', callingCode: '242', name: 'Congo' },
  { cca2: 'CD', flag: '🇨🇩', callingCode: '243', name: 'Congo (RDC)' },
  { cca2: 'KR', flag: '🇰🇷', callingCode: '82', name: 'Corée du Sud' },
  { cca2: 'KP', flag: '🇰🇵', callingCode: '850', name: 'Corée du Nord' },
  { cca2: 'CR', flag: '🇨🇷', callingCode: '506', name: 'Costa Rica' },
  { cca2: 'CI', flag: '🇨🇮', callingCode: '225', name: "Côte d'Ivoire" },
  { cca2: 'HR', flag: '🇭🇷', callingCode: '385', name: 'Croatie' },
  { cca2: 'CU', flag: '🇨🇺', callingCode: '53', name: 'Cuba' },
  { cca2: 'DK', flag: '🇩🇰', callingCode: '45', name: 'Danemark' },
  { cca2: 'DJ', flag: '🇩🇯', callingCode: '253', name: 'Djibouti' },
  { cca2: 'DM', flag: '🇩🇲', callingCode: '1767', name: 'Dominique' },
  { cca2: 'EG', flag: '🇪🇬', callingCode: '20', name: 'Égypte' },
  { cca2: 'AE', flag: '🇦🇪', callingCode: '971', name: 'Émirats arabes unis' },
  { cca2: 'EC', flag: '🇪🇨', callingCode: '593', name: 'Équateur' },
  { cca2: 'ER', flag: '🇪🇷', callingCode: '291', name: 'Érythrée' },
  { cca2: 'ES', flag: '🇪🇸', callingCode: '34', name: 'Espagne' },
  { cca2: 'EE', flag: '🇪🇪', callingCode: '372', name: 'Estonie' },
  { cca2: 'SZ', flag: '🇸🇿', callingCode: '268', name: 'Eswatini' },
  { cca2: 'US', flag: '🇺🇸', callingCode: '1', name: 'États-Unis' },
  { cca2: 'ET', flag: '🇪🇹', callingCode: '251', name: 'Éthiopie' },
  { cca2: 'FJ', flag: '🇫🇯', callingCode: '679', name: 'Fidji' },
  { cca2: 'FI', flag: '🇫🇮', callingCode: '358', name: 'Finlande' },
  { cca2: 'FR', flag: '🇫🇷', callingCode: '33', name: 'France' },
  { cca2: 'GA', flag: '🇬🇦', callingCode: '241', name: 'Gabon' },
  { cca2: 'GM', flag: '🇬🇲', callingCode: '220', name: 'Gambie' },
  { cca2: 'GE', flag: '🇬🇪', callingCode: '995', name: 'Géorgie' },
  { cca2: 'GH', flag: '🇬🇭', callingCode: '233', name: 'Ghana' },
  { cca2: 'GR', flag: '🇬🇷', callingCode: '30', name: 'Grèce' },
  { cca2: 'GD', flag: '🇬🇩', callingCode: '1473', name: 'Grenade' },
  { cca2: 'GT', flag: '🇬🇹', callingCode: '502', name: 'Guatemala' },
  { cca2: 'GN', flag: '🇬🇳', callingCode: '224', name: 'Guinée' },
  { cca2: 'GQ', flag: '🇬🇶', callingCode: '240', name: 'Guinée équatoriale' },
  { cca2: 'GW', flag: '🇬🇼', callingCode: '245', name: 'Guinée-Bissau' },
  { cca2: 'GY', flag: '🇬🇾', callingCode: '592', name: 'Guyana' },
  { cca2: 'HT', flag: '🇭🇹', callingCode: '509', name: 'Haïti' },
  { cca2: 'HN', flag: '🇭🇳', callingCode: '504', name: 'Honduras' },
  { cca2: 'HU', flag: '🇭🇺', callingCode: '36', name: 'Hongrie' },
  { cca2: 'IN', flag: '🇮🇳', callingCode: '91', name: 'Inde' },
  { cca2: 'ID', flag: '🇮🇩', callingCode: '62', name: 'Indonésie' },
  { cca2: 'IQ', flag: '🇮🇶', callingCode: '964', name: 'Irak' },
  { cca2: 'IR', flag: '🇮🇷', callingCode: '98', name: 'Iran' },
  { cca2: 'IE', flag: '🇮🇪', callingCode: '353', name: 'Irlande' },
  { cca2: 'IS', flag: '🇮🇸', callingCode: '354', name: 'Islande' },
  { cca2: 'IL', flag: '🇮🇱', callingCode: '972', name: 'Israël' },
  { cca2: 'IT', flag: '🇮🇹', callingCode: '39', name: 'Italie' },
  { cca2: 'JM', flag: '🇯🇲', callingCode: '1876', name: 'Jamaïque' },
  { cca2: 'JP', flag: '🇯🇵', callingCode: '81', name: 'Japon' },
  { cca2: 'JO', flag: '🇯🇴', callingCode: '962', name: 'Jordanie' },
  { cca2: 'KZ', flag: '🇰🇿', callingCode: '7', name: 'Kazakhstan' },
  { cca2: 'KE', flag: '🇰🇪', callingCode: '254', name: 'Kenya' },
  { cca2: 'KG', flag: '🇰🇬', callingCode: '996', name: 'Kirghizistan' },
  { cca2: 'KI', flag: '🇰🇮', callingCode: '686', name: 'Kiribati' },
  { cca2: 'KW', flag: '🇰🇼', callingCode: '965', name: 'Koweït' },
  { cca2: 'LA', flag: '🇱🇦', callingCode: '856', name: 'Laos' },
  { cca2: 'LS', flag: '🇱🇸', callingCode: '266', name: 'Lesotho' },
  { cca2: 'LV', flag: '🇱🇻', callingCode: '371', name: 'Lettonie' },
  { cca2: 'LB', flag: '🇱🇧', callingCode: '961', name: 'Liban' },
  { cca2: 'LR', flag: '🇱🇷', callingCode: '231', name: 'Liberia' },
  { cca2: 'LY', flag: '🇱🇾', callingCode: '218', name: 'Libye' },
  { cca2: 'LI', flag: '🇱🇮', callingCode: '423', name: 'Liechtenstein' },
  { cca2: 'LT', flag: '🇱🇹', callingCode: '370', name: 'Lituanie' },
  { cca2: 'LU', flag: '🇱🇺', callingCode: '352', name: 'Luxembourg' },
  { cca2: 'MK', flag: '🇲🇰', callingCode: '389', name: 'Macédoine du Nord' },
  { cca2: 'MG', flag: '🇲🇬', callingCode: '261', name: 'Madagascar' },
  { cca2: 'MY', flag: '🇲🇾', callingCode: '60', name: 'Malaisie' },
  { cca2: 'MW', flag: '🇲🇼', callingCode: '265', name: 'Malawi' },
  { cca2: 'MV', flag: '🇲🇻', callingCode: '960', name: 'Maldives' },
  { cca2: 'ML', flag: '🇲🇱', callingCode: '223', name: 'Mali' },
  { cca2: 'MT', flag: '🇲🇹', callingCode: '356', name: 'Malte' },
  { cca2: 'MA', flag: '🇲🇦', callingCode: '212', name: 'Maroc' },
  { cca2: 'MU', flag: '🇲🇺', callingCode: '230', name: 'Maurice' },
  { cca2: 'MR', flag: '🇲🇷', callingCode: '222', name: 'Mauritanie' },
  { cca2: 'MX', flag: '🇲🇽', callingCode: '52', name: 'Mexique' },
  { cca2: 'FM', flag: '🇫🇲', callingCode: '691', name: 'Micronésie' },
  { cca2: 'MD', flag: '🇲🇩', callingCode: '373', name: 'Moldavie' },
  { cca2: 'MC', flag: '🇲🇨', callingCode: '377', name: 'Monaco' },
  { cca2: 'MN', flag: '🇲🇳', callingCode: '976', name: 'Mongolie' },
  { cca2: 'ME', flag: '🇲🇪', callingCode: '382', name: 'Monténégro' },
  { cca2: 'MZ', flag: '🇲🇿', callingCode: '258', name: 'Mozambique' },
  { cca2: 'MM', flag: '🇲🇲', callingCode: '95', name: 'Myanmar' },
  { cca2: 'NA', flag: '🇳🇦', callingCode: '264', name: 'Namibie' },
  { cca2: 'NR', flag: '🇳🇷', callingCode: '674', name: 'Nauru' },
  { cca2: 'NP', flag: '🇳🇵', callingCode: '977', name: 'Népal' },
  { cca2: 'NI', flag: '🇳🇮', callingCode: '505', name: 'Nicaragua' },
  { cca2: 'NE', flag: '🇳🇪', callingCode: '227', name: 'Niger' },
  { cca2: 'NG', flag: '🇳🇬', callingCode: '234', name: 'Nigeria' },
  { cca2: 'NO', flag: '🇳🇴', callingCode: '47', name: 'Norvège' },
  { cca2: 'NZ', flag: '🇳🇿', callingCode: '64', name: 'Nouvelle-Zélande' },
  { cca2: 'OM', flag: '🇴🇲', callingCode: '968', name: 'Oman' },
  { cca2: 'UG', flag: '🇺🇬', callingCode: '256', name: 'Ouganda' },
  { cca2: 'UZ', flag: '🇺🇿', callingCode: '998', name: 'Ouzbékistan' },
  { cca2: 'PK', flag: '🇵🇰', callingCode: '92', name: 'Pakistan' },
  { cca2: 'PW', flag: '🇵🇼', callingCode: '680', name: 'Palaos' },
  { cca2: 'PS', flag: '🇵🇸', callingCode: '970', name: 'Palestine' },
  { cca2: 'PA', flag: '🇵🇦', callingCode: '507', name: 'Panama' },
  { cca2: 'PG', flag: '🇵🇬', callingCode: '675', name: 'Papouasie-Nouvelle-Guinée' },
  { cca2: 'PY', flag: '🇵🇾', callingCode: '595', name: 'Paraguay' },
  { cca2: 'NL', flag: '🇳🇱', callingCode: '31', name: 'Pays-Bas' },
  { cca2: 'PE', flag: '🇵🇪', callingCode: '51', name: 'Pérou' },
  { cca2: 'PH', flag: '🇵🇭', callingCode: '63', name: 'Philippines' },
  { cca2: 'PL', flag: '🇵🇱', callingCode: '48', name: 'Pologne' },
  { cca2: 'PT', flag: '🇵🇹', callingCode: '351', name: 'Portugal' },
  { cca2: 'QA', flag: '🇶🇦', callingCode: '974', name: 'Qatar' },
  { cca2: 'DO', flag: '🇩🇴', callingCode: '1809', name: 'République dominicaine' },
  { cca2: 'CZ', flag: '🇨🇿', callingCode: '420', name: 'République tchèque' },
  { cca2: 'RO', flag: '🇷🇴', callingCode: '40', name: 'Roumanie' },
  { cca2: 'GB', flag: '🇬🇧', callingCode: '44', name: 'Royaume-Uni' },
  { cca2: 'RU', flag: '🇷🇺', callingCode: '7', name: 'Russie' },
  { cca2: 'RW', flag: '🇷🇼', callingCode: '250', name: 'Rwanda' },
  { cca2: 'KN', flag: '🇰🇳', callingCode: '1869', name: 'Saint-Kitts-et-Nevis' },
  { cca2: 'VC', flag: '🇻🇨', callingCode: '1784', name: 'Saint-Vincent-et-les-Grenadines' },
  { cca2: 'LC', flag: '🇱🇨', callingCode: '1758', name: 'Sainte-Lucie' },
  { cca2: 'SB', flag: '🇸🇧', callingCode: '677', name: 'Salomon' },
  { cca2: 'SV', flag: '🇸🇻', callingCode: '503', name: 'Salvador' },
  { cca2: 'WS', flag: '🇼🇸', callingCode: '685', name: 'Samoa' },
  { cca2: 'ST', flag: '🇸🇹', callingCode: '239', name: 'São Tomé-et-Príncipe' },
  { cca2: 'SN', flag: '🇸🇳', callingCode: '221', name: 'Sénégal' },
  { cca2: 'RS', flag: '🇷🇸', callingCode: '381', name: 'Serbie' },
  { cca2: 'SC', flag: '🇸🇨', callingCode: '248', name: 'Seychelles' },
  { cca2: 'SL', flag: '🇸🇱', callingCode: '232', name: 'Sierra Leone' },
  { cca2: 'SG', flag: '🇸🇬', callingCode: '65', name: 'Singapour' },
  { cca2: 'SK', flag: '🇸🇰', callingCode: '421', name: 'Slovaquie' },
  { cca2: 'SI', flag: '🇸🇮', callingCode: '386', name: 'Slovénie' },
  { cca2: 'SO', flag: '🇸🇴', callingCode: '252', name: 'Somalie' },
  { cca2: 'SD', flag: '🇸🇩', callingCode: '249', name: 'Soudan' },
  { cca2: 'SS', flag: '🇸🇸', callingCode: '211', name: 'Soudan du Sud' },
  { cca2: 'LK', flag: '🇱🇰', callingCode: '94', name: 'Sri Lanka' },
  { cca2: 'SE', flag: '🇸🇪', callingCode: '46', name: 'Suède' },
  { cca2: 'CH', flag: '🇨🇭', callingCode: '41', name: 'Suisse' },
  { cca2: 'SR', flag: '🇸🇷', callingCode: '597', name: 'Suriname' },
  { cca2: 'SY', flag: '🇸🇾', callingCode: '963', name: 'Syrie' },
  { cca2: 'TJ', flag: '🇹🇯', callingCode: '992', name: 'Tadjikistan' },
  { cca2: 'TZ', flag: '🇹🇿', callingCode: '255', name: 'Tanzanie' },
  { cca2: 'TD', flag: '🇹🇩', callingCode: '235', name: 'Tchad' },
  { cca2: 'TH', flag: '🇹🇭', callingCode: '66', name: 'Thaïlande' },
  { cca2: 'TL', flag: '🇹🇱', callingCode: '670', name: 'Timor oriental' },
  { cca2: 'TG', flag: '🇹🇬', callingCode: '228', name: 'Togo' },
  { cca2: 'TO', flag: '🇹🇴', callingCode: '676', name: 'Tonga' },
  { cca2: 'TT', flag: '🇹🇹', callingCode: '1868', name: 'Trinité-et-Tobago' },
  { cca2: 'TN', flag: '🇹🇳', callingCode: '216', name: 'Tunisie' },
  { cca2: 'TM', flag: '🇹🇲', callingCode: '993', name: 'Turkménistan' },
  { cca2: 'TR', flag: '🇹🇷', callingCode: '90', name: 'Turquie' },
  { cca2: 'TV', flag: '🇹🇻', callingCode: '688', name: 'Tuvalu' },
  { cca2: 'UA', flag: '🇺🇦', callingCode: '380', name: 'Ukraine' },
  { cca2: 'UY', flag: '🇺🇾', callingCode: '598', name: 'Uruguay' },
  { cca2: 'VU', flag: '🇻🇺', callingCode: '678', name: 'Vanuatu' },
  { cca2: 'VE', flag: '🇻🇪', callingCode: '58', name: 'Venezuela' },
  { cca2: 'VN', flag: '🇻🇳', callingCode: '84', name: 'Vietnam' },
  { cca2: 'YE', flag: '🇾🇪', callingCode: '967', name: 'Yémen' },
  { cca2: 'ZM', flag: '🇿🇲', callingCode: '260', name: 'Zambie' },
  { cca2: 'ZW', flag: '🇿🇼', callingCode: '263', name: 'Zimbabwe' },
  // Territoires et régions
  { cca2: 'HK', flag: '🇭🇰', callingCode: '852', name: 'Hong Kong' },
  { cca2: 'MO', flag: '🇲🇴', callingCode: '853', name: 'Macao' },
  { cca2: 'TW', flag: '🇹🇼', callingCode: '886', name: 'Taïwan' },
  { cca2: 'PR', flag: '🇵🇷', callingCode: '1787', name: 'Porto Rico' },
  { cca2: 'GP', flag: '🇬🇵', callingCode: '590', name: 'Guadeloupe' },
  { cca2: 'MQ', flag: '🇲🇶', callingCode: '596', name: 'Martinique' },
  { cca2: 'GF', flag: '🇬🇫', callingCode: '594', name: 'Guyane française' },
  { cca2: 'RE', flag: '🇷🇪', callingCode: '262', name: 'La Réunion' },
  { cca2: 'YT', flag: '🇾🇹', callingCode: '262', name: 'Mayotte' },
  { cca2: 'NC', flag: '🇳🇨', callingCode: '687', name: 'Nouvelle-Calédonie' },
  { cca2: 'PF', flag: '🇵🇫', callingCode: '689', name: 'Polynésie française' },
];

// France en premier, puis le reste trié alphabétiquement
const SORTED_COUNTRIES = [
  COUNTRIES.find(c => c.cca2 === 'FR')!,
  ...COUNTRIES.filter(c => c.cca2 !== 'FR'),
];

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChangeText, error }) => {
  const { isDarkMode } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(SORTED_COUNTRIES[0]);
  const [search, setSearch] = useState('');

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return SORTED_COUNTRIES;
    const q = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return SORTED_COUNTRIES.filter(c => {
      const name = c.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return name.includes(q) || c.callingCode.includes(q) || c.cca2.toLowerCase().includes(q);
    });
  }, [search]);

  const handleSelect = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    setShowPicker(false);
    setSearch('');
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
          onPress={() => { setShowPicker(!showPicker); setSearch(''); }}
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
        <View className={`mt-1 rounded-xl border ${isDarkMode ? 'bg-[#1D1E20] border-gray-700' : 'bg-white border-gray-200'}`} style={{ maxHeight: 300 }}>
          {/* Search bar */}
          <View className={`px-3 pt-3 pb-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Rechercher un pays..."
              placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
              autoFocus
              className={`rounded-lg px-3 py-2 text-sm ${isDarkMode ? 'bg-[#2A2B2D] text-white' : 'bg-[#F2F5FA] text-black'}`}
            />
          </View>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {filteredCountries.map((country) => (
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
            {filteredCountries.length === 0 && (
              <Text className={`text-center py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Aucun pays trouvé</Text>
            )}
          </ScrollView>
        </View>
      )}

      {error ? <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text> : null}
    </View>
  );
};

export default PhoneInput;
