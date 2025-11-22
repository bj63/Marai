# Jarvis for Everyone

MarAI is the everyday copilot that remembers your context, narrates your vibe, and connects you to people and products that matter. This repo contains the full-stack experience: a Next.js app (App Router) that talks to the "MarAI Brain" backend for mood, feed, commerce, and trust signals.

## Why it matters
- **Soul-first UX:** Mood Ring and theme sync pull live state from the backend so the interface always mirrors your current energy.
- **Trusted economy:** Commerce clicks are tracked before checkout, so sellers build reputation and buyers get safer recommendations.
- **Real-time personas:** Feed, chat, and dream views render from API-driven personas with optimistic UI and graceful offline handling.

## Quick start
1. Copy `.env.example` to `.env` and set `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_API_KEY` to point at your MarAI Brain.
2. Install dependencies: `npm install`.
3. Run the experience locally: `npm run dev` (defaults to port 3000).

## Production deployment
- Build and serve optimized assets with `npm run build` then `npm start`.
- The included `Dockerfile` produces a Railway-ready image; `nginx.conf` proxies traffic for SSR and static assets.
- App-level API calls use the typed `apiClient`, which respects the configured backend host in all environments.

## What lives where
- `src/app` – App Router routes for landing, onboarding, feed, profile, chat, and admin surfaces.
- `src/components` – Shared UI primitives (rail, toasts, feed cards, guards, etc.).
- `src/providers` – Theme, session, and toast context providers that hydrate client state.
- `src/lib` – API client, session bootstrap, and helpers.
- `frontend/` – Legacy static prototype, kept for reference.
- `docs/` – Ops notes and implementation plans.
- `docs/marai-moa-integration.md` – Steps to wire this frontend to the MOA_AI_V3 backend and Supabase project.

## Operating the Mood Ring
The `ThemeProvider` polls `/api/marai/state/current` through `apiClient` to pull accent colors and motion speed directly from the backend. It updates CSS variables every few seconds while falling back gracefully if offline. When paired with the app shell, this keeps the interface and your personal "soul" in lockstep.

## Building the trust graph
Commerce feed cards trigger a tracking call before opening a seller's checkout page. Each click increments trust for the seller type, enabling safer recommendations and transparent scoring in your social graph.

## License
MIT. Build boldly.
