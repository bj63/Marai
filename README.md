# MarAI Experience Prototype

This repository contains a static, dependency-free prototype for the MarAI experience across onboarding, feed, profile, chat, social graph, explore, dream archive, and admin control surfaces.

## Running locally

No build step is required.

- Open `frontend/landing.html` for the branded splash hero that links into the prototype.
- Open `frontend/index.html` to explore the full prototype UI.
- Open `frontend/avatar-creator.html` to try the guided avatar upload + style selection screen.
- Open `frontend/persona-confirmation.html` to finalize persona naming, bio, and core traits.

## Structure
- `frontend/landing.html` – branded splash hero with Tailwind CSS and CTA links.
- `frontend/index.html` – layout and feature sections for each major surface.
- `frontend/avatar-creator.html` – standalone avatar upload + style selection experience.
- `frontend/persona-confirmation.html` – persona naming and trait tuning step for MarAI.
- `frontend/styles.css` – design tokens, gradients, and component styling.
- `frontend/main.js` – lightweight interaction logic, optimistic UI, and API call simulations.
- `docs/implementation-plan.md` – prior implementation plan used to guide this prototype.
