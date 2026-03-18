# Changelog

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
