"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { RouteGuard } from "../../../components/RouteGuard";
import { useToasts } from "../../../components/ToastHub";
import { useSession } from "../../../providers/SessionProvider";
import { apiClient } from "../../../lib/apiClient";

const FALLBACK_GRAPH: GraphResponse = {
  nodes: [
    {
      id: "you",
      name: "You",
      handle: "@you",
      youFollow: true,
      followsYou: true,
      location: "Everywhere",
      postingWindow: "Adaptive",
      dreamThemes: ["mind-maps", "late-night builds"],
      aiInteractions: ["Keeps MarAI aligned"],
      mutualConnections: ["RenAI", "KoiAI"],
    },
    {
      id: "renai",
      name: "RenAI",
      handle: "@renai",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuByNblveCAsVxRSIgWkvl9YqOUorNjtseHEC64Pz0kcHIKgxT6lQy4v5G_-lkNJuihIZsyYlkDfHFSb-MKkgPm2lpRAJj9Bqj33bmB62P9S3OBStvDuTpO6-8ziuz1MymJxXg7L3q-Ge6g9P1IVUpNGNt821HnqmROGjcamzccXNTlMsa1pp0lNSJKSSGl6sUh0ULhBCXyOTvSBy5mqLTywnm3HsNUUSX_0Or4bRxOZv8UV9eLCTunb-5gZd3r6xAZIEl0SPtSR7KY",
      youFollow: true,
      followsYou: true,
      location: "Neo Shibuya",
      postingWindow: "Night owl (JST)",
      dreamThemes: ["sakura", "neon rain"],
      aiInteractions: ["Deep dream studies", "KoiAI duets"],
      mutualConnections: ["KoiAI"],
    },
    {
      id: "koiai",
      name: "KoiAI",
      handle: "@koi",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBKxP6yZ34MC6lMEclHoZzFP_rLkfw2GmMfPBz3euEfoL9oaQcrU9Ye7BMMAHxfAdLGBCF-oVQJO5xvRLNvzYBJe-0XsXG83jfj5k9ZcyJ-hz-d8gEUZbA0CzfBYoyHXTbgMYjoI07L9AtvyC7NU5XvkJCD9sJt_3KcbMsT58DdgUsabHn8hW9CrVU6fEboNIq2UnUQwp5r_Z5OJc6jKnAxqNLCkJECezOC9EyzXEJoVhHe5H8a7yqNzYd1k4U7GvpMfwip1r1qA10",
      youFollow: true,
      followsYou: false,
      location: "Virtual Kyoto",
      postingWindow: "Early riser (JST)",
      dreamThemes: ["floating lanterns", "soft thunder"],
      aiInteractions: ["AI-to-AI diplomacy"],
      mutualConnections: ["RenAI"],
    },
    {
      id: "solai",
      name: "SolAI",
      handle: "@sol",
      avatar:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
      youFollow: false,
      followsYou: true,
      location: "Holo-Lisbon",
      postingWindow: "Sunrise maker",
      dreamThemes: ["tidal synths", "aurora"],
      aiInteractions: ["Dream radio"],
      mutualConnections: ["RenAI"],
    },
  ],
  edges: [
    { from: "you", to: "renai", strength: 0.9, context: "Shared dream logs" },
    { from: "you", to: "koiai", strength: 0.6, context: "AI-to-AI dialogues" },
    { from: "you", to: "solai", strength: 0.4, context: "Location pings" },
    { from: "renai", to: "koiai", strength: 0.7, context: "Dream duets" },
  ],
  recommendations: [
    {
      id: "lumia",
      name: "LumiaAI",
      handle: "@lumia",
      reason: "High overlap with your late-night posts and neon dream palette.",
      compatibility: 92,
      signals: [
        { label: "Location events", value: "Metaverse Kyoto festivals" },
        { label: "Posting time", value: "After midnight JST" },
        { label: "Dream themes", value: "holographic lanterns" },
        { label: "AI-to-AI interactions", value: "RenAI remix sessions" },
      ],
    },
    {
      id: "vanta",
      name: "VantaAI",
      handle: "@vanta",
      reason: "Spikes during your build streams and shares your synthwave moods.",
      compatibility: 87,
      signals: [
        { label: "Location events", value: "Holo-Berlin club drops" },
        { label: "Posting time", value: "Weekend afternoons" },
        { label: "Dream themes", value: "chrome oceans" },
        { label: "AI-to-AI interactions", value: "KoiAI negotiation logs" },
      ],
    },
  ],
};

type SocialGraphNode = {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  youFollow?: boolean;
  followsYou?: boolean;
  location?: string;
  postingWindow?: string;
  dreamThemes?: string[];
  aiInteractions?: string[];
  mutualConnections?: string[];
};

type SocialGraphEdge = {
  from: string;
  to: string;
  strength?: number;
  context?: string;
};

type Recommendation = {
  id: string;
  name: string;
  handle: string;
  reason: string;
  compatibility?: number;
  signals: { label: string; value: string }[];
};

type GraphResponse = {
  nodes: SocialGraphNode[];
  edges: SocialGraphEdge[];
  recommendations?: Recommendation[];
};

type PositionedNode = SocialGraphNode & { x: number; y: number };

export default function SocialGraphPage() {
  const { profile } = useSession();
  const { addToast } = useToasts();
  const [graph, setGraph] = useState<GraphResponse>(FALLBACK_GRAPH);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [innerCircle, setInnerCircle] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [avatarStyle, setAvatarStyle] = useState("dream");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarStatus, setAvatarStatus] = useState<string>("idle");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarJobRef = useRef<string | null>(null);
  const avatarPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewerLabel = profile?.displayName ?? "You";
  const edges = useMemo(() => graph.edges ?? [], [graph.edges]);
  const recommendations = useMemo(
    () => graph.recommendations ?? FALLBACK_GRAPH.recommendations ?? [],
    [graph.recommendations],
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const response = await apiClient<GraphResponse>("/api/graph/social", { method: "GET" });
        if (!cancelled && response?.nodes?.length) {
          setGraph({ ...response, recommendations: response.recommendations ?? FALLBACK_GRAPH.recommendations });
          setSelectedId((current) => current ?? response.nodes[0]?.id ?? null);
        }
      } catch (error) {
        addToast({ title: "Using fallback graph", tone: "warning" });
      } finally {
        if (!cancelled) {
          setLoading(false);
          setSelectedId((current) => current ?? FALLBACK_GRAPH.nodes[0]?.id ?? null);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [addToast]);

  useEffect(() => {
    return () => {
      if (avatarPollRef.current) clearInterval(avatarPollRef.current);
    };
  }, []);

  const positionedNodes = useMemo<PositionedNode[]>(() => {
    const nodes = graph.nodes?.length ? graph.nodes : FALLBACK_GRAPH.nodes;
    const total = nodes.length || 1;
    const radius = 42;
    return nodes.map((node, index) => {
      const angle = (index / total) * Math.PI * 2;
      return {
        ...node,
        x: 50 + radius * Math.cos(angle),
        y: 50 + radius * Math.sin(angle),
      };
    });
  }, [graph.nodes]);

  const nodeLookup = useMemo(() => {
    const map = new Map<string, PositionedNode>();
    positionedNodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [positionedNodes]);

  const selectedNode = selectedId ? nodeLookup.get(selectedId) : undefined;
  const activeRecommendation = useMemo(() => {
    if (!recommendations.length) return undefined;
    const index = carouselIndex % recommendations.length;
    return recommendations[index >= 0 ? index : 0];
  }, [carouselIndex, recommendations]);

  useEffect(() => {
    if (!selectedId && positionedNodes.length) {
      setSelectedId(positionedNodes[0].id);
    }
  }, [positionedNodes, selectedId]);

  const isFriend = (node?: SocialGraphNode) => Boolean(node?.youFollow && node?.followsYou);

  const pollAvatarJob = useCallback(
    (jobId: string) => {
      if (avatarPollRef.current) clearInterval(avatarPollRef.current);
      avatarJobRef.current = jobId;
      setAvatarStatus("processing job…");

      avatarPollRef.current = setInterval(async () => {
        try {
          const response = await apiClient<{ status: string; url?: string; error?: string }>(`/api/avatar/${jobId}`);
          if (response.status === "succeeded" && response.url) {
            setAvatarPreview(response.url);
            setAvatarStatus("Avatar ready");
            addToast({ title: "Avatar ready", tone: "success" });
            avatarPollRef.current && clearInterval(avatarPollRef.current);
          }
          if (response.status === "failed") {
            setAvatarStatus(response.error || "Avatar job failed");
            addToast({ title: "Avatar generation failed", tone: "error" });
            avatarPollRef.current && clearInterval(avatarPollRef.current);
          }
        } catch (error: any) {
          setAvatarStatus(error?.message || "Unable to check avatar job");
          addToast({ title: "Avatar polling error", tone: "error" });
          avatarPollRef.current && clearInterval(avatarPollRef.current);
        }
      }, 1500);
    },
    [addToast],
  );

  const submitAvatarJob = useCallback(async () => {
    if (!avatarFile) {
      addToast({ title: "Upload a reference first", tone: "warning" });
      return;
    }

    const formData = new FormData();
    formData.append("file", avatarFile);
    formData.append("style", avatarStyle);

    try {
      setAvatarStatus("Submitting avatar…");
      const response = await apiClient<{ id: string }>("/api/avatar/generate", {
        method: "POST",
        body: formData,
      });
      setAvatarStatus("Queued for rendering");
      addToast({ title: "Avatar generation started", tone: "info" });
      pollAvatarJob(response.id);
    } catch (error: any) {
      setAvatarStatus(error?.message || "Unable to submit avatar");
      addToast({ title: "Avatar request failed", tone: "error" });
    }
  }, [addToast, avatarFile, avatarStyle, pollAvatarJob]);

  const retryAvatarJob = useCallback(() => {
    if (avatarJobRef.current) {
      pollAvatarJob(avatarJobRef.current);
      addToast({ title: "Retrying avatar status", tone: "info" });
      return;
    }
    submitAvatarJob();
  }, [addToast, pollAvatarJob, submitAvatarJob]);

  const toggleFollow = async (nodeId: string) => {
    const node = graph.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const previousFollow = Boolean(node.youFollow);
    const nextFollow = !previousFollow;
    const snapshot = graph.nodes;

    const updatedNodes = snapshot.map((n) =>
      n.id === nodeId
        ? {
            ...n,
            youFollow: nextFollow,
          }
        : n,
    );

    const wasFriend = isFriend(node);
    const becomesFriend = nextFollow && node.followsYou;

    setGraph((current) => ({ ...current, nodes: updatedNodes }));

    try {
      await apiClient(`/api/social/follow`, {
        method: "POST",
        body: { targetId: nodeId, follow: nextFollow },
      });
      addToast({
        title: nextFollow ? `Following ${node.name}` : `Unfollowed ${node.name}`,
        tone: "success",
      });
      if (becomesFriend && !wasFriend) {
        await postRelationalMemory(node, 1, "warm");
      }
      if (wasFriend && !becomesFriend) {
        await postRelationalMemory(node, -1, "cooling");
      }
    } catch (error) {
      setGraph((current) => ({ ...current, nodes: snapshot }));
      addToast({ title: "Follow update failed", tone: "error" });
    }
  };

  const toggleInnerCircle = (nodeId: string) => {
    const node = graph.nodes.find((n) => n.id === nodeId);
    if (!isFriend(node)) {
      addToast({ title: "Inner Circle requires friendship", tone: "warning" });
      return;
    }
    const next = new Set(innerCircle);
    if (next.has(nodeId)) {
      next.delete(nodeId);
    } else {
      next.add(nodeId);
    }
    setInnerCircle(next);
  };

  const chatAllowed = selectedNode ? isFriend(selectedNode) && innerCircle.has(selectedNode.id) : false;
  const chatCtaLabel = selectedNode
    ? chatAllowed
      ? "Open chat"
      : isFriend(selectedNode)
        ? "Lock: add to Inner Circle"
        : "Lock: require friendship"
    : "Select a node";

  const postRelationalMemory = async (node: SocialGraphNode, delta: number, tone: string) => {
    try {
      await apiClient(`/api/memory`, {
        method: "POST",
        body: {
          relationType: "SOCIAL",
          targetId: node.id,
          tone,
          delta,
          context: `Friendship state with ${node.name} (${node.handle})`,
        },
      });
    } catch (error) {
      console.warn("relational memory post failed", error);
    }
  };

  const highlightedConnections = useMemo(() => {
    const id = hovered || selectedId;
    if (!id) return new Set<string>();
    const set = new Set<string>();
    edges.forEach((edge) => {
      if (edge.from === id || edge.to === id) {
        set.add(`${edge.from}->${edge.to}`);
      }
    });
    return set;
  }, [edges, hovered, selectedId]);

  return (
    <RouteGuard section="app">
      <section className="page social-graph">
        <div className="page__header">
          <div>
            <h1>Social Graph</h1>
            <p>
              Navigate follow edges, mutual friendships, and curated discovery. Add Inner Circle friends to unlock
              private content and AI chat access.
            </p>
          </div>
          <div className="cta-row">
            <button className="button ghost" onClick={() => setCarouselIndex((i) => i + 1)} disabled={!recommendations.length}>
              Next discovery
            </button>
          </div>
        </div>

        <div className="social-grid">
          <div className="panel-card">
            <p className="eyebrow">Avatar generation</p>
            <h3>POST /api/avatar/generate</h3>
            <p className="muted">Uploads use your API key from .env and stream progress via polling.</p>
            <div className="input-row">
              <label className="file-input">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                />
                <span>{avatarFile ? avatarFile.name : "Upload reference"}</span>
              </label>
              <select value={avatarStyle} onChange={(e) => setAvatarStyle(e.target.value)}>
                <option value="dream">Dream</option>
                <option value="cyberpunk">Cyberpunk</option>
                <option value="studio">Studio</option>
              </select>
            </div>
            <div className="button-row">
              <button className="button" onClick={submitAvatarJob}>
                Generate avatar
              </button>
              <button className="button ghost" onClick={retryAvatarJob}>
                Retry status
              </button>
            </div>
            <p className="muted">{avatarStatus}</p>
            {avatarPreview && (
              <Image
                src={avatarPreview}
                alt="Generated avatar"
                className="avatar-preview"
                width={320}
                height={320}
                unoptimized
              />
            )}
          </div>

          <div className="panel-card">
            <div className="social-graph__header">
              <div>
                <p className="eyebrow">Interactive graph</p>
                <strong>Tap nodes to inspect connections</strong>
                <p className="muted">Connected as {viewerLabel}</p>
              </div>
              {loading && <span className="badge">Loading…</span>}
            </div>
            <svg className="social-graph__viz" viewBox="0 0 100 100" role="img" aria-label="Social graph">
              {edges.map((edge) => {
                const from = nodeLookup.get(edge.from);
                const to = nodeLookup.get(edge.to);
                if (!from || !to) return null;
                const key = `${edge.from}->${edge.to}`;
                const isConnected = highlightedConnections.has(key);
                return (
                  <line
                    key={key}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    className={isConnected ? "edge edge--active" : "edge"}
                    strokeWidth={1.2 + (edge.strength ?? 0) * 1.5}
                  />
                );
              })}

              {positionedNodes.map((node) => {
                const friend = isFriend(node);
                const isSelected = node.id === selectedId;
                return (
                  <g
                    key={node.id}
                    className="graph-node"
                    onMouseEnter={() => setHovered(node.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setSelectedId(node.id)}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={friend ? 5 : 4}
                      className={isSelected ? "node-dot node-dot--selected" : friend ? "node-dot node-dot--friend" : "node-dot"}
                    />
                    <text x={node.x + 6} y={node.y} className="node-label">
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="legend-row">
              <span className="legend-chip">
                <span className="dot dot--default" /> Connection
              </span>
              <span className="legend-chip">
                <span className="dot dot--friend" /> Friendship (mutual follow)
              </span>
              <span className="legend-chip">
                <span className="dot dot--selected" /> Selected node
              </span>
            </div>
          </div>

          <div className="panel-card">
            <p className="eyebrow">Node detail</p>
            {selectedNode ? (
              <div className="node-detail">
                <div className="node-header">
                  <div className="node-avatar" aria-hidden>
                    {selectedNode.avatar ? (
                      <Image src={selectedNode.avatar} alt="" width={48} height={48} className="avatar-image" unoptimized />
                    ) : (
                      selectedNode.name[0]
                    )}
                  </div>
                  <div>
                    <h3>{selectedNode.name}</h3>
                    <p className="muted">{selectedNode.handle}</p>
                    <div className="badge-row">
                      {selectedNode.location && <span className="badge">{selectedNode.location}</span>}
                      {selectedNode.postingWindow && <span className="badge">{selectedNode.postingWindow}</span>}
                      {isFriend(selectedNode) && <span className="badge badge--success">Friendship</span>}
                      {innerCircle.has(selectedNode.id) && <span className="badge badge--accent">Inner Circle</span>}
                    </div>
                  </div>
                </div>

                <div className="chip-grid">
                  {selectedNode.dreamThemes?.map((theme) => (
                    <span key={theme} className="chip">
                      {theme}
                    </span>
                  ))}
                  {selectedNode.aiInteractions?.map((signal) => (
                    <span key={signal} className="chip chip--ghost">
                      {signal}
                    </span>
                  ))}
                </div>

                <div className="mutuals">
                  <strong>Mutual friends</strong>
                  <p className="muted">{selectedNode.mutualConnections?.length ? selectedNode.mutualConnections.join(", ") : "None yet"}</p>
                </div>

                <div className="button-row">
                  <button className="button" onClick={() => toggleFollow(selectedNode.id)}>
                    {selectedNode.youFollow ? "Unfollow" : "Follow"}
                  </button>
                  <button
                    className={innerCircle.has(selectedNode.id) ? "button" : "button ghost"}
                    onClick={() => toggleInnerCircle(selectedNode.id)}
                  >
                    {innerCircle.has(selectedNode.id) ? "Inner Circle" : "Add to Inner Circle"}
                  </button>
                </div>

                <div className="chat-gate">
                  <div>
                    <strong>Private content & AI chat</strong>
                    <p className="muted">
                      Chat CTA unlocks when you are friends and the node is in your Inner Circle.
                    </p>
                  </div>
                  <button className="button" disabled={!chatAllowed} onClick={() => (window.location.href = `/chat/${selectedNode.id}`)}>
                    {chatCtaLabel}
                  </button>
                </div>
              </div>
            ) : (
              <p>Select a node to view details.</p>
            )}
          </div>

          <div className="panel-card discovery">
            <div className="discovery__header">
              <div>
                <p className="eyebrow">Discovery carousel</p>
                <h3>People your MarAI thinks you’ll like</h3>
              </div>
              <div className="cta-row">
                <button className="button ghost" onClick={() => setCarouselIndex((i) => Math.max(i - 1, 0))} disabled={!recommendations.length}>
                  Previous
                </button>
                <button className="button" onClick={() => setCarouselIndex((i) => i + 1)} disabled={!recommendations.length}>
                  Next
                </button>
              </div>
            </div>
            {activeRecommendation ? (
              <div className="recommendation-card">
                <div className="recommendation__meta">
                  <div className="node-avatar" aria-hidden>{activeRecommendation.name[0]}</div>
                  <div>
                    <h4>{activeRecommendation.name}</h4>
                    <p className="muted">{activeRecommendation.handle}</p>
                    <p className="muted">{activeRecommendation.reason}</p>
                  </div>
                  {typeof activeRecommendation.compatibility === "number" && (
                    <span className="compat-chip">{activeRecommendation.compatibility}% match</span>
                  )}
                </div>
                <div className="signals-grid">
                  {activeRecommendation.signals.map((signal) => (
                    <div key={`${activeRecommendation.id}-${signal.label}`} className="signal-tile">
                      <p className="eyebrow">{signal.label}</p>
                      <strong>{signal.value}</strong>
                    </div>
                  ))}
                </div>
                <div className="button-row">
                  <button className="button" onClick={() => setSelectedId(activeRecommendation.id)}>
                    Inspect in graph
                  </button>
                </div>
              </div>
            ) : (
              <p className="muted">No recommendations yet—engage more to unlock discovery.</p>
            )}
          </div>
        </div>
      </section>
    </RouteGuard>
  );
}
