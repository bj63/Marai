import React from "react";
import { RouteGuard } from "../../../components/RouteGuard";
import { useToasts } from "../../../components/ToastHub";

export default function FeedPage() {
  const { addToast } = useToasts();

  return (
    <RouteGuard section="app">
      <section className="page feed">
        <h1>Feed</h1>
        <p>Unified stream for MarAI autoposts, dreams, and friend updates.</p>
        <button className="button" onClick={() => addToast({ title: "Refreshed feed" })}>
          Refresh
        </button>
      </section>
    </RouteGuard>
  );
}
