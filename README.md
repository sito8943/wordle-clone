# Wordle Clone

React + TypeScript Wordle clone with:

- Difficulty modes and scoring/streak system
- Profile and scoreboard routes
- Convex-backed online scoreboard and dictionary
- Local offline fallbacks and resume flow
- PWA support (installable app)

## Requirements

- Node.js `22.12.0` (see `.nvmrc`)
- npm

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. (Optional) Start Convex backend:

```bash
npm run convex:dev
```

3. Create `.env.local` (or copy `.env.example`) and set:

```bash
VITE_CONVEX_URL=https://YOUR-DEPLOYMENT.convex.cloud
VITE_WORD_LIST_BUTTON_ENABLED=true
```

4. Run the app:

```bash
npm run dev
```

If `VITE_CONVEX_URL` is not set, the app still works with local-only behavior for scoreboard and dictionary cache.

## Environment Variables

- `VITE_CONVEX_URL` (optional): Convex deployment URL.
- `VITE_WORD_LIST_BUTTON_ENABLED` (optional, default `true`): enables/disables the **Words** button UI.

Notes:

- The **Words** button is only shown in **Easy** difficulty.
- The button is disabled while dictionary data is loading or unavailable.

## Available Scripts

- `npm run dev`: start Vite dev server.
- `npm run build`: production build.
- `npm run preview`: preview production build locally.
- `npm run test`: run tests with Vitest.
- `npm run coverage`: run tests with coverage.
- `npm run lint`: run typecheck + eslint + prettier check + depcheck.
- `npm run lint-prettier`: validate formatting with Prettier.
- `npm run prettier`: format the project with Prettier.
- `npm run convex:dev`: start Convex dev backend.
- `npm run convex:deploy`: deploy Convex functions/schema.

## Persistence Behavior

- `sessionStorage`
  - `wordle:session-id`: per-tab session id.
- `localStorage`
  - `wordle:game`: in-progress game state.
  - `wordle:hint-usage`: hint usage snapshot.
  - `wordle:dictionary:en`: cached dictionary.
  - `player`: player profile and score/streak metadata.
  - `wordle:scoreboard:*`: scoreboard cache/pending/client metadata.

Resume rules:

- Same tab + refresh restores the current board automatically.
- New tab + in-progress board from another tab session prompts to continue or start fresh.

## Dictionary + Word List

- Dictionary words are stored in Convex (`words` table) by language.
- Current language is `en`.
- The app reads cached words first and only fetches from Convex when cache is empty.
- The fetched dictionary is cached locally in `wordle:dictionary:en`.

## PWA

- Powered by `vite-plugin-pwa`.
- Production build generates `manifest.webmanifest` and service worker assets.
- Icons live in `public/` (`pwa-192x192.png`, `pwa-512x512.png`, and maskable variants).

Local installability check:

```bash
npm run build
npm run preview
```

Open the preview URL in Chrome/Edge and use the install button in the address bar.

## Architecture

For architecture and layering rules, see:

- `ARCHITECTURE.md`
- `AGENTS.md`
