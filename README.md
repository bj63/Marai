# MarAI Experience Prototype

This repository contains a static, dependency-free prototype for the MarAI experience across onboarding, feed, profile, chat, social graph, explore, dream archive, and admin control surfaces.

## Running locally

No build step is required.

- Open `frontend/landing.html` for the branded splash hero that links into the prototype.
- Open `frontend/index.html` to explore the full prototype UI.
- Open `frontend/avatar-creator.html` to try the guided avatar upload + style selection screen.
- Open `frontend/persona-confirmation.html` to finalize persona naming, bio, and core traits.
- Open `frontend/feed.html` to view the feed cards and skeleton loaders.
- Open `frontend/renai-card.html` to browse a RenAI profile card with evolution metrics.
- Open `frontend/chat.html` for the chat interface with quick actions and typing states.
- Use `frontend/index.html` → Social Graph panel to exercise layered Follow/Friend, Inner Circle, AI-aware friendship memory, Friend AI chat gates, and mutual discovery signals.

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
