'use client';

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme:        Theme;
  setTheme:     (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children:      ReactNode;
  defaultTheme?: Theme;
  storageKey?:   string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey   = 'augure-theme',
}: ThemeProviderProps) {
  // Lazy initializer — reads localStorage on first render only (client-side)
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    return (localStorage.getItem(storageKey) as Theme | null) ?? defaultTheme;
  });

  // Derive resolved theme (no extra state — avoids setState-in-effect)
  const resolvedTheme = useMemo<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    if (theme !== 'system') return theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, [theme]);

  // Apply data-theme attribute on <html> — pure DOM side-effect, no setState
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  // Listen for system preference changes when theme === 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      document.documentElement.setAttribute(
        'data-theme',
        mq.matches ? 'dark' : 'light',
      );
    };
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
