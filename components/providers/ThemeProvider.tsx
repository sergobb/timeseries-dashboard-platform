'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export const THEME_STORAGE_KEY = 'theme';

type Theme = 'light' | 'dark' | 'light-blue' | 'dark-blue';

const VALID_THEMES: Theme[] = ['light', 'dark', 'light-blue', 'dark-blue'];

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && VALID_THEMES.includes(stored as Theme)) return stored as Theme;
    if (stored === 'system') {
      const resolved: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      localStorage.setItem(THEME_STORAGE_KEY, resolved);
      return resolved;
    }
  } catch (_) {}
  return 'light';
}

function writeStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (_) {}
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  const resolvedTheme: ThemeContextType['resolvedTheme'] =
    theme === 'dark' || theme === 'dark-blue' ? 'dark' : 'light';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(...VALID_THEMES, 'dark');
    root.classList.add(theme);
    if (theme === 'dark' || theme === 'dark-blue') root.classList.add('dark');
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    writeStoredTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

