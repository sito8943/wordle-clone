# Wordle Clone

## Stack

- **Framework**: React 19 + TypeScript (strict)
- **Build**: Vite
- **Styling**: TailwindCSS 4
- **Backend**: Convex (serverless functions + database)
- **Icons**: FontAwesome 7 (`@fortawesome/free-solid-svg-icons`, `@fortawesome/free-brands-svg-icons`)
- **i18n**: i18next (English + Spanish, keys in `src/i18n/resources.ts`)
- **Routing**: React Router 7
- **State**: React Query (TanStack Query 5), React Context providers
- **Testing**: Vitest + React Testing Library + Playwright (e2e)

## Commands

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run test` — unit tests (vitest watch)
- `npx vitest run` — unit tests (single run)
- `npm run test:e2e` — Playwright e2e tests
- `npm run lint` — full lint (typecheck + eslint + prettier + depcheck)
- `npm run lint-typecheck` — TypeScript only (`tsc --noEmit`)
- `npm run prettier` — auto-format
- `npx convex dev` — Convex dev server

## Project Structure

```
src/
  api/            — Convex API client layer
  assets/         — Static assets
  components/     — Shared UI components (Button, Dialog, Alert, FireStreak, etc.)
  config/         — Environment config and feature flag definitions
  domain/         — Core game logic (wordle rules, scoring)
  hooks/          — Global custom hooks (useLocalStorage, useWordle, useDictionaryQuery, etc.)
  i18n/           — Internationalization (resources.ts has all EN/ES keys)
  layouts/        — Layout components (Navbar, Footer)
  providers/      — React context providers
    Api/          — API provider
    FeatureFlags/ — Feature flags from env config
    Player/       — Player state/session
    Sound/        — Web Audio API procedural sound system (volume, mute, tone scheduling)
  views/          — Page-level views
    Home/         — Landing page
    Play/         — Main game view
      components/ — Play-specific components (Board, Keyboard, Dialogs)
      hooks/      — Play-specific hooks (usePlayController, useHintController, etc.)
      providers/  — PlayView context provider
      sections/   — Toolbar, BoardSection, KeyboardSection, DialogsSection
    Profile/      — User profile/settings
    Scoreboard/   — Leaderboard
  utils/          — Shared utilities
convex/           — Convex backend (schema, functions, data)
```

## Path Aliases

Configured in `tsconfig.json`: `@api`, `@components`, `@config`, `@domain`, `@hooks`, `@i18n`, `@layouts`, `@providers`, `@utils`, `@views`.

## Conventions

- **Components**: one component per file, `memo()` for expensive renders, named exports via `index.ts`
- **Dialogs**: use the `Dialog` component from `@components/Dialogs/Dialog` (portal-based). Each dialog has its own folder with `types.ts`, `constants.ts`, `index.ts`. Dialogs in Play view are lazy-loaded in `DialogsSection.tsx`.
- **Providers**: follow the pattern `FooContext.ts` (createContext), `FooProvider.tsx` (state + logic), `useFoo.ts` (consumer hook with fallback), `types.ts`, `index.ts`
- **i18n**: all keys live in `src/i18n/resources.ts` — one object for `en`, one for `es`. Always add both.
- **State persistence**: use `useLocalStorage` hook from `@hooks` with `wordle:` prefixed keys
- **Sound system**: procedural Web Audio API oscillators (no audio files). Gain values are small (0.02-0.03 range). Volume (0-100) scales gain. Muted flag skips playback entirely.
- **Feature flags**: defined in `src/config/env.ts`, consumed via `useFeatureFlags()`. Control visibility of UI features (sound, hints, help, etc.).
- **Testing**: Vitest with `vi.mock()` for providers. Tests co-located with source files (`Foo.test.tsx`).
- **Button component**: supports `variant` (solid/outline/ghost), `color`, `icon` (FontAwesome IconDefinition), `hideLabelOnMobile`.
