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
- `/play` -> `Play` (gameplay)
- `/settings` -> `Profile`
- `/profile` -> `Profile` (legacy alias)
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

### 5) UI (`src/features` + `src/views` + `src/components`)

- `src/features/*` contains feature-scoped page modules and modlets.
- `src/views/*` stays as thin route wrappers that delegate to feature entry points.
- `src/components/*` is reserved for truly shared/presentational UI modules.

## Modlet-Based Feature Pattern

To improve cohesion and maintainability, feature orchestration and UI should follow a **modlet-based pattern**.

A **modlet** is a small, cohesive, feature-scoped module with a single responsibility.
It colocates the minimal files needed for one behavior or UI unit instead of spreading related code across broad global folders.

A modlet may contain:

- UI components
- local hooks/controllers
- feature-specific types/model helpers
- small API adapters
- tests
- styles
- an `index.ts` file exposing its public API

### Modlet Rules

1. Organize by feature first, then by technical role.
   - Related files should stay together.
   - Avoid scattering one feature across global `hooks`, `components`, and `views` folders unless the code is truly shared.

2. Use small modlets with one responsibility.
   - Split large controllers or large components into smaller modules.
   - Each modlet should represent one coherent behavior or UI block.

3. Separate shared modules from feature-specific modules.
   - Reusable generic UI can remain in shared locations.
   - Feature-specific code should stay inside its own feature scope.

4. Expose a minimal public API.
   - Other parts of the app should import from the modlet's `index.ts`, not from its internal files.

5. Prefer composition over monolithic route files.
   - Route views should compose modlets instead of owning all orchestration directly.

### How Modlets Fit This Architecture

- `src/domain` remains the place for pure business logic.
- `src/api` remains the place for backend and gateway integration.
- `src/providers` remains the place for global composition and cross-app state.
- `src/hooks` remains the controller/orchestration layer.
- `src/views` remains route wrappers.
- `src/components` should only hold shared UI.
- `src/features` is the default place for feature-specific UI modlets.

This means route features such as Home, Profile, and Scoreboard should prefer internal feature folders with colocated modlets instead of relying on broad global buckets for feature-specific controllers and UI.

Current implemented direction:

```text
src/
  views/
    Home/
      Home/
      Board/
      Keyboard/
      HelpDialog/
      RefreshConfirmationDialog/
      SessionResumeDialog/
      WordListDialog/
    Profile/
      Profile/
      ProfileCard/
    Scoreboard/
      Scoreboard/
  components/
    Button/
    Dialog/
    ErrorBoundary/
    Footer/
    FireStreak/
    Navbar/
    InitialPlayerDialog/
    SplashScreen/
  domain/
  api/
  providers/
```

This is an evolution of the current layered architecture, not a replacement for it. The main change is to reduce feature scattering by colocating feature-specific orchestration and UI.

## Current Persistence Contracts

- `sessionStorage`
- `wordle:session-id`: tab session id used by wordle session handling.
- `wordle:end-of-game-dialog-seen`: marks that this tab already showed the first-run hint for victory/defeat dialogs.
- `localStorage`
- `wordle:game`: persisted in-progress game payload (managed in domain storage helpers).
  - It stores `{ sessionId, gameId, seed, guesses, current, gameOver }`.
  - `answer` is resolved at runtime from `gameId + seed + dictionary`, not stored in clear.
  - It is persisted as soon as there is in-progress input (submitted rows or typed letters in `current`).
- `wordle:hint-usage`: snapshot for hint usage (`gameId + derived gameKey + hintsUsed`) to keep hint limits after reload without persisting `answer`.
- `player`: player profile and score/streak metadata, including recovery `code`.
  - It also stores local presentation preferences such as `difficulty`, `keyboardPreference`, `showEndOfGameDialogs`, and `manualTileSelection`.
  - It also stores the selected `language` (`en` or `es`) used by i18n, dictionary loading, and scoreboard segmentation.
  - `score` and `streak` are treated as local cache for UX and are rehydrated from remote profile sync when available.
- `wordle:sync-events`: local queue of pending round sync events (`win` with `pointsDelta`, `loss` with timestamp) for offline remote synchronization.
- `wordle:dictionary:en`: cached dictionary words.
- `wordle:scoreboard:profile-identity`: adopted remote profile identity (`clientRecordId`) used after recovery or remote profile creation.
- `wordle:sound-enabled`: user preference toggle for enabling/disabling gameplay sounds.
- additional feature keys for theme/animations/scoreboard caches.

## Data Flow (Play Gameplay)

1. `Home` route wrapper at `/play` delegates to `src/features/home/page`.
2. `useHomeController` composes:

- player preferences from `usePlayer`
- gameplay state/actions from `useWordle`
- difficulty-specific rules (hints, scoring multiplier, hard-mode timer)
- score/profile identity continues through `PlayerProvider`, which now performs remote-first create/recover profile operations, keeps local score as cache, and syncs confirmed victories through the offline event queue

3. `useWordle` delegates core transitions to domain functions and persists game state.
4. `PlayerProvider` treats local score/streak as provisional UI cache, writes local scoreboard cache immediately, and syncs pending victory events to Convex when possible, scoped to the active player language.
5. Home feature modlets (`Board`, `Keyboard`, dialogs) receive already-processed state/actions.

## Testing Layout

- Integration-heavy app tests: `src/App.test.tsx`
- Shared component tests: `src/components/**/**.test.tsx`
- Views modlet tests: `src/views/**/**.test.ts(x)`
- Domain/API unit tests in their own folders.

## Change Boundaries

- Prefer adding domain helpers instead of duplicating logic in hooks/views.
- If storage keys or persistence shape changes, update tests + this file.
- Keep route structure and provider boundaries intact unless explicitly requested.
- All user-facing copy in JSX must go through `i18next` / `react-i18next`.
- Resolve translations in views, layouts, shared UI, or controller output models, not in domain logic.
- Do not move technical constants into i18n: storage keys, query names, mutation names, DOM ids, class names, timing values, and other implementation-only strings stay as code constants.
- Internal developer/invariant errors such as missing provider usage messages may stay outside i18n unless they are intentionally shown as end-user UI.
