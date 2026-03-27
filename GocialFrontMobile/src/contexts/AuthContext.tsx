import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config';
import { authService } from '../services/auth';
import { useTheme } from '../../screens/ThemeContext';
import type { User, LoginData, RegisterData } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setDarkMode } = useTheme();

  // Sync dark mode preference from user profile
  useEffect(() => {
    if (user?.dark_mode !== undefined && user?.dark_mode !== null) {
      setDarkMode(user.dark_mode);
    }
  }, [user?.dark_mode, setDarkMode]);

  // On app start, check if we have a saved session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          try {
            // We have a token, try to get fresh user data from the server
            const { user: freshUser } = await authService.getMe();
            setUser(freshUser);
          } catch {
            // API failed — try cached user as fallback (network issue, not necessarily expired)
            const cachedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
            if (cachedUser) {
              if (__DEV__) console.log('[Auth] getMe failed, using cached user');
              setUser(JSON.parse(cachedUser));
            } else {
              // No cached user either — clear everything
              await Promise.all([
                AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
                AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
                AsyncStorage.removeItem(STORAGE_KEYS.USER),
              ]);
              setUser(null);
            }
          }
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (data: LoginData) => {
    const response = await authService.login(data);

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token),
      AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token),
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user)),
    ]);

    setUser(response.user);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const response = await authService.register(data);

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token),
      AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token),
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user)),
    ]);

    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Server might be unreachable, that's fine
    }

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
    ]);

    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { user: freshUser } = await authService.getMe();
      setUser(prev => {
        if (JSON.stringify(prev) === JSON.stringify(freshUser)) return prev;
        return freshUser;
      });
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser));
    } catch {
      // silently fail
    }
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
      updateUser,
    }),
    [user, isLoading, login, register, logout, refreshUser, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
