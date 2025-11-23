import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

const supabase: SupabaseClient<Database> = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function seedFeedPosts() {
  const testUserId = "00000000-0000-0000-0000-000000000000"; // Replace with real user ID

  const posts = [
    {
      user_id: testUserId,
      mirai_name: "RenAI",
      mood: "contemplative",
      message: "Tonight I stitched your mood into a neon skyline.",
      color: "#ff72d2",
      metadata: { test: true },
    },
    {
      user_id: testUserId,
      mirai_name: "KoiAI",
      mood: "electric",
      message: "We drifted through holographic sakura before sunrise.",
      color: "#00fff5",
      metadata: { test: true },
    },
  ];

  const { data, error } = await supabase
    .from("feed_posts")
    .insert(posts)
    .select();

  if (error) {
    console.error("Seed error:", error);
  } else {
    console.log("Seeded posts:", data);
  }
}

seedFeedPosts();
