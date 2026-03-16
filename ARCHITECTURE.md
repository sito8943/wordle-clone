# Project Architecture

## Stack

- React 19 + TypeScript + Vite
- React Router (`createBrowserRouter`)
- Vitest + Testing Library
- Convex (scoreboard + dictionary backend)
- Browser persistence (`localStorage` and `sessionStorage`)

## Runtime Composition

1. `src/main.tsx` bootstraps app with:

- `ErrorBoundary`
- `ApiProvider`
- `PlayerProvider`
- `App` (router)

2. `src/App.tsx` renders `RouterProvider` inside `Suspense`.
3. `src/routes.tsx` maps:

- `/` -> `Home`
- `/profile` -> `Profile`
- `/scoreboard` -> `Scoreboard`
- fallback -> `NotFound`

4. `src/layouts/View.tsx` provides shared shell (navbar/footer/content outlet).

## Layered Structure

### 1) Domain (`src/domain/wordle`)

- Pure game/state logic and storage helpers:
- state transitions (`addLetter`, `applyGuess`, `removeLetter`, win detection)
- input validation and scoring
- session id management
- persisted game normalization

### 2) API (`src/api`)

- `api/convex/ConvexGateway.ts`: gateway abstraction for Convex or local fallback.
- `api/score/*`: scoreboard operations.
- `api/words/*`: dictionary loading/caching interface.

### 3) Providers (`src/providers`)

- `ApiProvider`: creates and injects API clients.
- `PlayerProvider`: owns player profile, difficulty, keyboard preference, score/streak updates.

### 4) Hooks / Controllers (`src/hooks`)

- `useWordle`: core board session state + keyboard handling + hint reveal behavior.
- `useHomeController`: Home orchestration (dialogs, refresh flow, hints counter, hard mode timer).
- `useHomeController/useHintController/*`: isolated hint module (`constants`, `utils`, `types`, `useHintController`, `index`) with hint limits and persistence policy.
- `useHomeController/useHardModeTimer`: insane mode timer lifecycle and effects.
- `useProfileController`, `useNavbarController`, `useScoreboardController`: view-specific orchestration.
- Shared utility hooks:
- `useLocalStorage`
- `useThemePreference`
- `useAnimationsPreference`

### 5) UI (`src/views` + `src/components`)

- Views are route-level containers.
- Components implement reusable UI blocks (board, keyboard, dialogs, navbar, profile card, etc.).

## Current Persistence Contracts

- `sessionStorage`
- `wordle:session-id`: tab session id used by wordle session handling.
- `localStorage`
- `wordle:game`: persisted in-progress game payload (managed in domain storage helpers).
  - It is persisted as soon as there is in-progress input (submitted rows or typed letters in `current`).
- `wordle:hint-usage`: snapshot for hint usage (`sessionId + answer + hintsUsed`) to keep hint limits after reload.
- `player`: player profile and score/streak metadata.
- `wordle:dictionary:en`: cached dictionary words.
- additional feature keys for theme/animations/scoreboard caches.

## Data Flow (Home Gameplay)

1. `Home` view consumes `useHomeController`.
2. `useHomeController` composes:

- player preferences from `usePlayer`
- gameplay state/actions from `useWordle`
- difficulty-specific rules (hints, scoring multiplier, hard-mode timer)

3. `useWordle` delegates core transitions to domain functions and persists game state.
4. UI components (`Board`, `Keyboard`, dialogs) receive already-processed state/actions.

## Testing Layout

- Integration-heavy app tests: `src/App.test.tsx`
- Component tests: `src/components/**/**.test.tsx`
- Domain/API unit tests in their own folders.

## Change Boundaries

- Prefer adding domain helpers instead of duplicating logic in hooks/views.
- If storage keys or persistence shape changes, update tests + this file.
- Keep route structure and provider boundaries intact unless explicitly requested.
