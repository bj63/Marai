"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeVariant = "dark" | "pastel" | "cyberpunk";

type ThemeContextValue = {
  theme: ThemeVariant;
  setTheme: (theme: ThemeVariant) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = "marai-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeVariant>("dark");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem(THEME_KEY) as ThemeVariant | null) : null;
    if (stored) {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (next: ThemeVariant) => setThemeState(next),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
