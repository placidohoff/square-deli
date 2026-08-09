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

The backend API now lives in `server/` in this repo (Express + Prisma + Postgres/Neon — see "Backend" below). It has its own `package.json`, separate from the root one, and is excluded from the root ESLint config (`eslint.config.js`'s `ignores`).

```bash
cd server
npm run dev            # node --watch src/index.js — API on http://localhost:5000, auto-restarts on .js changes only (NOT on .env changes — restart manually after editing server/.env)
npm run start           # same, without --watch
npm run prisma:migrate  # apply schema.prisma changes to the DB
npm run prisma:seed     # reseed from prisma/seed-data.json
npm run prisma:studio   # browser GUI for browsing/editing the DB directly
```

Both `npm run client` (repo root) and `cd server && npm run dev` need to be running for the site to work locally.

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
Migration in progress (off an external ASP.NET Core Web API, onto Postgres/Neon via Prisma) — see `context/current-feature.md` for the full history. Current state:

- `DELI_API_ROOT` in `src/Constants.js` points at `http://localhost:5000`, the new `server/` (Express + Prisma + Neon Postgres, all in this repo). The old ASP.NET API URLs are kept as commented-out lines above it for rollback.
- `server/src/index.js` implements all 4 endpoints the frontend calls, matching the old API's response shapes: `GET /api/MenuItems`, `GET /api/MenuItems/grouped`, `GET /api/MenuItems/sandwiches`, `PUT /api/MenuItems/{id}` (multipart, incl. Cloudinary image upload via `server/src/cloudinary.js`). Schema in `server/prisma/schema.prisma`: a `MenuItem` model (`category`, `basePrice`) with related `Price` rows for sandwiches' size-based pricing.
- **Verified**: the `GET` endpoints — user has run the site with the ASP.NET API fully shut down and confirmed `/sandwiches` and `/items` both work correctly against the new backend.
- **Not yet verified through the UI**: `/edit` and the `PUT` (image upload/editing) flow. They're implemented and were checked independently via curl, but exercising them through the actual admin UI is intentionally deferred to a separate future feature — don't assume they're production-ready without that pass.
- `server/.env` (gitignored) holds `DATABASE_URL`/`DIRECT_URL` (Neon) and `CLOUDINARY_*` credentials — never put real values in `server/.env.example`, which is NOT gitignored and exists only as a placeholder template.

The `/edit` page's login (`src/pages/Edit.jsx`) is a hardcoded `admin1`/`admin789` check in the frontend.

### Menu item card/editor variants
`EditItemCard.jsx` (targets `/api/MenuItems`, used for sandwiches in `Edit.jsx`) and `EditItemCardCharlie.jsx` (same endpoint, used for the "other meals" categories in `Edit.jsx`) are both live, doing overlapping jobs with different form fields — this isn't a bug, it reflects sandwiches having size-based `prices` vs. other items using a single `basePrice`. `SandwichItem.jsx` is the live sandwich display card.

### Images
Sandwich images can now be either a bare local filename served from `public/images/sandwiches/` (legacy items) or a full Cloudinary URL (anything edited/uploaded through the new `PUT` endpoint). `src/utils/resolveImageUrl.js` handles both — use it (don't hand-roll the `/images/sandwiches/` prefix) anywhere a sandwich's `imageUrl`/`item.image` is rendered; `SandwichItem.jsx` and `EditItemCard.jsx` both already do. Other menu images (wings, pizza, etc.) are static imports from `public/images/` used directly in `MenuDelta.jsx`, not database-driven.
