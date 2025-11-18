import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { bootstrapSession, SessionSnapshot } from "../lib/sessionBootstrap";

export type SessionStatus = "idle" | "loading" | "authenticated" | "public" | "error";

type SessionContextValue = {
  status: SessionStatus;
  profile?: SessionSnapshot["profile"];
  themes?: SessionSnapshot["themes"];
  marai?: SessionSnapshot["marai"];
  refresh: () => Promise<void>;
  setStatus: (status: SessionStatus) => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [profile, setProfile] = useState<SessionSnapshot["profile"]>();
  const [themes, setThemes] = useState<SessionSnapshot["themes"]>();
  const [marai, setMarai] = useState<SessionSnapshot["marai"]>();

  const refresh = async () => {
    setStatus("loading");
    try {
      const snapshot = await bootstrapSession();
      setProfile(snapshot.profile);
      setThemes(snapshot.themes);
      setMarai(snapshot.marai);
      setStatus(snapshot.authenticated ? "authenticated" : "public");
    } catch (error) {
      console.error("session bootstrap failed", error);
      setStatus("error");
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({ status, profile, themes, marai, refresh, setStatus }),
    [status, profile, themes, marai]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
