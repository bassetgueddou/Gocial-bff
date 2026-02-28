import { Platform } from 'react-native';

// Android emulator uses 10.0.2.2 to reach host machine's localhost
// iOS simulator uses localhost directly
// For physical devices, use your machine's local IP
const DEV_API_URL = Platform.select({
  android: 'http://10.0.2.2:5000',
  ios: 'http://localhost:5000',
  default: 'http://localhost:5000',
});

export const API_URL = __DEV__ ? DEV_API_URL : 'https://api.gocial.app';

export const API_TIMEOUT = 15000; // 15 seconds

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@gocial_access_token',
  REFRESH_TOKEN: '@gocial_refresh_token',
  USER: '@gocial_user',
} as const;
