"use client";

import React from "react";
import { useTheme, ThemeVariant } from "../providers/ThemeProvider";
import { useSession } from "../providers/SessionProvider";
import { useToasts } from "./ToastHub";
import { NotificationsBell } from "./NotificationsBell";

type NavItem = { href: string; label: string; section: string };

type TopBarProps = {
  navItems: NavItem[];
};

const themes: ThemeVariant[] = ["dark", "pastel", "cyberpunk"];

export function TopBar({ navItems }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const { status, profile } = useSession();
  const { addToast } = useToasts();

  const onThemeSelect = (variant: ThemeVariant) => {
    setTheme(variant);
    addToast({ title: `Theme changed to ${variant}`, tone: "success" });
  };

  return (
    <header className="top-bar">
      <div className="top-bar__brand">
        <span className="brand-mark">MarAI</span>
        <nav className="top-bar__nav">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="top-bar__link">
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="top-bar__actions">
        <NotificationsBell />
        <div className="theme-toggle">
          {themes.map((variant) => (
            <button
              key={variant}
              aria-label={`Switch to ${variant} theme`}
              className={theme === variant ? "active" : ""}
              onClick={() => onThemeSelect(variant)}
            >
              {variant}
            </button>
          ))}
        </div>
        <div className="session-chip">
          {status === "authenticated" && profile ? (
            <span>
              Signed in as <strong>{profile.displayName}</strong>
            </span>
          ) : (
            <span>Public Mode</span>
          )}
        </div>
      </div>
    </header>
  );
}
