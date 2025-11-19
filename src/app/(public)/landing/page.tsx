"use client";

import React from "react";
import { useToasts } from "../../../components/ToastHub";

export default function LandingPage() {
  const { addToast } = useToasts();

  return (
    <section className="page landing">
      <h1>MarAI</h1>
      <p>Anime-inspired AI companion experiences with persona-aware surfaces.</p>
      <div className="cta-row">
        <a className="button" href="/login">
          Get Started
        </a>
        <button className="button ghost" onClick={() => addToast({ title: "Demo CTA", description: "Launching soon." })}>
          Watch demo
        </button>
      </div>
    </section>
  );
}
