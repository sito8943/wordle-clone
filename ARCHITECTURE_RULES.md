# Architecture Rules For Agents (CLAUDE/CODEX)

## Mandatory File Structure

When creating or refactoring hooks/components, use this structure:

```text
FeatureName/
├─ FeatureName.tsx|ts   # Only one component or one hook per file
├─ constants.ts         # Constants only
├─ utils.ts             # Reusable helper functions only
├─ types.ts             # Type aliases and interfaces only
└─ index.ts             # Public exports
```

## Rules

- One hook per file (`useSomething.ts`).
- One component per file (`Something.tsx`).
- Do not declare reusable helpers/constants/types inside component or hook files.
- Move helper functions to `utils.ts`.
- Move constants to `constants.ts`.
- Move interfaces/types to `types.ts`.
- Keep files as siblings of the hook/component they support.
- If a hook/component grows, create its own folder and expose public API via `index.ts`.
- Preserve existing public imports by re-exporting from local `index.ts` files.

## Routing Conventions

- Centralize app routes in one shared file (for example: `lib/routes.ts`) using constant objects (`as const`) instead of literal strings spread across the codebase.
- Do not hardcode route strings in `navigate(...)`, `<Link to=...>`, `<Route path=...>`, menu maps, or sitemap maps.
- Centralize query param keys in route constants (for example: `RouteQueryParam`) and reuse them when reading/writing URL params.
