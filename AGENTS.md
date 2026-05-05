# AGENTS Guide

This file defines how agents should work inside this repository.

## Scope

- This guide applies to the full project root.
- Architecture details live in `ARCHITECTURE.md` and are the source of truth.

## Non-Negotiable Rules

- Keep business rules in `src/domain/wordle/*`; avoid embedding game logic in views.
- Keep orchestration in controller hooks (`src/hooks/useHomeController`, `src/hooks/useWordle`, `src/hooks/useProfileController`).
- Shared UI components in `src/components/*` should stay presentational when possible.
- Feature/view components may contain UI orchestration logic and can bind directly to controllers/providers when it improves readability.
- Keep type declarations in `types.ts` files for each module/folder.
- Do not declare reusable module-level `type`/`interface` blocks inside implementation files when a `types.ts` exists.
- Do not bypass providers:
- Use `usePlayer` for player state updates.
- Use `useApi` for external data clients.
- Preserve existing storage contracts unless a task explicitly requires changing them.
- Add or update tests whenever behavior changes (`src/**/*.test.ts(x)`).
- Do not introduce unrelated refactors while fixing a focused issue.

## Change Workflow

1. Read `ARCHITECTURE.md` before modifying code.
2. Locate the owning layer first:

- Domain/state logic -> `src/domain/wordle/*`
- UI flow + side effects -> controller hooks and/or feature/view components when it improves clarity
- Pure rendering -> `src/components/*` (especially shared components)

3. Implement the smallest valid change.
4. Run targeted tests first, then broader validation if needed.
5. Keep docs updated when storage contracts, data flow, or project structure changes.

## Quality Bar

- TypeScript must remain strict-clean (`npm run lint-typecheck`).
- Existing linting and tests must pass for touched behavior.
- Keep code and naming consistent with existing style.
