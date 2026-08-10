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

### Deploys — both frontend and backend on Render, both auto-deploy on push to `master`
Both use Render's native GitHub integration — no GitHub Actions involved for either. (This repo used to deploy the frontend to Firebase Hosting via `.github/workflows/firebase-hosting-*.yml`; that's gone. If you see references to Firebase Hosting in old history/docs, they're stale — moved to Render because Firebase console access was uncertain.)
- **Frontend** → Render Static Site, root directory blank (repo root), build command `npm run build`, publish directory `dist`. SPA routing (so direct navigation/refresh on client-side routes like `/sandwiches` or `/edit` doesn't 404) is handled by a dashboard-configured Rewrite rule (Redirects/Rewrites tab → Source `/*`, Destination `/index.html`, Action Rewrite) — **not** `public/_redirects`. That file is still in the repo (Netlify-format, harmless, other hosts do honor it) but Render never actually parses it as a rewrite rule; it was wrongly assumed to be the fix during the `hosting` feature until `pages-not-found` caught it live.
- **Backend** (`server/`) → Render Web Service, root directory `server`. Build command `npm install`; start command `npm run prisma:deploy && npm start` (`prisma:deploy` runs `prisma migrate deploy`, the non-interactive counterpart to `migrate dev`, so pending migrations apply automatically on every deploy). Free tier — spins down after 15 min idle, ~30-50s cold start on the next request after a quiet period. Env vars (`DATABASE_URL`, `DIRECT_URL`, `CLOUDINARY_*`, `JWT_SECRET`) are set directly in Render's dashboard, same values as `server/.env` but never committed anywhere.
- `src/Constants.js`'s `DELI_API_ROOT` picks between the backend URL and `localhost:5000` automatically via Vite's built-in `import.meta.env.PROD`. No manual toggling needed, but the Render backend URL is hardcoded in source (not a secret, just a public API endpoint) — if that service is ever recreated under a different URL, update it there.

## Architecture

This is a restaurant menu site (React 19 + Vite + react-router-dom + Bootstrap) in an actively-experimental state — expect multiple parallel/duplicate implementations of the same screen. **Only one implementation per concern is currently wired into `App.jsx`; the rest are dead code kept around from earlier iterations.** Before editing a component, check `src/App.jsx` to confirm it's actually on a live route.

### Routing (`src/App.jsx`)
- `/sandwiches` → `Layout` → `MenuSandwiches` (live).
- `/items` → `Layout` → `MenuDelta` (live).
- `/edit` → `Edit` page (admin menu editor, gated by a client-side login form).
- A global `KeyboardToggle` component listens for Space (toggle `/sandwiches` ↔ `/items`) and `E` (jump to `/edit`) — this is intentional site-wide behavior, not leftover debug code.
- `MenuButtons` renders the mobile hamburger menu (`.show-on-mobile`); `Layout`/menu components render the desktop view — look for `.show-on-large` / `.show-on-mobile` class pairs when touching responsive layout (see recent "responsive navigation" work).

### Backend
Fully migrated off the old external ASP.NET Core Web API onto Postgres/Neon via Prisma, deployed on Render — see `context/current-feature.md` for the full history.

- `server/src/index.js`: `GET /api/MenuItems`, `GET /api/MenuItems/grouped`, `GET /api/MenuItems/sandwiches`, `PUT /api/MenuItems/{id}` (multipart, incl. Cloudinary image upload via `server/src/cloudinary.js`), `PUT /api/MenuItems/{id}/move` (reorder within a category), `POST /api/MenuItems` (create), `DELETE /api/MenuItems/{id}`. All writes (`PUT`/`POST`/`DELETE`) are `requireAuth`-protected (JWT, see `server/src/auth.js`). Schema in `server/prisma/schema.prisma`: `MenuItem` (`category`, `basePrice`, `sortOrder`) with related `Price` rows for sandwiches' size-based pricing, plus `AdminUser` (single row, bcrypt-hashed password, managed via `npm run create-admin`).
- `server/.env` (gitignored, both locally and as Render env vars) holds `DATABASE_URL`/`DIRECT_URL` (Neon), `CLOUDINARY_*`, and `JWT_SECRET` — never put real values in `server/.env.example`, which is NOT gitignored and exists only as a placeholder template.

The `/edit` page (`src/pages/Edit.jsx`) has real login — `POST /api/auth/login` against `AdminUser`, JWT stored in `localStorage` (`src/utils/authToken.js`) and sent as `Authorization: Bearer` on write requests. It's a full admin panel now (see `src/components/admin/`): sidebar category nav, search, add/edit/delete items, reorder via up/down buttons — not the old ad hoc single-column list.

### Menu item card/editor variants
`EditItemCard.jsx` (sandwiches — size-based `prices`) and `EditItemCardCharlie.jsx` (other categories — single `basePrice`) both render as cards in the admin grid and open a shared `AdminModal` (`src/components/admin/AdminModal.jsx`) for editing — overlapping logic reflecting the different pricing shapes, not a bug. `SandwichItem.jsx` is the live customer-facing sandwich display card.

### Images
Sandwich images can now be either a bare local filename served from `public/images/sandwiches/` (legacy items) or a full Cloudinary URL (anything edited/uploaded through the new `PUT` endpoint). `src/utils/resolveImageUrl.js` handles both — use it (don't hand-roll the `/images/sandwiches/` prefix) anywhere a sandwich's `imageUrl`/`item.image` is rendered; `SandwichItem.jsx` and `EditItemCard.jsx` both already do. Other menu images (wings, pizza, etc.) are static imports from `public/images/` used directly in `MenuDelta.jsx`, not database-driven.
