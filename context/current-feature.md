# Current Feature

Spec: [context/Features/remove-unused-code.md](Features/remove-unused-code.md)

## Status
Implementation done on branch `remove-unused-code`; pending user testing/commit.

## Goals

<!-- Bullet points of what success looks like -->
- Identify code left over from previous iterations that is no longer wired into any live route/screen (per CLAUDE.md's "Architecture" notes on duplicate implementations).
- Remove dead components, pages, and any other unused files/exports without changing live behavior.

## Notes

<!-- Additional context, constraints, or details from spec -->
- CLAUDE.md already documents several known-dead pieces: `MenuGrid` (unused, superseded by `MenuSandwiches`), `MenuBravo` (unused, superseded by `MenuDelta`), `EditItemCardBravo.jsx` (unused), `MenuItem.jsx` (unused, only referenced by unused `MenuGrid`). Confirm each is truly unreferenced before deleting.
- `backend/` and `functions/` are a separate, currently-unused backend (the live app talks to an external .NET API). Confirm with user before removing — may be intentionally kept even if unused by `src/`.
- Double-check `src/App.jsx` routing before deleting anything, since it's the source of truth for what's live.

## History

<!-- Keep this updated. Earliest to latest -->
- 2026-08-08: Branch `remove-unused-code` created off `master`; feature spec linked from `context/Features/remove-unused-code.md`.
- 2026-08-08: Deleted dead frontend files: `MenuGrid.jsx`, `MenuBravo.jsx`, `MenuItem.jsx`, `EditItemCardBravo.jsx`, `PrivateRoute.jsx`. Cleaned up their imports/commented-out JSX and the commented-out `/admin` route in `App.jsx`, and the unused `MenuItem` import in `MenuSandwiches.jsx`.
- 2026-08-08: Removed the entire unused `backend/` and `functions/` directories (confirmed with user first — includes committed `firebase-service-account.json` credential files removed from the working tree; git history still has them, untouched). Updated root `package.json` to drop the now-broken `server`/`dev`/`dev-BACKUP` scripts and the `concurrently` devDependency (confirmed with user first). Updated `firebase.json` to drop the `functions` config and the dead `"/**" → function "api"` rewrite, replacing it with an explicit SPA fallback rewrite to `/index.html` (confirmed with user first — needed so client-side routes like `/sandwiches` don't 404 on direct load in production). Updated `CLAUDE.md` to match the new state.
- 2026-08-08: Verified `npm run build` and `npm run lint` still succeed (pre-existing unused-var lint errors in untouched files remain, out of scope); confirmed the running `npm run client` dev server picked up all changes cleanly via HMR with no residual errors.

