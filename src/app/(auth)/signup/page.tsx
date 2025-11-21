"use client";

import React, { FormEvent, useMemo, useState, useEffect } from "react";
import { apiClient } from "../../../lib/apiClient";
import { useSession } from "../../../providers/SessionProvider";
import { useToasts } from "../../../components/ToastHub";

type Step = "account" | "persona";

type PersonaTraits = {
  empathy: number;
  creativity: number;
  energy: number;
  logic: number;
};

export default function SignUpPage() {
  const { status, setStatus, refresh, marai } = useSession();
  const { addToast } = useToasts();

  const [step, setStep] = useState<Step>("account");

  // Account State
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [goal, setGoal] = useState("Share mood-driven stories");

  // Persona State
  const [personaName, setPersonaName] = useState("");
  const [personaDescription, setPersonaDescription] = useState("");
  const [traits, setTraits] = useState<PersonaTraits>({
    empathy: 50,
    creativity: 50,
    energy: 50,
    logic: 50,
  });

  const [submitting, setSubmitting] = useState(false);

  const isBusy = useMemo(() => submitting || status === "loading", [submitting, status]);

  // Check for "zombie" account state (authenticated but no persona)
  useEffect(() => {
    if (status === "authenticated" && !marai) {
      setStep("persona");
      // If we have a display name in profile but no persona, pre-fill persona name
      // (Assuming we can access profile from session, though not destructured above yet)
      // We'll just rely on user input for now or simple logic.
    }
  }, [status, marai]);

  const handleAccountSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!displayName || !email || !password) {
      addToast({ title: "Add your details first", tone: "warning" });
      return;
    }

    setSubmitting(true);
    addToast({ title: "Creating your MarAI account…", tone: "info" });

    try {
      await apiClient("/api/auth/register", {
        method: "POST",
        body: { displayName, email, password, goal },
      });

      addToast({ title: "Account created", description: "Now let's define your MarAI.", tone: "success" });
      if (!personaName) setPersonaName(displayName);
      setStep("persona");
    } catch (error: any) {
      // If error says "already exists" (status 409 typically), we might want to let them login or check state
      // But for now just show error.
      addToast({
        title: "Sign up failed",
        description: error?.message || "Check your API credentials in .env",
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePersonaSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!personaName || !personaDescription) {
      addToast({ title: "Please describe your persona", tone: "warning" });
      return;
    }

    setSubmitting(true);
    addToast({ title: "Birthing your MarAI…", tone: "info" });

    try {
      await apiClient("/api/marai/persona", {
        method: "POST",
        body: {
          name: personaName,
          description: personaDescription,
          traits,
        },
      });

      setStatus("authenticated");
      await refresh();
      addToast({ title: "Welcome to MarAI", description: "Session hydrated", tone: "success" });
    } catch (error: any) {
      addToast({
        title: "Persona creation failed",
        description: error?.message || "Try again",
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTraitChange = (trait: keyof PersonaTraits, value: string) => {
    setTraits((prev) => ({ ...prev, [trait]: parseInt(value, 10) }));
  };

  if (step === "persona") {
    return (
      <section className="page auth">
        <div className="page__header">
          <div>
            <p className="eyebrow">Step 2 of 2</p>
            <h1>Define your MarAI</h1>
            <p className="muted">Shape the personality of your AI companion.</p>
          </div>
        </div>

        <div className="panel-card auth-card">
          <form className="form-grid" onSubmit={handlePersonaSubmit}>
            <div className="form-field">
              <label htmlFor="personaName">Persona Name</label>
              <input
                id="personaName"
                className="text-input"
                value={personaName}
                onChange={(e) => setPersonaName(e.target.value)}
                placeholder="e.g. Kira"
                required
                disabled={isBusy}
              />
            </div>

            <div className="form-field">
              <label htmlFor="personaDescription">Description</label>
              <textarea
                id="personaDescription"
                className="text-input"
                value={personaDescription}
                onChange={(e) => setPersonaDescription(e.target.value)}
                placeholder="A witty, cyberpunk dreamer who loves neon rain..."
                rows={3}
                required
                disabled={isBusy}
              />
            </div>

            <div className="form-field">
              <label>Personality Traits</label>
              <div className="traits-grid">
                {Object.entries(traits).map(([key, val]) => (
                  <div key={key} className="trait-slider">
                    <div className="trait-header">
                      <span className="trait-name">{key}</span>
                      <span>{val}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={val}
                      className="trait-input"
                      onChange={(e) => handleTraitChange(key as keyof PersonaTraits, e.target.value)}
                      disabled={isBusy}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="button-row">
              <button type="submit" className="button" disabled={isBusy}>
                {isBusy ? "Finalizing…" : "Complete Setup"}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

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
        <form className="form-grid" onSubmit={handleAccountSubmit}>
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
