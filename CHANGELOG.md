# Changelog

## 2026-04-29

### Branch `0.0.20`

- Migrated Daily cache persistence to `wordle:daily-ref:<YYYY-MM-DD>` + `wordle:daily-meaning:<YYYY-MM-DD>`, stopping new clear-text `wordle:daily-word:*` writes while keeping legacy fallback reads during rollout.
- Added server-authoritative `win` sync (`version: 3`) so backend score updates are recalculated from proof data instead of trusting client `pointsDelta`.
- Hardened anti-fraud round validation and telemetry in backend sync flow, including minimum round duration checks and rejection-reason tracking.
- Fixed daily shield lifecycle synchronization so shield availability/consumption stays consistent across local cache, remote profile state, and post-loss cleanup.
- Fixed challenge-related score calculations in backend progression updates to keep challenge counters aligned with applied score deltas.
- Extended mode-aware Play navigation so Home and Navbar shortcuts reopen the latest persisted mode, including `zen`.

## 2026-04-20

### Branch `0.0.18-beta`

- Split scoreboard data by mode so Classic and Lightning now keep independent rankings end-to-end (UI, local cache, pending queue, and remote queries).
- Added a mode selector in `/marcador` to switch between Classic and Lightning tables without leaving the screen.
- Extended score synchronization contracts with `modeId` for score records and round events, including Convex schema/query updates for mode-aware leaderboard stats.
- Updated Help navigation/content to support mode-aware guidance (`/ayuda?mode=<modeId>`) so each mode can show specific rules from entry points like tutorial and navbar.
- Updated Help rules/scoring copy rendering to respect difficulty feature flags, hiding disabled difficulty sections and adjusting formula copy when Insane is unavailable.
- Added current game mode persistence under `wordle:current-mode`; Home and Navbar `Play` shortcuts now open the last played mode directly, with fallback to Classic when the stored mode is gated.
- Updated version update dialog history (`VIEW_VERSION_HISTORY`) and EN/ES i18n changelog entries with the new 0.0.18-beta release notes.

## 2026-04-19

### Branch `0.0.17`

- Closed lightning mode rules (Fase 4.3 of `BOARD_GENERIC_CUSTOMIZABLE_PLAN`). Lightning inherits classic difficulty-driven rules for hints/dictionary (option A), while forcing a 60s timer (`HARD_MODE_TOTAL_SECONDS`) regardless of profile difficulty; timeout forces a loss.
- Hidden daily challenges toolbar entry and disabled challenge evaluation while `activeModeId === "lightning"`.
- Introduced per-mode persistence: `wordle:game` stays the classic key (back-compat) and non-classic modes use `wordle:game:{modeId}`. Hard-mode timer also persisted per mode under `wordle:hard-mode-timer[:modeId]`, so refreshing `/relampago` continues the saved board and timer.
- Added `clearAllPersistedGameStates` helper; `Profile` difficulty/language changes now invalidate every mode's saved board.
- Added a lightning-specific victory share message in EN/ES so shared boards mention the mode.
- Added `VITE_LIGHTNING_MODE_ENABLED` feature flag (default `true`). Disabling it renders the existing `ModeGatePlaceholder` on `/relampago`.
- Deferred to 0.0.18: timer pause on dialog/visibility change, and the `zen`/`daily` rule sets.

## 2026-04-16

### Branch `0.0.16-beta`

- Added local frontend version tracking via `wordle:app-version` and semantic version helpers (including prerelease comparison and empty previous-version handling) to detect newer builds in the same browser.
- Introduced a shared in-app update dialog in `View` that can appear from any route and renders localized release history entries from `VIEW_VERSION_HISTORY`.
- Extracted the update dialog into a dedicated `VersionUpdateDialog` component and updated the close flow so the stored app version is persisted when the dialog is dismissed.
- Added staggered Home entry transitions for navigation actions (including donation CTA), with dedicated timing constants and animation assertions in tests.
- Added `MAX_STREAK_FOR_SCORE_MULTIPLIER = 100` so score multiplier calculation is capped at 100 streak while the real streak counter can continue increasing.
- Updated Help scoring copy and i18n resources (English/Spanish) to document the capped streak formula: `min(streak, 100)` / `min(racha, 100)`.
- Updated the Spanish dictionary seed list in `convex/data/wordsEs.ts`.
- Expanded automated coverage for version update flow, scoring cap behavior, Help scoring copy interpolation, and Home staggered transition behavior.

## 2026-04-02

### Branch `0.0.10`

- Bumped package version to `0.0.10`.
- Added Normal difficulty dictionary-row bonus scoring: each incorrect valid dictionary guess adds `+0.4` to the difficulty multiplier (`NORMAL_DICTIONARY_ROW_BONUS`), integrated into win score computation and score summaries.
- Updated score presentation to support decimal multipliers/bonuses in victory breakdowns, including one-decimal formatting where needed.
- Added board-level dictionary bonus markers (`○`) for qualifying rows, with localized tooltip/help copy in English and Spanish.
- Added victory board sharing from the result dialog by capturing the board as a PNG (`html2canvas`) and sharing it through the Web Share API, including loading/error states and localized messages.
- Added manual tile selection mode: persisted `player.manualTileSelection`, Profile settings toggle, click-to-select tile editing, arrow-key cursor movement (`ArrowLeft`/`ArrowRight`), and indexed add/remove behavior in `useWordle`.
- Refactored Play composition to reduce prop drilling: sections now consume `PlayViewProvider` context directly, `usePlaySections` was removed, and board row/tile props were consolidated into view models.
- Added lint guardrails to block JSX props spread in app components (with scoped exceptions for `Button` and tests), and documented the refactor in `docs/prop-drilling-analysis.md` and `docs/props-spread-audit.md`.
- Added donation UX/config support: optional `VITE_PAYPAL_DONATION_BUTTON_URL`, PayPal actions in Home and Footer, and Home donation feedback via `#donated`.
- Updated the Spanish dictionary seed list (`convex/data/wordsEs.ts`) and expanded automated coverage across scoring, Play controller/board flows, Profile settings, and dialog behavior for these changes.

## 2026-03-26

### Branch `feedback_from_alberto`

- Updated difficulty validation so only `easy` and `normal` allow non-dictionary guesses, while `hard` and `insane` now require dictionary words.
- Rebalanced difficulty scoring multipliers to `hard x5` and `insane x9`, and aligned gameplay copy/tests with the stricter difficulty behavior.
- Preserved local player preferences (`language`, `difficulty`, `keyboardPreference`) during background remote profile hydration while still applying remote score/streak updates.
- Added hash-anchor scrolling support in the shared `View` layout so deep links like `/settings#difficulty` scroll correctly after lazy content mounts.
- Added a shortcut from the Home help dialog to Profile difficulty settings and made the navbar logo/title link back to Home.
- Expanded the Spanish dictionary dataset with additional 5-letter words to support dictionary-validated gameplay in harder modes.
- Updated README gameplay documentation with the new multipliers and a consolidated gameplay constants reference table.

## 2026-03-21

### Recent changes

- Replaced the flat streak point bonus with a square-root streak multiplier: `Math.round(scoreBase * (1 + 0.3 * Math.sqrt(streak)))`.
- Updated the Home help copy, victory score breakdown labels, and README scoring docs to match the new streak formula.
- Expanded scoring tests and Home result assertions to cover the new streak scaling behavior.

## 2026-03-19

### Branch `features/performance`

- Reduced Home route startup work by rendering lazy dialog modules only when their corresponding overlay is actually visible, so the lazy chunks for help, word list, refresh/session dialogs, result dialogs, and the developer console are no longer pulled into the tree on every Home mount.
- Reworked initial bundle loading by deferring i18n resource loading out of the base runtime, splitting vendor code into dedicated Rollup chunks, and keeping translation resources in their own asset so the app no longer ships a single oversized startup chunk.
- Simplified dictionary bootstrapping so cached word lists are reused as stable initial query data, background checksum validation only runs when cached words exist, and Home no longer refetches the same dictionary payload immediately after synchronous cache hydration.
- Tightened `PlayerProvider` hydration to avoid redundant storage rewrites, skip duplicate remote profile fetches when queued victory sync already returns a fresh profile, and prevent unnecessary top-score invalidations when remote hydration does not materially change the player record.
- Optimized the Insane countdown bar animation by switching the progress indicator from `width` animation to `transform: scaleX(...)`, avoiding repeated layout work during the timer ticks on the main gameplay screen.
- Replaced runtime font registration/warmup with static `@font-face` loading for the latin variable Roboto and Roboto Slab subsets, so font assets participate in normal browser caching and stop flashing in after each hard refresh.
- Updated supporting tests, lint/dependency configuration, and build validation to cover the new performance behavior and keep the repo green after the startup-path refactors.

### Branch `features/results`

- Added dedicated end-of-game result dialogs on Home: a victory dialog with the solved word, score breakdown, current streak, and `Play again`, plus a defeat dialog with the solved word, best streak, replay action, and a shortcut to change difficulty from Profile.
- Reworked Home result orchestration so end-of-game data is composed in `useHomeController`, reuses the existing board reset flow, suppresses the legacy win/loss feedback when dialogs are enabled, and shows a first-run settings hint that points players to the new Profile preference.
- Extended scoring for `insane` difficulty with a time-based win bonus worth 1 extra point per 2 seconds remaining, and wired the same computed total into both the persisted victory flow and the UI score summary.
- Added a persisted player preference to show or hide end-of-game dialogs, exposed it through the Profile settings flow, and kept older stored player records backward-compatible through provider normalization.
- Hardened player profile hydration so the app refreshes the current remote profile when a local player exists without a recovery code, preventing older local records from missing the new settings/code data.
- Updated Home help and translation resources to explain the `insane` time bonus and cover the new result-dialog and Profile-settings copy.
- Added motion/polish for the results flow and toolbar feedback, including boosted timer/refresh attention animations, related global styles, and the implementation plan in `docs/INSANE_SCORE_VICTORY_DIALOG_PLAN.md`.
- Expanded automated coverage across scoring, Home controller result flow, victory/defeat dialogs, Profile controller/settings behavior, Player provider normalization, and app-level gameplay integration.

### Branch `i18n-migration`

- Added a shared `i18next` + `react-i18next` setup for the React + Vite app, including centralized translation resources and alias wiring for app, Vite, and Vitest.
- Migrated user-facing copy from shared shell, Home, Profile, Scoreboard, NotFound, dialogs, board/keyboard accessibility labels, and gameplay status messaging to i18n.
- Reduced copy-only `constants.ts` usage so technical values stay as constants while visible UI text is resolved through translations.
- Updated tests to assert translated UI labels and messages where needed, and expanded validation around translated gameplay and dialog accessibility text.
- Added an ESLint guardrail that blocks new literal user-facing strings in JSX text and visible JSX attributes, while excluding tests, i18n resource files, and technical constants modules.
- Documented the i18n migration plan and architecture boundaries in project docs so translation ownership is explicit and future UI copy changes follow the same pattern.

### Branch `features/fraud`

- Completed the anti-fraud storage hardening pass for gameplay and profile state, documenting the audit and rollout plan in `docs/STORAGE_PHASE0_AUDIT.md` and `docs/STORAGE_ANTI_FRAUD_PLAN.md`.
- Removed the clear-text persisted `answer` from local game storage and replaced it with a derived `gameId + seed` reference so in-progress boards can still resume offline without exposing the final word directly.
- Added shared game-reference utilities in the Wordle domain to generate deterministic board references, resolve answers from stored references, and normalize legacy persisted games into the new storage contract.
- Extended the score/profile flow so Convex remains the source of truth for sensitive profile data while the client keeps only provisional local cache and identity-aware sync metadata.
- Added Convex anti-fraud support for player/profile synchronization, including the new score/profile operations in `convex/scores.ts` and corresponding `ScoreClient` updates.
- Hardened profile rehydration so the Profile view now refreshes the current remote player when the local cache is missing a recovery `code`, fixing older browsers/devices that predate code persistence.
- Fixed dialog close transitions so confirmation, initial-player, and developer-console dialogs now animate consistently on exit instead of waiting for the delay and disappearing abruptly.
- Refined related UX assets and polish in this branch, including updated PWA/app icons and the supporting UI/controller tests for the anti-fraud and profile refresh flows.

## 2026-03-18

### Recent changes

- Added remote-first player recovery with unique 4-character recovery codes, including new Convex profile operations, schema/index updates, and a backfill script for existing remote players.
- Extended local player persistence to store the recovery `code` and adopted remote `clientRecordId` identity so recovered profiles keep syncing scores, difficulty, and keyboard preference correctly.
- Reworked the scoreboard/profile client flow to support profile creation, profile recovery by code, and identity-aware score updates after switching browsers or recovering another profile.
- Updated the initial player dialog to support both creating a unique player name and recovering an existing profile with a code.
- Refined the Profile page to show the recovery code, add a recovery form, and reorganize profile state through a dedicated view provider/controller flow.
- Updated project docs and scripts to document the recovery flow, persistence contract changes, and the new `npm run convex:backfill-player-codes` command.
- Expanded automated test coverage across app flows, Convex/score client behavior, player provider sync, initial player dialog, home/profile controllers, and scoreboard queries.

## 2026-03-16

### Recent fixes

- Fixed cached name handling (`#28`).
- Adjusted streak-to-points conversion (`#27`).
- Reworked Insane difficulty behavior (`#26`).
- Fixed Vite configuration (`vite.config.ts`, `#25`).
- Fixed hint persistence after page refresh (`#23`).
