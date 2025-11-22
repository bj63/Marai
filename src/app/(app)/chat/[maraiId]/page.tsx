"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { RouteGuard } from "../../../../components/RouteGuard";
import { useToasts } from "../../../../components/ToastHub";
import { useSession } from "../../../../providers/SessionProvider";
import { apiClient } from "../../../../lib/apiClient";
import { supabase } from "../../../../lib/supabaseClient";
import { Tables } from "../../../../lib/supabaseTypes";

const TYPING_PLACEHOLDER = "…";

function safeParse(data: string) {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  status?: "sending" | "streaming" | "complete" | "error";
  error?: string;
};

type MoodDigest = {
  summary: string;
  provenance: { timestamp: string; note?: string }[];
};

type SceneJob = {
  id: string;
  status: "pending" | "ready" | "error";
  mediaUrl?: string;
  error?: string;
};

type HistoryResponse = {
  history: ChatMessage[];
};

type SendMessageResponse = {
  streamId?: string;
};

type SceneResponse = {
  jobId: string;
};

type JobPollResponse = {
  status: "pending" | "ready" | "error";
  mediaUrl?: string;
  error?: string;
};

export default function ChatPage({ params }: { params: { maraiId: string } }) {
  const { profile } = useSession();
  const { addToast } = useToasts();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [moodDigest, setMoodDigest] = useState<MoodDigest | null>(null);
  const [sceneJob, setSceneJob] = useState<SceneJob | null>(null);
  const streamingRef = useRef<EventSource | WebSocket | null>(null);
  const pendingAssistantId = useRef<string | null>(null);
  const lastPromptRef = useRef<string>("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const storageKey = useMemo(() => `chat-history-${params.maraiId}`, [params.maraiId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed: ChatMessage[] = JSON.parse(raw);
        setMessages(parsed);
      } catch (error) {
        console.warn("Failed to parse cached chat", error);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;

    apiClient<HistoryResponse>(`/api/chat/${params.maraiId}/history?peer=${profile.id}`, {
      method: "GET",
      retry: { attempts: 2 },
    })
      .then((response) => {
        if (cancelled || !response?.history?.length) return;
        setMessages((existing) => {
          if (existing.length) return existing;
          return response.history;
        });
      })
      .catch((error) => {
        console.error("history fetch failed", error);
      });

    return () => {
      cancelled = true;
    };
  }, [params.maraiId, profile?.id]);

  useEffect(() => {
    const channel = supabase
      .channel(`chat_room_${params.maraiId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${params.maraiId}`,
        },
        (payload) => {
          const row = payload.new as Tables<"messages">;
          const role: ChatMessage["role"] = row.sender_id === profile?.id ? "user" : "assistant";

          setMessages((current) => {
            const existingIndex = current.findIndex((msg) => msg.id === row.id);
            if (existingIndex !== -1) return current;

            const streamingIndex = current.findIndex(
              (msg) => msg.role === "assistant" && msg.status === "streaming",
            );

            if (streamingIndex !== -1) {
              const updated = [...current];
              updated[streamingIndex] = {
                ...current[streamingIndex],
                id: row.id,
                content: row.body,
                status: "complete",
              };
              return updated;
            }

            return [
              ...current,
              { id: row.id, role, content: row.body, createdAt: row.created_at, status: "complete" },
            ];
          });

          if (role === "assistant") {
            pendingAssistantId.current = null;
            setTyping(false);
            setAwaitingReply(false);
            setStreamError(null);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.maraiId, profile?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  useEffect(() => {
    return () => {
      if (streamingRef.current instanceof EventSource) streamingRef.current.close();
      if (streamingRef.current instanceof WebSocket) streamingRef.current.close();
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const upsertAssistantMessage = useCallback((assistantId: string, delta: string, done?: boolean) => {
    setMessages((current) =>
      current.map((msg) =>
        msg.id === assistantId
          ? {
              ...msg,
              content: msg.content + delta,
              status: done ? "complete" : "streaming",
            }
          : msg,
      ),
    );
  }, []);

  const finalizeAssistant = useCallback((assistantId: string, error?: string) => {
    setMessages((current) =>
      current.map((msg) =>
        msg.id === assistantId
          ? {
              ...msg,
              status: error ? "error" : "complete",
              error,
              content: msg.content || (error ? "" : TYPING_PLACEHOLDER),
            }
          : msg,
      ),
    );
    pendingAssistantId.current = null;
    setTyping(false);
    setAwaitingReply(false);
  }, []);

  const startStream = useCallback(
    (assistantId: string, streamId?: string) => {
      const streamUrl = `/api/chat/${params.maraiId}/messages?transport=event-source&stream=${streamId ?? assistantId}`;

      if (typeof window === "undefined") return;

      if ("EventSource" in window) {
        const source = new EventSource(streamUrl);
        streamingRef.current = source;

        source.onopen = () => {
          setStreamError(null);
          setTyping(true);
        };

        source.onmessage = (event) => {
          const parsed = safeParse(event.data);
          const delta = typeof parsed === "string" ? parsed : parsed.delta ?? parsed.chunk ?? "";
          const done = typeof parsed === "object" && Boolean(parsed.done);
          upsertAssistantMessage(assistantId, delta, done);
          if (done) {
            finalizeAssistant(assistantId);
            source.close();
            streamingRef.current = null;
          }
        };

        source.onerror = () => {
          setStreamError("Stream dropped. Retry?");
          addToast({ title: "Chat stream dropped", tone: "warning" });
          finalizeAssistant(assistantId, "Stream interrupted");
          source.close();
          streamingRef.current = null;
        };
        return;
      }

      const socket = new WebSocket(streamUrl.replace("http", "ws"));
      streamingRef.current = socket;

      socket.onopen = () => {
        setStreamError(null);
        setTyping(true);
      };

      socket.onmessage = (event) => {
        const parsed = safeParse(event.data as string);
        const delta = typeof parsed === "string" ? parsed : parsed.delta ?? parsed.chunk ?? "";
        const done = typeof parsed === "object" && Boolean(parsed.done);
        upsertAssistantMessage(assistantId, delta, done);
        if (done) {
          finalizeAssistant(assistantId);
          socket.close();
          streamingRef.current = null;
        }
      };

      socket.onerror = () => {
        setStreamError("Stream dropped. Retry?");
        addToast({ title: "Chat stream dropped", tone: "warning" });
        finalizeAssistant(assistantId, "Stream interrupted");
        socket.close();
        streamingRef.current = null;
      };
    },
    [addToast, finalizeAssistant, params.maraiId, upsertAssistantMessage],
  );

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
      status: "complete",
    };
    const assistantId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      status: "streaming",
    };
    lastPromptRef.current = userMessage.content;
    pendingAssistantId.current = assistantId;
    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput("");
    setTyping(true);
    setAwaitingReply(true);
    setStreamError(null);

    try {
      const response = await apiClient<SendMessageResponse>(`/api/chat/${params.maraiId}/messages`, {
        method: "POST",
        body: { message: userMessage.content },
      });
      startStream(assistantId, response?.streamId);
    } catch (error: any) {
      setStreamError("Unable to start stream");
      finalizeAssistant(assistantId, error?.message || "Failed to send message");
      setAwaitingReply(false);
    }
  }, [finalizeAssistant, input, params.maraiId, startStream]);

  const retryStream = useCallback(() => {
    if (!pendingAssistantId.current && messages.length) {
      const latestAssistant = [...messages].reverse().find((msg) => msg.role === "assistant");
      pendingAssistantId.current = latestAssistant?.id ?? null;
    }
    const assistantId = pendingAssistantId.current;
    if (!assistantId) return;

    setMessages((current) =>
      current.map((msg) =>
        msg.id === assistantId
          ? { ...msg, status: "streaming", error: undefined, content: msg.content || "" }
          : msg,
      ),
    );
    setStreamError(null);
    setAwaitingReply(true);
    startStream(assistantId);
    addToast({ title: "Retrying chat stream", tone: "info" });
  }, [addToast, messages, startStream]);

  const requestMoodDigest = async () => {
    try {
      const digest = await apiClient<MoodDigest>(`/api/chat/${params.maraiId}/mood-digest`, { method: "POST" });
      setMoodDigest(digest);
      addToast({ title: "Mood digest ready", tone: "success" });
    } catch (error: any) {
      addToast({ title: "Mood digest failed", description: error?.message || "Try again", tone: "error" });
    }
  };

  const triggerScene = async () => {
    try {
      const payload = await apiClient<SceneResponse>(`/api/chat/${params.maraiId}/generate-scene`, {
        method: "POST",
        body: { prompt: lastPromptRef.current || "Describe the last scene" },
      });
      const job: SceneJob = { id: payload.jobId, status: "pending" };
      setSceneJob(job);
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(async () => {
        try {
          const result = await apiClient<JobPollResponse>(`/api/media/jobs/${job.id}`);
          if (result.status === "ready") {
            setSceneJob({ ...job, status: "ready", mediaUrl: result.mediaUrl });
            pollingRef.current && clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          if (result.status === "error") {
            setSceneJob({ ...job, status: "error", error: result.error || "Generation failed" });
            pollingRef.current && clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        } catch (error: any) {
          setSceneJob({ ...job, status: "error", error: error?.message || "Job polling failed" });
          pollingRef.current && clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }, 1200);
      addToast({ title: "Scene generation queued", tone: "info" });
    } catch (error: any) {
      setSceneJob({ id: "", status: "error", error: error?.message || "Unable to start job" });
      addToast({ title: "Scene request failed", tone: "error" });
    }
  };

  const isStreaming = typing && !streamError;
  const isThinking = awaitingReply || isStreaming;

  return (
    <RouteGuard section="app">
      <section className="page chat">
        <div className="page__header">
          <div>
            <p className="eyebrow">Conversation</p>
            <h1>Chatting with MarAI {params.maraiId}</h1>
            <p className="lede">Live streaming, quick actions, and contextual digests.</p>
          </div>
          <div className="cta-row">
            <button className="button ghost" onClick={requestMoodDigest}>
              Ask about my mood
            </button>
            <button className="button" onClick={triggerScene}>
              Generate scene
            </button>
          </div>
        </div>

        <div className="chat-grid">
          <div className="chat-window" aria-live="polite">
            {messages.map((msg) => (
              <article key={msg.id} className={`chat-bubble chat-${msg.role}`}>
                <header>
                  <strong>{msg.role === "user" ? "You" : "MarAI"}</strong>
                  <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                </header>
                <p>{msg.content || TYPING_PLACEHOLDER}</p>
                {msg.status === "error" && <p className="bubble-error">{msg.error}</p>}
              </article>
            ))}
            {isThinking && (
              <div className="typing-row">
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
                <span>MarAI is typing…</span>
              </div>
            )}
            {streamError && (
              <div className="banner banner--error">
                <div>{streamError}</div>
                <button className="button ghost" onClick={retryStream}>
                  Retry stream
                </button>
              </div>
            )}
          </div>

          <div className="chat-sidebar">
            <div className="panel-card">
              <h3>Quick actions</h3>
              <p>Send a message to see streaming responses. We handle reconnection for you.</p>
              <div className="input-row">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message to MarAI"
                  rows={3}
                />
                <button className="button" onClick={sendMessage} disabled={!input.trim()}>
                  Send & stream
                </button>
              </div>
            </div>

            <div className="panel-card">
              <h3>Scene generation</h3>
              <p>Translate the latest conversation into a visual scene.</p>
              <div className="scene-status">
                {sceneJob ? (
                  <>
                    <p>
                      Job {sceneJob.id || "pending"}: <strong>{sceneJob.status}</strong>
                    </p>
                    {sceneJob.error && <p className="bubble-error">{sceneJob.error}</p>}
                    {sceneJob.mediaUrl && (
                      <Image
                        src={sceneJob.mediaUrl}
                        alt="Generated scene"
                        className="scene-preview"
                        width={640}
                        height={360}
                        unoptimized
                      />
                    )}
                  </>
                ) : (
                  <p>No active scene jobs.</p>
                )}
              </div>
            </div>

            <div className="panel-card">
              <h3>Mood digest</h3>
              {moodDigest ? (
                <div className="mood-card">
                  <p className="lede">{moodDigest.summary}</p>
                  <ul>
                    {moodDigest.provenance?.map((item, index) => (
                      <li key={index}>
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                        {item.note && <em>{item.note}</em>}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>Request a digest to summarize how you are feeling.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </RouteGuard>
  );
}
