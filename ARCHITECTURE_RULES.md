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

## API Layer (REST v2)

Backend exposes REST under `/api/v2/...` (see `docs/rest-api-v2.md`). All new code targets v2. Legacy `/api/db/...` and Convex compat endpoints stay live during migration but no new call sites.

### Layers (bottom → top)

```
HttpGateway          ─ fetch wrapper, base URL, JSON, status-code mapping, identity injection
ResourceManager      ─ one class per resource (ScoresManager, PlayersManager, ...)
ApiManager           ─ aggregates resource managers, exposes them as readonly getters
ApiProvider          ─ instantiates ApiManager once via useMemo, puts in ApiContext
useApi()             ─ consumer hook, returns ApiManager
useGetX / useDoX     ─ one hook per endpoint, wraps useQuery / useMutation, calls manager method
```

### Resource Managers

- One folder per resource under `src/api/<resource>/`.
- File: `<Resource>Manager.ts`. **Manager** suffix, not `Client`. Rename existing `*Client.ts` when migrated.
- Class only — no React, no react-query, no storage side-effects beyond identity injection.
- Constructor receives `HttpGateway`. Methods are async, return DTOs typed in `types.ts`.
- One method per REST endpoint. Method names mirror intent: `getTop`, `record`, `update`, `consumeShield`, `register`, `renameNick`, `updatePreferences`, `markTutorialSeen`, `getMe`, `isNickAvailable`, `getByCode`.
- Identity (`clientId`, `clientRecordId`) injected by manager, not by caller. Hooks pass user-meaningful args only.
- Throw on non-2xx. Map status codes to typed errors: `ApiValidationError` (400), `ApiNotFoundError` (404), `ApiConflictError` (409). Hooks branch on error class.

### ApiManager

- One class `ApiManager` in `src/api/ApiManager.ts`.
- Holds resource managers as `readonly` private fields, exposes via getters: `api.scores`, `api.players`, `api.challenges`, `api.words`, `api.admin`.
- Constructed with one `HttpGateway` shared across all resource managers.
- No methods of its own beyond getters. No business logic.

```ts
class ApiManager {
  readonly scores: ScoresManager;
  readonly players: PlayersManager;
  readonly challenges: ChallengesManager;
  readonly words: WordsManager;
  readonly admin: AdminManager;
  constructor(gateway: HttpGateway) {
    /* assign */
  }
}
```

### ApiProvider / useApi

- Single global `ApiProvider` at app root. No per-resource providers.
- Instantiates `HttpGateway` and `ApiManager` once via `useMemo`.
- `ApiContext` value is `ApiManager` directly (not an object wrapper).
- `useApi()` returns `ApiManager`. Throws if used outside provider — no silent fallback.

### Hooks per endpoint

- One hook per REST call. Named after the action, not the URL: `useGetTopScores`, `useRecordScore`, `useUpdateScore`, `useSyncRoundEvents`, `useConsumeDailyShield`, `useRegisterPlayer`, `useGetMe`, `useRenameNick`, `useUpdatePreferences`, `useMarkTutorialSeen`, `useGetNickAvailability`, `useGetPlayerByCode`, `useListChallenges`, `useGetTodayChallenge`, `useGetChallengeProgress`, `useResetChallengeProgress`, `useCompleteChallenge`, `useListWords`, `useGetWordsChecksum`, `useEnsureLanguageSeeded`.
- Location: `src/hooks/<useHookName>/<useHookName>.ts` (folder per ARCHITECTURE_RULES file structure).
- Hook signature receives user-meaningful args, never `clientId`/`clientRecordId`.
- Internally calls `useApi()` and binds the manager method as `queryFn` / `mutationFn`. Do not import managers directly.

```ts
// useGetTopScores
export const useGetTopScores = (params: GetTopScoresParams) => {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.topScores.byParams(params),
    queryFn: () => api.scores.getTop(params),
  });
};

// useRecordScore
export const useRecordScore = () => {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordScoreInput) => api.scores.record(input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.topScores.all }),
  });
};
```

### Query keys

- All keys live in `src/hooks/queryKeys.ts`. Never inline a `queryKey` in a hook.
- Shape: `["<resource>", "<sub>", ...args]`. Provide both root key (for invalidation) and parameterised builders.
- Mutations invalidate via the root key, not narrow keys, unless invalidation cost is measurable.

### Status codes & errors

- `201` is success on `POST` create endpoints. Do not strict-check `=== 200`.
- `409` from `renameNick` → nick taken. Hook surfaces as typed error so UI can show field-level message.
- `409` from `consumeDailyShield` → shield not available.
- `404` from `getByCode` → return `null` from manager, not throw, when "not found" is a valid product state.

### Migration policy

1. Add new resource manager + hooks targeting `/api/v2/...`. Keep legacy `*Client.ts` untouched.
2. Switch call sites one feature at a time. Delete legacy method only when no callers remain.
3. Player profile mutations: never reintroduce a single `upsertPlayerProfile` call. Route per user action: registration → `register`, rename → `renameNick`, settings → `updatePreferences`, tutorial dismiss → `markTutorialSeen`.
4. DTO types stay in `src/api/<resource>/types.ts`. Reuse — do not duplicate per hook.

### Don'ts

- No `fetch` outside `HttpGateway`.
- No manager imports in components or non-API hooks. Always go through `useApi()`.
- No react-query calls inside managers.
- No per-resource React context. One `ApiContext` only.
- No identity (`clientId`, `clientRecordId`) in hook args.
- No inline query keys.
