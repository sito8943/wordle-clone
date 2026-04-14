# Wordle Clone

This project is an original word game inspired by popular word-guessing mechanics.
It is not affiliated with or endorsed by The New York Times.

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
VITE_SETTINGS_DRAWER_ENABLED=true
```

4. Run the app:

```bash
npm run dev
```

If `VITE_CONVEX_URL` is not set, the app still works with local-only behavior for scoreboard and dictionary cache.

## Scoring

- Base points are the remaining attempts after a win.
- Difficulty multiplies base points: `easy x1`, `normal x2`, `hard x5`, `insane x9`.
- `insane` also adds `+1` point for every `2` seconds left.
- Final win score uses streak as a multiplier instead of a flat addition:

```ts
const scoreBase = basePoints * difficultyMultiplier + timeBonus;
const scoreFinal = Math.round(scoreBase * (1 + 0.3 * Math.sqrt(streak)));
```

## Gameplay Constants Reference

This list centralizes the main game-related constants (difficulty, timer, board, dictionary, and persistence keys).

### Core Gameplay

| Constant                       | Value                                        | Source                                 |
| ------------------------------ | -------------------------------------------- | -------------------------------------- |
| `WORD_LENGTH`                  | `5`                                          | `src/domain/wordle/constants.ts`       |
| `MAX_GUESSES`                  | `6`                                          | `src/domain/wordle/constants.ts`       |
| `BOARD_ROWS`                   | `6`                                          | `src/domain/wordle/board/constants.ts` |
| `BOARD_COLUMNS`                | `5`                                          | `src/domain/wordle/board/constants.ts` |
| `DIFFICULTY_SCORE_MULTIPLIERS` | `{ easy: 1, normal: 2, hard: 5, insane: 9 }` | `src/domain/wordle/constants.ts`       |
| `PlayerDifficulty`             | `"easy" \| "normal" \| "hard" \| "insane"`   | `src/domain/wordle/player.ts`          |

### Timer and Hints

| Constant                          | Value | Source                                                |
| --------------------------------- | ----- | ----------------------------------------------------- |
| `HARD_MODE_TOTAL_SECONDS`         | `60`  | `src/views/Home/hooks/useHomeController/constants.ts` |
| `HARD_MODE_FINAL_STRETCH_SECONDS` | `15`  | `src/views/Home/hooks/useHomeController/constants.ts` |
| `EASY_MODE_HINT_LIMIT`            | `2`   | `src/views/Home/hooks/useHintController/constants.ts` |
| `NORMAL_MODE_HINT_LIMIT`          | `1`   | `src/views/Home/hooks/useHintController/constants.ts` |
| `HARD_MODE_HINT_LIMIT`            | `0`   | `src/views/Home/hooks/useHintController/constants.ts` |

### Player Defaults

| Constant                             | Value                    | Source                              |
| ------------------------------------ | ------------------------ | ----------------------------------- |
| `DEFAULT_PLAYER_DIFFICULTY`          | `"normal"`               | `src/providers/Player/constants.ts` |
| `DEFAULT_PLAYER_KEYBOARD_PREFERENCE` | `"onscreen"`             | `src/providers/Player/constants.ts` |
| `DEFAULT_PLAYER_LANGUAGE`            | `"en"`                   | `src/providers/Player/constants.ts` |
| `PlayerKeyboardPreference`           | `"onscreen" \| "native"` | `src/domain/wordle/player.ts`       |
| `PlayerLanguage`                     | `"en" \| "es"`           | `src/domain/wordle/player.ts`       |

### Dictionary and Language

| Constant                    | Value                          | Source                       |
| --------------------------- | ------------------------------ | ---------------------------- |
| `WORDS_DEFAULT_LANGUAGE`    | `"en"`                         | `src/api/words/constants.ts` |
| `WORDS_SUPPORTED_LANGUAGES` | `["en", "es"]`                 | `src/api/words/constants.ts` |
| `WORDS_CACHE_KEY_PREFIX`    | `"wordle:dictionary"`          | `src/api/words/constants.ts` |
| `WORDS_CHECKSUM_KEY_PREFIX` | `"wordle:dictionary:checksum"` | `src/api/words/constants.ts` |

### Persistence and Session Keys

| Constant                                      | Value                                    | Source                                                |
| --------------------------------------------- | ---------------------------------------- | ----------------------------------------------------- |
| `WORDLE_GAME_STORAGE_KEY`                     | `"wordle:game"`                          | `src/config/constants.ts`                             |
| `WORDLE_SESSION_STORAGE_KEY`                  | `"wordle:session-id"`                    | `src/domain/wordle/constants.ts`                      |
| `HINT_USAGE_STORAGE_KEY`                      | `"wordle:hint-usage"`                    | `src/views/Home/hooks/useHintController/constants.ts` |
| `WORDLE_SYNC_EVENTS_KEY`                      | `"wordle:sync-events"`                   | `src/api/score/constants.ts`                          |
| `END_OF_GAME_DIALOG_SEEN_SESSION_STORAGE_KEY` | `"wordle:end-of-game-dialog-seen"`       | `src/views/Home/hooks/useHomeController/constants.ts` |
| `WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY`      | `"wordle:disable-start-animations"`      | `src/domain/wordle/constants.ts`                      |
| `WORDLE_START_ANIMATION_SESSION_KEY`          | `"wordle:start-animation-session-seen"`  | `src/domain/wordle/constants.ts`                      |
| `WORDLE_KEYBOARD_ENTRY_ANIMATION_SESSION_KEY` | `"wordle:keyboard-entry-animation-seen"` | `src/domain/wordle/constants.ts`                      |

### Gameplay UX Timing

| Constant                         | Value  | Source                             |
| -------------------------------- | ------ | ---------------------------------- |
| `MESSAGE_VISIBILITY_DURATION_MS` | `1800` | `src/hooks/useWordle/constants.ts` |
| `GAME_STATE_PERSIST_DEBOUNCE_MS` | `150`  | `src/hooks/useWordle/constants.ts` |

## Environment Variables

- `VITE_CONVEX_URL` (optional): Convex deployment URL.
- `VITE_WORD_LIST_BUTTON_ENABLED` (optional, default `true`): enables/disables the **Words** button UI.
- `VITE_SETTINGS_DRAWER_ENABLED` (optional, default `true`): enables/disables the in-game **Settings Drawer** UI.

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
  - `wordle:dictionary:es`: cached dictionary.
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
- Gameplay dictionary language is fixed to `es`.
- The app reads cached words first and only fetches from Convex when cache is empty.
- The fetched dictionary is cached locally in `wordle:dictionary:es`.

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
