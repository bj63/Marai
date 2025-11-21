import React from "react";
import { ThemeProvider } from "../providers/ThemeProvider";
import { SessionProvider } from "../providers/SessionProvider";
import { ToastProvider, ToastViewport } from "../components/ToastHub";
import { TopBar } from "../components/TopBar";
import { NavRail } from "../components/NavRail";
import "../styles/globals.css";

export const metadata = {
  title: "MarAI Experience",
  description: "MarAI prototype routed through the new app directory.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

const APP_NAV = [
  { href: "/", label: "Landing", section: "public" },
  { href: "/login", label: "Login", section: "auth" },
  { href: "/signup", label: "Sign up", section: "auth" },
  { href: "/feed", label: "Feed", section: "app" },
  { href: "/profile/demo", label: "Profile", section: "app" },
  { href: "/chat/alpha", label: "Chat", section: "app" },
  { href: "/social", label: "Social Graph", section: "app" },
];

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <SessionProvider>
            <ToastProvider>
              <div className="layout-shell">
                <TopBar navItems={APP_NAV} />
                <div className="layout-content">
                  <NavRail navItems={APP_NAV} />
                  <main className="layout-main">{children}</main>
                  <ToastViewport />
                </div>
              </div>
            </ToastProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
