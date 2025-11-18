import React from "react";
import { RouteGuard } from "../../../../components/RouteGuard";
import { useToasts } from "../../../../components/ToastHub";

export default function ChatPage({ params }: { params: { maraiId: string } }) {
  const { addToast } = useToasts();

  return (
    <RouteGuard section="app">
      <section className="page chat">
        <h1>Chatting with MarAI {params.maraiId}</h1>
        <p>Supports streaming replies, quick actions, and mood digests.</p>
        <button className="button" onClick={() => addToast({ title: "Mood digest requested" })}>
          Ask about my mood
        </button>
      </section>
    </RouteGuard>
  );
}
