# Lost & Found application

A sleek **Lost & Found** frontend that helps people **search, view details, and post items**.

## Core features (highlights)
- **Instant search** with filtering by **Lost/Found**, plus keyword matching across **title, tags, category, location, and description**.
- **Sorting options**: newest, oldest, and title (A–Z) to quickly narrow down matches.
- **Animated, glassmorphism UI** with micro-interactions (hover lift, shimmer effects, and reveal animations).
- **Item details modal** (click card → opens a focused modal) with:
  - ESC-to-close keyboard support
  - quick actions like **Find similar**
- **Frontend-only accounts** (localStorage demo):
  - Register / Login
  - **role support** (admin/user)
  - session persistence
- **Post an item** workflow:
  - Type toggle (Lost/Found)
  - category + location + date + description + comma-separated tags
  - live “preview card” while typing

## Tech stack
- React + Vite
- TailwindCSS

## Run locally
```bash
npm install
npm run dev
```

Open the shown local URL in your browser.

## Notes
- This is a frontend demo: there is **no backend** / real database integration.
- Contact is intentionally demo-only.

