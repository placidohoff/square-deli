# Current Feature

Spec: [context/Features/landing-page.md](Features/landing-page.md)

## Status
Complete — implemented and tested by user on branch `landing-page`.

## Goals

<!-- Bullet points of what success looks like -->
- Add a landing/splash page with three buttons: "View Sandwiches", "View Food Items", "Login".
- "View Sandwiches" navigates to `/sandwiches`; "View Food Items" navigates to `/items`.
- "Login" leads toward the existing admin login flow — actual auth implementation is a separate feature; for now this pass only needs the landing page and its navigation buttons.

## Notes

<!-- Additional context, constraints, or details from spec -->
- Spec explicitly scopes this down: "the actual implementation of the login is an entire different feature. For now, just having an initial landing and buttons to take the menu is fine." Don't build out real auth here.
- Current routing lives in `src/App.jsx`: `/` currently redirects straight to `/sandwiches` (`<Navigate to="/sandwiches" replace />`). This will need to change so `/` renders the new landing page instead, with `/sandwiches` and `/items` reachable via the buttons (and still directly navigable/deep-linkable, since `KeyboardToggle` and existing links depend on that).
- `/edit` already exists as the admin page gated by a hardcoded client-side login (`admin1`/`admin789` in `src/pages/Edit.jsx`) — "Login" button likely just routes there rather than duplicating login UI, but confirm with user before deciding.
- Check whether a splash/logo image already exists under `public/images/` to reuse before sourcing a new one.

## History

<!-- Keep this updated. Earliest to latest. Running changelog across all features, not just the current one. -->
- 2026-08-08: [remove-unused-code] Branch `remove-unused-code` created off `master`; feature spec linked from `context/Features/remove-unused-code.md`.
- 2026-08-08: [remove-unused-code] Deleted dead frontend files: `MenuGrid.jsx`, `MenuBravo.jsx`, `MenuItem.jsx`, `EditItemCardBravo.jsx`, `PrivateRoute.jsx`. Cleaned up their imports/commented-out JSX and the commented-out `/admin` route in `App.jsx`, and the unused `MenuItem` import in `MenuSandwiches.jsx`.
- 2026-08-08: [remove-unused-code] Removed the entire unused `backend/` and `functions/` directories (confirmed with user first — includes committed `firebase-service-account.json` credential files removed from the working tree). Updated root `package.json` to drop the now-broken `server`/`dev`/`dev-BACKUP` scripts and the `concurrently` devDependency (confirmed with user first). Updated `firebase.json` to drop the `functions` config and the dead `"/**" → function "api"` rewrite, replacing it with an explicit SPA fallback rewrite to `/index.html` (confirmed with user first). Updated `CLAUDE.md` to match the new state.
- 2026-08-08: [remove-unused-code] Verified `npm run build` and `npm run lint` still succeed; confirmed the running `npm run client` dev server picked up all changes cleanly via HMR with no residual errors.
- 2026-08-08: [remove-unused-code] Committed everything together (this cleanup + the user's already-in-progress responsive-nav work) as one commit, merged into `master`, and pushed. Push was initially blocked by GitHub secret-scanning — a live Firebase service-account key had been committed to history in an earlier, never-before-pushed commit (`475951d`, predates this session). With user confirmation, rewrote `master`'s history with `git filter-branch` to strip the credential file from every commit, force-pushed the cleaned history, then deleted the local `remove-unused-code` and temporary backup branches. User was told to rotate/revoke the exposed key regardless, since it was exposed before the rewrite.
- 2026-08-09: [landing-page] Branch `landing-page` created off `master`; feature spec linked from `context/Features/landing-page.md`.
- 2026-08-09: [landing-page] Added `src/pages/Landing.jsx`: splash page reusing the existing `square-deli-grill-logo.png` and the `.background-wrapper`/`.menu-view-btn` styles already in `App.css`, with three buttons — "View Sandwiches" → `/sandwiches`, "View Food Items" → `/items`, "Login" → `/edit` (reusing the existing admin-gated page rather than building new login UI, matching how `MenuButtons.jsx`'s mobile menu already treats "Login"). Wired it in as the `/` route in `App.jsx`, replacing the old `Navigate to="/sandwiches"` redirect; removed the now-unused `Navigate` import. Added landing-page-specific layout styles to `App.css`.
- 2026-08-09: [landing-page] Verified `npm run build` and `npm run lint` succeed (same pre-existing unused-var errors as before, unrelated to this change); dev server picked up changes via HMR with no errors. User tested in browser and confirmed it looks good.
