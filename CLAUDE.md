# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Additional Context and Information
Please review the following to get more information:
 

## Commands

All commands run from the repo root unless noted.

```bash
npm run client   # vite dev server only (frontend)
npm run build    # vite build -> dist/
npm run preview  # preview the production build
npm run lint      # eslint .
```

There is no test suite configured.

The frontend talks to a separate ASP.NET Core Web API that is not part of this repo (see "Backend" below) — there is no local Node/Express server or `npm run dev`/`npm run server` script anymore.

Deploys to Firebase Hosting happen via GitHub Actions (`.github/workflows/firebase-hosting-*.yml`) on push to `master` and on PRs — both just run `npm run build` and deploy `dist/`. Firebase Hosting rewrites all paths to `/index.html` (SPA fallback for `react-router-dom`); there are no Firebase Functions in this repo.

## Architecture

This is a restaurant menu site (React 19 + Vite + react-router-dom + Bootstrap) in an actively-experimental state — expect multiple parallel/duplicate implementations of the same screen. **Only one implementation per concern is currently wired into `App.jsx`; the rest are dead code kept around from earlier iterations.** Before editing a component, check `src/App.jsx` to confirm it's actually on a live route.

### Routing (`src/App.jsx`)
- `/sandwiches` → `Layout` → `MenuSandwiches` (live).
- `/items` → `Layout` → `MenuDelta` (live).
- `/edit` → `Edit` page (admin menu editor, gated by a client-side login form).
- A global `KeyboardToggle` component listens for Space (toggle `/sandwiches` ↔ `/items`) and `E` (jump to `/edit`) — this is intentional site-wide behavior, not leftover debug code.
- `MenuButtons` renders the mobile hamburger menu (`.show-on-mobile`); `Layout`/menu components render the desktop view — look for `.show-on-large` / `.show-on-mobile` class pairs when touching responsive layout (see recent "responsive navigation" work).

### Backend
The frontend talks to a **separate ASP.NET Core Web API that is not part of this repo**, via `DELI_API_ROOT` in `src/Constants.js` (currently pointed at `https://localhost:44334` for local dev; the commented-out line above it is the Azure-hosted URL). Endpoints consumed: `GET /api/MenuItems`, `GET /api/MenuItems/grouped`, `GET /api/MenuItems/sandwiches`, `PUT /api/MenuItems/{id}` (multipart form for edits incl. image file). Items from this API have `category`, `basePrice` and/or a `prices: [{ size, price }]` array, and `imageUrl`.

There used to be a second, unused Express/Firebase Functions backend (`backend/`, `functions/`) from an earlier iteration — it was removed as dead code since nothing in `src/` ever called it. If you find references to it in old history/docs, they're stale.

The `/edit` page's login (`src/pages/Edit.jsx`) is a hardcoded `admin1`/`admin789` check in the frontend.

### Menu item card/editor variants
`EditItemCard.jsx` (targets `/api/MenuItems`, used for sandwiches in `Edit.jsx`) and `EditItemCardCharlie.jsx` (same endpoint, used for the "other meals" categories in `Edit.jsx`) are both live, doing overlapping jobs with different form fields — this isn't a bug, it reflects sandwiches having size-based `prices` vs. other items using a single `basePrice`. `SandwichItem.jsx` is the live sandwich display card.

### Images
Sandwich images are served from `public/images/sandwiches/` and referenced by filename only (`item.image`) in `SandwichItem.jsx`, which prefixes the path itself. Other menu images (wings, pizza, etc.) are static imports from `public/images/` used directly in `MenuDelta.jsx`, not database-driven.
