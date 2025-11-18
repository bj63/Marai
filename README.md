# MarAI Experience Prototype

This repository contains a static, dependency-free prototype for the MarAI experience across onboarding, feed, profile, chat, social graph, explore, dream archive, and admin control surfaces.

## Running locally

- Copy `.env.example` to `.env` and set `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_API_KEY` for real API calls.
- Serve the static prototype from `frontend/` (no build step required). Examples:
  - `python -m http.server 4173 --directory frontend`
  - `npx serve frontend`
- To override the API base URL or feature flags at runtime, provide a `<script id="marai-config" type="application/json">` block before `shared.js` with keys such as `apiBaseUrl`, `featureFlags.brandHub`, `featureFlags.adminPanel`, `roles`, `corsAllowedOrigins`, and `maxUploadBytes`.

Key entry points:
- `frontend/landing.html` – branded splash hero with Tailwind CSS and CTA links.
- `frontend/index.html` – layout and feature sections for each major surface.
- `frontend/avatar-creator.html` – standalone avatar upload + style selection experience.
- `frontend/persona-confirmation.html` – persona naming and trait tuning step for MarAI.
- `frontend/feed.html` – dedicated feed surface with cards, dialogues, and skeleton loading.
- `frontend/renai-card.html` – RenAI profile view highlighting evolution, charts, and badges.
- `frontend/chat.html` – chat canvas with quick actions, streaming indicator, and input controls.
- `frontend/index.html` – Social graph section now includes Follow/Friend layers, Inner Circle, AI-aware relational memory, Friend AI chat guardrails, and TikTok-style discovery.

See `docs/ops.md` for environment variables, runtime config examples, and a smoke-test checklist.

## Structure
- `frontend/landing.html` – branded splash hero with Tailwind CSS and CTA links.
- `frontend/index.html` – layout and feature sections for each major surface.
- `frontend/avatar-creator.html` – standalone avatar upload + style selection experience.
- `frontend/persona-confirmation.html` – persona naming and trait tuning step for MarAI.
- `frontend/feed.html` – dedicated feed surface with cards, dialogues, and skeleton loading.
- `frontend/renai-card.html` – RenAI profile view highlighting evolution, charts, and badges.
- `frontend/chat.html` – chat canvas with quick actions, streaming indicator, and input controls.
- `frontend/index.html` – Social graph section now includes Follow/Friend layers, Inner Circle, AI-aware relational memory, Friend AI chat guardrails, and TikTok-style discovery.
- `frontend/styles.css` – design tokens, gradients, and component styling.
- `frontend/main.js` – lightweight interaction logic, optimistic UI, and API call simulations.
- `docs/implementation-plan.md` – prior implementation plan used to guide this prototype.
