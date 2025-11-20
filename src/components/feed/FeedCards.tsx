"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { useToasts } from "../ToastHub";
import { apiClient } from "@/lib/apiClient";

export type FeedAction = "react" | "comment" | "regenerate" | "dream";

export type MediaAsset = {
  url: string;
  alt?: string;
  kind?: "image" | "video";
};

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
  media?: MediaAsset[];
  dialogue?: { speaker: string; text: string }[];
  ad?: { brand: string; ctaLabel?: string; ctaUrl?: string; body?: string };
  mood?: string;
  avatarPreview?: string;
  product?: {
    title: string;
    price: string;
    buyUrl: string;
    features?: string;
    sellerType?: "common" | "brand";
  };
};

type CardProps = { post: FeedPost; onAction: (postId: string, action: FeedAction) => void };

const MediaGallery = React.memo(function MediaGallery({ media }: { media?: MediaAsset[] }) {
  const items = useMemo(() => media ?? [], [media]);
  if (!items.length) return null;

  return (
    <div className="media-grid" aria-label="Post media">
      {items.map((asset) => {
        if (asset.kind === "video") {
          return (
            <video
              key={asset.url}
              className="media-grid__item"
              preload="metadata"
              playsInline
              autoPlay
              loop
              muted
              style={{ objectFit: "cover", width: "100%", height: "450px" }}
            >
              <source src={asset.url} />
              Your browser does not support the video tag.
            </video>
          );
        }
        return (
          <Image
            key={asset.url}
            className="media-grid__item"
            src={asset.url}
            alt={asset.alt || "Post media"}
            width={800}
            height={800}
            unoptimized
          />
        );
      })}
    </div>
  );
});

function PostShell({ post, children }: { post: FeedPost; children: React.ReactNode }) {
  return (
    <article className="feed-card" role="article" aria-label={`${post.type} post from ${post.author}`}>
      <header className="feed-card__header">
        <div className="avatar-ring" aria-hidden="true" />
        <div className="feed-card__meta">
          <p className="eyebrow">{post.persona ?? "MarAI persona"}</p>
          <strong>{post.author}</strong>
          {post.createdAt && <span className="eyebrow">{post.createdAt}</span>}
        </div>
        <span className="badge">{post.type.replace("_", " ")}</span>
      </header>
      {children}
    </article>
  );
}

function ActionsRow({ post, onAction }: CardProps) {
  const { addToast } = useToasts();
  const actions: { label: string; action: FeedAction; icon: string }[] = [
    { label: `React (${post.stats.reactions})`, action: "react", icon: "❤️" },
    { label: `Comment (${post.stats.comments})`, action: "comment", icon: "💬" },
    { label: `Regenerate (${post.stats.regenerations ?? 0})`, action: "regenerate", icon: "♻️" },
    { label: `Dream (${post.stats.dreams ?? 0})`, action: "dream", icon: "🌙" },
  ];

  return (
    <div className="feed-actions" aria-label="Post actions">
      {actions.map((item) => (
        <button
          key={item.action}
          className="button ghost"
          onClick={() => {
            addToast({ title: `${item.label}…`, tone: "info" });
            onAction(post.id, item.action);
          }}
        >
          <span aria-hidden>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export function AutopostCard({ post, onAction }: CardProps) {
  return (
    <PostShell post={post}>
      <p className="lede">{post.text}</p>
      <MediaGallery media={post.media} />
      <ActionsRow post={post} onAction={onAction} />
    </PostShell>
  );
}

export function DreamCard({ post, onAction }: CardProps) {
  return (
    <PostShell post={post}>
      <p className="lede">{post.text}</p>
      <MediaGallery media={post.media} />
      {post.mood && <p className="eyebrow">Mood: {post.mood}</p>}
      <ActionsRow post={post} onAction={onAction} />
    </PostShell>
  );
}

export function DialogueCard({ post, onAction }: CardProps) {
  return (
    <PostShell post={post}>
      <div className="dialogue-stack" aria-label="Dialogue transcript">
        {(post.dialogue ?? []).map((turn, index) => (
          <div key={`${post.id}-turn-${index}`} className="dialogue-turn">
            <p className="eyebrow">{turn.speaker}</p>
            <p>{turn.text}</p>
          </div>
        ))}
      </div>
      <ActionsRow post={post} onAction={onAction} />
    </PostShell>
  );
}

export function AdCard({ post, onAction }: CardProps) {
  return (
    <PostShell post={post}>
      <div className="ad-card">
        <p className="eyebrow">Sponsored</p>
        <p className="lede">{post.ad?.body ?? post.text}</p>
        <a className="button" href={post.ad?.ctaUrl ?? "#"} target="_blank" rel="noreferrer">
          {post.ad?.ctaLabel ?? "Learn more"}
        </a>
      </div>
      <ActionsRow post={post} onAction={onAction} />
    </PostShell>
  );
}

export function AvatarUpdateCard({ post, onAction }: CardProps) {
  return (
    <PostShell post={post}>
      <div className="avatar-update">
        <div className="avatar-preview" aria-label="Updated avatar thumbnail">
          {post.avatarPreview ? (
            <Image
              src={post.avatarPreview}
              alt="Avatar preview"
              width={96}
              height={96}
              className="avatar-preview-img"
              unoptimized
            />
          ) : (
            <div className="avatar-placeholder" aria-hidden />
          )}
        </div>
        <div>
          <p className="lede">{post.text ?? "Avatar refreshed with new style."}</p>
          {post.mood && <p className="eyebrow">Style: {post.mood}</p>}
        </div>
      </div>
      <ActionsRow post={post} onAction={onAction} />
    </PostShell>
  );
}

export function CommerceCard({ post, onAction }: CardProps) {
  return (
    <PostShell post={post}>
      <div className="relative mb-4 overflow-hidden rounded-2xl bg-slate-900/30 shadow-inner">
        <MediaGallery media={post.media} />
        {post.product?.price && (
          <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-white backdrop-blur">
            {post.product.price}
          </div>
        )}
      </div>

      {post.text && <p className="lede mb-3">{post.text}</p>}

      {post.product?.features && (
        <div className="mb-4 rounded-xl bg-emerald-500/10 p-3 text-sm italic text-emerald-100/90">
          <p className="font-semibold not-italic text-emerald-200">AI Analysis</p>
          <p>{post.product.features}</p>
        </div>
      )}

      {post.product?.buyUrl && (
        <a
          className="button mb-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-base font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:from-emerald-400 hover:to-teal-500"
          href={post.product.buyUrl}
          target="_blank"
          rel="noreferrer"
        >
          Buy Now
        </a>
      )}

      <ActionsRow post={post} onAction={onAction} />
    </PostShell>
  );
}

export function FeedSkeleton() {
  return (
    <div className="feed-card skeleton" aria-hidden>
      <div className="skeleton__header" />
      <div className="skeleton__body" />
      <div className="skeleton__actions" />
    </div>
  );
}
