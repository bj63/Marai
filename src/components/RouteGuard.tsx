"use client";

import React from "react";
import { useSession } from "../providers/SessionProvider";

export function RouteGuard({ section, children }: { section: string; children: React.ReactNode }) {
  const { status } = useSession();
  const requiresAuth = section === "app";

  if (requiresAuth && status === "loading") {
    return <span className="nav-rail__locked">Loading session…</span>;
  }

  if (requiresAuth && status !== "authenticated") {
    return (
      <span className="nav-rail__locked" aria-label="Authentication required">
        🔒 {children}
      </span>
    );
  }

  return <>{children}</>;
}
