import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useColorScheme } from "react-native";

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme(); // Détecte le mode du système (iOS/Android)
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === "dark");

  const toggleDarkMode = useCallback(() => setIsDarkMode((prev) => !prev), []);

  const setDarkMode = useCallback((value: boolean) => {
    setIsDarkMode(value);
  }, []);

  // 🔍 DIAGNOSTIC TEMPORAIRE — À SUPPRIMER après debug
  if (__DEV__) {
    console.log('[ThemeContext] render — isDarkMode:', isDarkMode);
  }

  // ⚠️ RÈGLE DEPS : mémoïser la valeur du context pour éviter re-renders en cascade
  const value = useMemo(() => ({ isDarkMode, toggleDarkMode, setDarkMode }), [isDarkMode, toggleDarkMode, setDarkMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personnalisé pour utiliser le thème
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
