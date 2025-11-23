import { supabase } from "./supabaseClient";

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
    // Get current Supabase session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return defaultSnapshot;
    }

    // Fetch user profile from Supabase
    const { data: profile } = await supabase
      .from("mirai_profile")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    // Fetch personality traits
    const { data: personality } = await supabase
      .from("personality")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    return {
      authenticated: true,
      profile: profile
        ? {
            id: profile.user_id,
            username: profile.name || "user",
            displayName: profile.name || "Anonymous",
          }
        : null,
      themes: {
        current: "dark",
        available: ["dark", "pastel", "cyberpunk"],
      },
      marai: personality
        ? {
            id: session.user.id,
            persona: profile?.name || "MarAI",
            traits: {
              empathy: parseFloat(personality.empathy),
              creativity: parseFloat(personality.creativity),
              energy: parseFloat(personality.energy),
              confidence: parseFloat(personality.confidence),
              humor: parseFloat(personality.humor),
              curiosity: parseFloat(personality.curiosity),
            },
          }
        : null,
    };
  } catch (error) {
    console.error("Bootstrap error:", error);
    return defaultSnapshot;
  }
}
