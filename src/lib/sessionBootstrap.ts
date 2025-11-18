import { apiClient } from "./apiClient";

export type SessionSnapshot = {
  authenticated: boolean;
  profile: {
    id: string;
    username: string;
    displayName: string;
  } | null;
  themes: {
    current: string;
    available: string[];
  };
  marai: {
    id: string;
    persona: string;
    traits: Record<string, number>;
  } | null;
};

const defaultSnapshot: SessionSnapshot = {
  authenticated: false,
  profile: null,
  themes: {
    current: "dark",
    available: ["dark", "pastel", "cyberpunk"],
  },
  marai: null,
};

export async function bootstrapSession(): Promise<SessionSnapshot> {
  try {
    const response = await apiClient<SessionSnapshot>("/api/session/bootstrap", {
      method: "GET",
      retry: { attempts: 2 },
    });
    return {
      authenticated: Boolean(response.authenticated),
      profile: response.profile ?? defaultSnapshot.profile,
      themes: response.themes ?? defaultSnapshot.themes,
      marai: response.marai ?? defaultSnapshot.marai,
    };
  } catch (error) {
    return defaultSnapshot;
  }
}
