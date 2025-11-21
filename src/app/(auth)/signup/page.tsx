"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { apiClient } from "../../../lib/apiClient";
import { useSession } from "../../../providers/SessionProvider";
import { useToasts } from "../../../components/ToastHub";

export default function SignUpPage() {
  const { status, setStatus, refresh } = useSession();
  const { addToast } = useToasts();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [goal, setGoal] = useState("Share mood-driven stories");
  const [submitting, setSubmitting] = useState(false);

  const isBusy = useMemo(() => submitting || status === "loading", [submitting, status]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!displayName || !email || !password) {
      addToast({ title: "Add your details first", tone: "warning" });
      return;
    }

    setSubmitting(true);
    setStatus("loading");
    addToast({ title: "Creating your MarAI account…", tone: "info" });

    try {
      await apiClient("/api/auth/signup", {
        method: "POST",
        body: { displayName, email, password, goal },
      });

      setStatus("authenticated");
      await refresh();
      addToast({ title: "Welcome to MarAI", description: "Session hydrated", tone: "success" });
    } catch (error: any) {
      addToast({
        title: "Sign up failed",
        description: error?.message || "Check your API credentials in .env",
        tone: "error",
      });
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page auth">
      <div className="page__header">
        <div>
          <p className="eyebrow">New to MarAI</p>
          <h1>Create your account</h1>
          <p className="muted">Onboard with a display name, email, and password so we can personalize your feed.</p>
        </div>
      </div>

      <div className="panel-card auth-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="displayName">Display name</label>
            <input
              id="displayName"
              name="displayName"
              className="text-input"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Kira from MarAI"
              autoComplete="name"
              required
              disabled={isBusy}
            />
            <p className="helper-text">This name shows up across your feed, chat, and social graph.</p>
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="text-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={isBusy}
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="text-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              disabled={isBusy}
            />
            <p className="helper-text">Your credentials live in the MarAI Brain and use your API key for secure calls.</p>
          </div>

          <div className="form-field">
            <label htmlFor="goal">What do you want from MarAI?</label>
            <select
              id="goal"
              name="goal"
              className="text-input"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              disabled={isBusy}
            >
              <option value="Share mood-driven stories">Share mood-driven stories</option>
              <option value="Connect with trusted sellers">Connect with trusted sellers</option>
              <option value="Explore the social graph">Explore the social graph</option>
              <option value="Build AI-native avatars">Build AI-native avatars</option>
            </select>
          </div>

          <div className="button-row">
            <button type="submit" className="button" disabled={isBusy}>
              {isBusy ? "Creating…" : "Create account"}
            </button>
            <a className="text-link" href="/login">
              Already have an account? Log in
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}
