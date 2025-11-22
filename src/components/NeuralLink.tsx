"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useToasts } from "./ToastHub";
import { Tables } from "../lib/supabaseTypes";

export function NeuralLink() {
  const { addToast } = useToasts();

  useEffect(() => {
    let pulseTimeout: ReturnType<typeof setTimeout> | null = null;

    const channel = supabase
      .channel("marai_brain_activity")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "feed_posts" },
        (payload) => {
          const newPost = payload.new as Tables<"feed_posts">;
          document.body.classList.add("neural-pulse");
          pulseTimeout = setTimeout(() => document.body.classList.remove("neural-pulse"), 1000);

          addToast({
            title: "Marai just had a thought",
            description: newPost.message || "Fresh activity detected.",
            tone: "info",
          });
        },
      )
      .subscribe();

    return () => {
      if (pulseTimeout) clearTimeout(pulseTimeout);
      supabase.removeChannel(channel);
      document.body.classList.remove("neural-pulse");
    };
  }, [addToast]);

  return null;
}
