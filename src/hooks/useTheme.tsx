import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ThemeColors, darkTheme, lightTheme } from '../theme/tokens';

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'tema_v1';

interface ThemeContextValue {
  colors: ThemeColors;
  mode: ThemeMode;
  toggle: () => void;
}

// preferência de aparência é do dispositivo/app, não da conta — por isso não é
// escopada por e-mail como o resto das configs (também evita depender do
// usuário já estar logado, já que a casca do app é temada antes do login)
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY).then((v) => {
      if (v === 'light' || v === 'dark') setMode(v);
    });
  }, []);

  function toggle() {
    setMode((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      SecureStore.setItemAsync(STORAGE_KEY, next).catch((e) =>
        console.error('[ThemeProvider] falhou ao salvar tema:', e),
      );
      return next;
    });
  }

  const colors = mode === 'dark' ? darkTheme : lightTheme;

  return <ThemeContext.Provider value={{ colors, mode, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme precisa estar dentro de um ThemeProvider');
  return ctx;
}
