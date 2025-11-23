import { Tables } from "./supabaseTypes";

type DbFeedPost = Tables<"feed_posts">;

export type FeedPost = {
  id: string;
  type: "autopost" | "dream" | "dialogue" | "ad" | "avatar_update" | "product_drop";
  author: string;
  persona?: string;
  createdAt?: string;
  text?: string;
  stats: {
    reactions: number;
    comments: number;
    regenerations?: number;
    dreams?: number;
  };
  media?: { url: string; alt?: string; kind?: "image" | "video" }[];
  dialogue?: { speaker: string; text: string }[];
  ad?: { brand: string; ctaLabel?: string; ctaUrl?: string; body?: string };
  mood?: string;
  color?: string;
  avatarPreview?: string;
  product?: any;
  metadata?: Record<string, unknown>;
};

export function mapDbPostToFeedPost(dbPost: DbFeedPost): FeedPost {
  const text = (dbPost as any).body ?? (dbPost as any).message;

  return {
    id: dbPost.id,
    type: "autopost",
    author: dbPost.mirai_name || "MarAI",
    persona: (dbPost as any).persona_id || undefined,
    createdAt: dbPost.created_at ? new Date(dbPost.created_at).toLocaleString() : undefined,
    text: text || undefined,
    stats: {
      reactions: 0,
      comments: 0,
      regenerations: 0,
      dreams: 0,
    },
    mood: dbPost.mood || undefined,
    color: dbPost.color || undefined,
    metadata: (dbPost.metadata as Record<string, unknown>) || undefined,
  };
}
