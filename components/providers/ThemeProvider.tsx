'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'light-blue' | 'dark-blue';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';

    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark' || stored === 'light-blue' || stored === 'dark-blue') {
      return stored;
    }

    if (stored === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const resolved: Theme = systemPrefersDark ? 'dark' : 'light';
      localStorage.setItem('theme', resolved);
      return resolved;
    }

    return 'light';
  });

  const resolvedTheme: ThemeContextType['resolvedTheme'] =
    theme === 'dark' || theme === 'dark-blue' ? 'dark' : 'light';

  useEffect(() => {
    const root = document.documentElement;
    const themeClasses: Theme[] = ['light', 'dark', 'light-blue', 'dark-blue'];
    root.classList.remove(...themeClasses, 'dark');
    root.classList.add(theme);
    if (theme === 'dark' || theme === 'dark-blue') {
      root.classList.add('dark');
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
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

