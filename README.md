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

## i18n guardrail

- User-facing copy in JSX must go through `i18next` / `react-i18next`.
- ESLint blocks new literal strings in JSX text nodes and visible attributes such as `aria-label`, `title`, `placeholder`, and `alt`.
- Technical constants, test files, `src/i18n/**`, and module `constants.ts` files are excluded from that rule.
- `npm run lint-prettier`: validate formatting with Prettier.
- `npm run prettier`: format the project with Prettier.
- `npm run convex:dev`: start Convex dev backend.
- `npm run convex:deploy`: deploy Convex functions/schema.
- `npm run convex:backfill-player-codes`: assign missing 4-character recovery codes to existing remote players.

## Persistence Behavior

- `sessionStorage`
  - `wordle:session-id`: per-tab session id.
- `localStorage`
  - `wordle:game`: in-progress game reference `{ sessionId, gameId, seed, guesses, current, gameOver }`.
    - `answer` is not stored; it is derived locally from `gameId`, `seed`, and the dictionary.
  - `wordle:hint-usage`: hint usage snapshot keyed by game reference, without storing `answer` in clear.
  - `wordle:sync-events`: pending offline victory events used to sync score/streak to Convex in order.
  - `wordle:dictionary:en`: cached dictionary.
  - `player`: player profile and score/streak metadata, including recovery `code`.
    - local `score`/`streak` act as UI cache; confirmed remote values take precedence after sync.
  - `wordle:scoreboard:*`: scoreboard cache/pending/client metadata.
  - `wordle:scoreboard:profile-identity`: adopted remote profile identity (`clientRecordId`) after profile creation or recovery.

Resume rules:

- Same tab + refresh restores the current board automatically.
- New tab + in-progress board from another tab session prompts to continue or start fresh.

## Player Recovery

- A named profile gets a unique 4-character recovery code (`A-Z`, `0-9`) from Convex.
- The code is shown in `Profile` and is read-only.
- The initial dialog now supports two explicit identity actions:
  - create a unique player name
  - recover an existing profile with its code
- Identity operations are remote-first. If Convex is unavailable, profile creation/recovery fails without mutating the local player into an unrecognized state.

Backfill existing remote players:

```bash
npm run convex:backfill-player-codes
```

You can pass extra Convex CLI flags through the script, for example:

```bash
npm run convex:backfill-player-codes -- --prod
```

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
