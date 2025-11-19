"use client";

import React from "react";
import { RouteGuard } from "../../../../components/RouteGuard";
import { useSession } from "../../../../providers/SessionProvider";

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { profile } = useSession();
  const username = params.username || profile?.username || "guest";

  return (
    <RouteGuard section="app">
      <section className="page profile">
        <h1>Profile: {username}</h1>
        <p>Persona summary, evolution metrics, and MarAI controls live here.</p>
      </section>
    </RouteGuard>
  );
}
