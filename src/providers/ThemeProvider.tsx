"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiClient } from "../lib/apiClient";

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    const updateFromState = async () => {
      try {
        const data = await apiClient<any>("/api/marai/state/current", {
          retry: { attempts: 0 },
        });
        const computed = getComputedStyle(root);

        const accent =
          data?.display_color ??
          computed.getPropertyValue("--color-accent")?.trim() ??
          computed.getPropertyValue("--accent")?.trim();
        const motion = (data?.motion_speed ?? computed.getPropertyValue("--motion-speed")?.trim()) || "1";

        if (accent) {
          root.style.setProperty("--color-accent", accent);
        }

        if (motion) {
          root.style.setProperty("--motion-speed", motion);
        }
      } catch (error) {
        // fail silently; polling will retry
      }
    };

    const interval = window.setInterval(updateFromState, 5000);
    updateFromState();

    return () => {
      window.clearInterval(interval);
    };
  }, []);

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
