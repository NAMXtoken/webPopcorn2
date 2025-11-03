# Agent Operating Guide

## Project Snapshot
- Material 3 mobile-oriented web app simulating OCR of TV screens and surfacing ratings from IMDb, Rotten Tomatoes, ScreenCritic, and friends.
- Runs inside an Android/iOS WebView; responsive layouts and touch interactions must stay first-class citizens.
- Tech stack: React 18 + Vite, TypeScript, Tailwind (with shadcn), Radix UI primitives, React Router, TanStack Query for async data.
- Current experience is demo-level: animation-driven OCR simulation feeding mocked rating data across scanner → results → detail flow.

## Mission-Critical Initiatives
1. **Real OCR pipeline**: Client-side OCR now runs through Tesseract.js (loaded from CDN) against WebRTC camera frames. Keep the provider abstraction so we can swap in Google Vision or on-device ML when needed.
2. **Live metadata**: OCR titles feed an open-data aggregation layer (OMDb + TVmaze) for IMDb/RottenTomatoes/critic ratings. No API keys required by default (optional OMDb override lives in `.env`).
3. **Overlay + native handoff**: Maintain both the overlay-on-camera concept and the “full screen review” flow; expose a toggle entry point so mobile PMs can compare.
4. **Friend activity**: Define lightweight schema for friends’ ratings/reviews (seed JSON for now, plan remote sync). Consider React Query for caching + optimistic updates.

## Data Sources & API Guidance
- **OCR**: `/services/ocr` exports mock, Tesseract (current default), and Google Vision stubs. Tesseract worker is loaded lazily from CDN to stay API-key free. If migrating to Vision, proxy through backend to avoid exposing secrets.
- **Camera**: `useCameraFeed` polyfills `getUserMedia` and falls back to snapshot uploads when WebRTC is blocked. Remember Android/iOS WebViews need explicit camera permission in their native host.
- **Movie metadata**: Aggregation lives in `src/services/movies/openProvider.ts` (OMDb + TVmaze). Add new sources here and be mindful of rate limits. Optional overrides go in `.env`.
- **Ratings aggregation**: Rotten Tomatoes & IMDb scraping is fragile; prefer official APIs or partner datasets if accessible. For now, stub via mock JSON with clear TODOs.
- **Caching**: Use React Query with stale-while-revalidate. Cache OCR results per session to avoid duplicate calls during the same scan.

## UX / UI Notes
- Preserve the purple-indigo palette, elevated cards with 12–16px radii, and Material 3 elevation tokens. Consult `tailwind.config.ts` for theme tokens before adding new colors.
- Scanner view: keep animated scanning lines & progress, show OCR confidence label once real data lands.
- Results page: support horizontal chip filters (genre/service), rating badges with consistent iconography, and smooth shared-element transitions to detail view.
- Detail view: hero image sourced from provider, stacked rating breakdown, friend reviews with avatars. Ensure accessibility: minimum 4.5:1 contrast ratios, readable font sizes, focus outlines.

## Engineering Conventions
- Use TypeScript everywhere; extend shared types in `src/types`.
- Break features into composable UI blocks inside `src/components` and keep screen-level containers in `src/screens`.
- Network logic belongs in `src/services` with hooks (`useTitleSearch`, `useTitleDetails`) living under `src/hooks`.
- Follow ESLint (`pnpm lint`) and Tailwind conventions; run `pnpm build` before handoff.
- For WebView compatibility, avoid unsupported APIs (e.g., WebXR) and test with touch events only. document any platform-specific JS bridge needs.

## Testing & Quality
- Target unit coverage for parsing/normalization logic (Jest + React Testing Library if added). Snapshot UI during review state changes.
- Add integration tests (Playwright or Cypress-lite) once OCR + APIs stabilize; for now, ensure manual QA checklist exists: scan → match → inspect detail.
- Validate performance: lazy load heavy assets, prefetch detail data on hover/focus, throttle OCR calls.

## Collaboration Notes
- Keep this file updated when major architecture or process decisions change.
- Document any new environment variables in `.env.example`.
- If introducing backend services, note endpoints, expected payloads, and deployment strategy here.
- Flag blockers (e.g., missing API credentials) early in your agent report so PM can respond.

Happy shipping!
