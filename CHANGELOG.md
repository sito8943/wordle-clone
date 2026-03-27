# Changelog

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
