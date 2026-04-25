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
DAILY_PROXY_TARGET=http://localhost:8787
VITE_DAILY_WORD_API_URL=/api/daily
VITE_WORD_LIST_BUTTON_ENABLED=true
VITE_SETTINGS_DRAWER_ENABLED=true
```

4. (Recommended for Daily mode in local dev) start the sibling daily backend:

```bash
cd ../wordle-daily-backend
npm install
npm run dev
```

5. Run the app:

```bash
npm run dev
```

If `VITE_CONVEX_URL` is not set, the app still works with local-only behavior for scoreboard and dictionary cache.

## Scoring

- Base points are the remaining attempts after a win.
- Difficulty multiplies base points: `easy x1`, `normal x2`, `hard x5`, `insane x7`.
- `insane` also adds `+1` point for every `4` seconds left.
- `normal` adds a `+0.4` dictionary bonus per valid non-answer guess row.
- Streak acts as a multiplier (capped at `100`) instead of a flat addition:

```ts
const scoreBase = basePoints * difficultyMultiplier + timeBonus;
const scoreFinal = Math.round(scoreBase * (1 + 0.3 * Math.sqrt(streak)));
```

## Gameplay Constants Reference

This list centralizes the main game-related constants (difficulty, timer, board, dictionary, and persistence keys).

### Core Gameplay

| Constant                                 | Value                                        | Source                                 |
| ---------------------------------------- | -------------------------------------------- | -------------------------------------- |
| `WORD_LENGTH`                            | `5`                                          | `src/domain/wordle/constants.ts`       |
| `MAX_GUESSES`                            | `6`                                          | `src/domain/wordle/constants.ts`       |
| `BOARD_ROWS`                             | `6`                                          | `src/domain/wordle/board/constants.ts` |
| `BOARD_COLUMNS`                          | `5`                                          | `src/domain/wordle/board/constants.ts` |
| `DIFFICULTY_SCORE_MULTIPLIERS`           | `{ easy: 1, normal: 2, hard: 5, insane: 7 }` | `src/domain/wordle/constants.ts`       |
| `STREAK_MODIFIER`                        | `0.3`                                        | `src/domain/wordle/constants.ts`       |
| `MAX_STREAK_FOR_SCORE_MULTIPLIER`        | `100`                                        | `src/domain/wordle/constants.ts`       |
| `LIGHTNING_SECONDS_BONUS`                | `4`                                          | `src/domain/wordle/constants.ts`       |
| `NORMAL_DICTIONARY_ROW_BONUS`            | `0.4`                                        | `src/domain/wordle/constants.ts`       |
| `SCORE_DECIMAL_FACTOR`                   | `10`                                         | `src/domain/wordle/constants.ts`       |
| `MIN_ROUND_DURATION_FOR_SCORE_COMMIT_MS` | `4000`                                       | `src/domain/wordle/constants.ts`       |
| `PlayerDifficulty`                       | `"easy" \| "normal" \| "hard" \| "insane"`   | `src/domain/wordle/player.ts`          |

### Timer and Hints

| Constant                           | Value                    | Source                                                |
| ---------------------------------- | ------------------------ | ----------------------------------------------------- |
| `HARD_MODE_TOTAL_SECONDS`          | `60`                     | `src/views/Play/hooks/usePlayController/constants.ts` |
| `HARD_MODE_FINAL_STRETCH_SECONDS`  | `15`                     | `src/views/Play/hooks/usePlayController/constants.ts` |
| `HARD_MODE_CLOCK_BOOST_SCALES`     | `[0.28, 0.2, 0.14, 0.1]` | `src/views/Play/hooks/usePlayController/constants.ts` |
| `HARD_MODE_CLOCK_BOOST_THRESHOLDS` | `[30, 45]`               | `src/views/Play/hooks/usePlayController/constants.ts` |
| `EASY_MODE_HINT_LIMIT`             | `2`                      | `src/views/Play/hooks/useHintController/constants.ts` |
| `NORMAL_MODE_HINT_LIMIT`           | `1`                      | `src/views/Play/hooks/useHintController/constants.ts` |
| `HARD_MODE_HINT_LIMIT`             | `0`                      | `src/views/Play/hooks/useHintController/constants.ts` |

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
| `WORDS_DEFAULT_LANGUAGE`    | `"es"`                         | `src/api/words/constants.ts` |
| `WORDS_SUPPORTED_LANGUAGES` | `["es"]`                       | `src/api/words/constants.ts` |
| `WORDS_CACHE_KEY_PREFIX`    | `"wordle:dictionary"`          | `src/api/words/constants.ts` |
| `WORDS_CHECKSUM_KEY_PREFIX` | `"wordle:dictionary:checksum"` | `src/api/words/constants.ts` |

### Persistence and Session Keys

| Constant                                      | Value                                    | Source                                                |
| --------------------------------------------- | ---------------------------------------- | ----------------------------------------------------- |
| `WORDLE_GAME_STORAGE_KEY`                     | `"wordle:game"`                          | `src/config/constants.ts`                             |
| `WORDLE_SESSION_STORAGE_KEY`                  | `"wordle:session-id"`                    | `src/domain/wordle/constants.ts`                      |
| `HINT_USAGE_STORAGE_KEY`                      | `"wordle:hint-usage"`                    | `src/views/Home/hooks/useHintController/constants.ts` |
| `WORDLE_SYNC_EVENTS_KEY`                      | `"wordle:sync-events"`                   | `src/api/score/constants.ts`                          |
| `END_OF_GAME_DIALOG_SEEN_SESSION_STORAGE_KEY` | `"wordle:end-of-game-dialog-seen"`       | `src/views/Play/hooks/usePlayController/constants.ts` |
| `HARD_MODE_TIMER_STORAGE_KEY`                 | `"wordle:hard-mode-timer"`               | `src/views/Play/hooks/usePlayController/constants.ts` |
| `SCOREBOARD_CACHE_KEY`                        | `"wordle:scoreboard:cache"`              | `src/api/score/constants.ts`                          |
| `SCOREBOARD_PENDING_KEY`                      | `"wordle:scoreboard:pending"`            | `src/api/score/constants.ts`                          |
| `SCOREBOARD_CLIENT_ID_KEY`                    | `"wordle:scoreboard:client-id"`          | `src/api/score/constants.ts`                          |
| `SCOREBOARD_PROFILE_IDENTITY_KEY`             | `"wordle:scoreboard:profile-identity"`   | `src/api/score/constants.ts`                          |
| `WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY`      | `"wordle:disable-start-animations"`      | `src/domain/wordle/constants.ts`                      |
| `WORDLE_START_ANIMATION_SESSION_KEY`          | `"wordle:start-animation-session-seen"`  | `src/domain/wordle/constants.ts`                      |
| `WORDLE_KEYBOARD_ENTRY_ANIMATION_SESSION_KEY` | `"wordle:keyboard-entry-animation-seen"` | `src/domain/wordle/constants.ts`                      |

### Gameplay UX Timing

| Constant                                            | Value  | Source                                                |
| --------------------------------------------------- | ------ | ----------------------------------------------------- |
| `MESSAGE_VISIBILITY_DURATION_MS`                    | `1800` | `src/hooks/useWordle/constants.ts`                    |
| `GAME_STATE_PERSIST_DEBOUNCE_MS`                    | `150`  | `src/hooks/useWordle/constants.ts`                    |
| `COMBO_FLASH_VISIBILITY_DURATION_MS`                | `820`  | `src/views/Play/hooks/usePlayController/constants.ts` |
| `CHALLENGE_COMPLETION_ALERT_VISIBILITY_DURATION_MS` | `4000` | `src/views/Play/hooks/usePlayController/constants.ts` |
| `SCORE_LIMIT`                                       | `10`   | `src/config/constants.ts`                             |

## Environment Variables

All flags are read from `src/config/env.ts`.

- `VITE_APP_VERSION` (default `"0.0.0"`): app version.
- `VITE_CONVEX_URL` (optional): Convex deployment URL.
- `VITE_DAILY_WORD_API_URL` (default `"/api/daily"`): base endpoint used by `DailyWordClient` to fetch the daily payload (word + meaning) in a single request.
- `VITE_WORD_REPORT_PHONE_NUMBER` (optional): WhatsApp target for the invalid-word report link.
- `VITE_PAYPAL_DONATION_BUTTON_URL` (optional): PayPal donation URL.
- `DAILY_PROXY_TARGET` (default `"http://localhost:8787"`): dev proxy target for `/api/daily` in Vite.

Feature flags (all default `true` unless noted):

- `VITE_WORD_LIST_BUTTON_ENABLED`: enables the **Words** button (shown only in Easy).
- `VITE_WORD_REPORT_BUTTON_ENABLED`: enables the invalid-word report button.
- `VITE_PAYPAL_DONATION_BUTTON_ENABLED`: enables the donate button.
- `VITE_SHARE_BUTTON_ENABLED`: enables the victory share action.
- `VITE_DEV_CONSOLE_ENABLED`: enables the developer console (only in dev mode at runtime).
- `VITE_SOUND_ENABLED`: enables procedural sound effects.
- `VITE_HINTS_ENABLED`: enables the hint system.
- `VITE_HELP_BUTTON_ENABLED`: enables the help button.
- `VITE_CHALLENGES_ENABLED`: enables daily challenges.
- `VITE_SETTINGS_DRAWER_ENABLED`: enables the in-game settings drawer.
- `VITE_PLAY_OFFLINE_STATE_ENABLED` (default `false`): shows the offline state in Play view.
- `VITE_LIGHTNING_MODE_ENABLED`: enables the lightning/insane timer mode.
- `VITE_TIMER_AUTO_PAUSE_ENABLED` (default `false`): pauses the hard-mode timer when Play dialogs are open or the browser tab is hidden.
- `VITE_DIFFICULTY_EASY_ENABLED` / `VITE_DIFFICULTY_NORMAL_ENABLED` / `VITE_DIFFICULTY_HARD_ENABLED` / `VITE_DIFFICULTY_INSANE_ENABLED`: individual difficulty toggles.

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
  - `wordle:daily-word:<YYYY-MM-DD>`: cached remote daily word.
  - `wordle:daily-meaning:<YYYY-MM-DD>:<WORD>`: cached meaning for the daily word fetched from the daily payload.
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
