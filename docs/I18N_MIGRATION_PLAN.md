# i18n Migration Plan

## Objective

Replace user-facing text constants and inline literal strings with a centralized internationalization setup based on `i18next` and `react-i18next`.

This repository is a React + Vite app, not a Next.js app, so the correct React integration is `react-i18next`.

## Library Decision

- Use `i18next` as the translation engine.
- Use `react-i18next` as the React binding.
- Do not use `next-i18next` or "react-next i18n" in this project, because those are for Next.js-oriented setups, not a plain React + Vite app.

## Scope

Migrate only user-facing copy:

- page titles
- button labels
- dialog titles and descriptions
- form labels and placeholders
- alerts and status messages
- aria labels and other accessibility text
- error and fallback messages shown to users

Do not migrate technical constants:

- storage keys
- query names
- mutation names
- DOM ids
- test ids
- class names
- timing values
- game/domain constants such as word length or guesses

## Architecture Rules

- Keep business logic in `src/domain/wordle/*`.
- Keep orchestration in controller hooks.
- Keep presentational components focused on rendering.
- Do not move translation concerns into domain logic.
- Prefer resolving translations in views, layouts, shared UI, or controller output models.
- If a controller currently returns final display text, refactor it to return semantic state or translation keys instead of hardcoded user copy.

## Current Findings

The codebase currently has two types of text debt:

1. User-facing text extracted into `constants.ts` files.
2. Inline literal strings still present in components, layouts, and route views.

Examples already identified:

- `src/views/Profile/constants.ts`
- `src/views/Home/constants.ts`
- `src/views/Home/components/Dialogs/RefreshConfirmationDialog/constants.ts`
- `src/views/Home/components/Dialogs/SessionResumeDialog/constants.ts`
- `src/views/Scoreboard/Scoreboard.tsx`
- `src/views/NotFound.tsx`
- `src/main.tsx`

This means the migration should cover both:

- replacing text constants with translation keys
- removing remaining inline literal UI strings

## Proposed Implementation

### 1. Install dependencies

Add:

- `i18next`
- `react-i18next`
- `i18next-browser-languagedetector`

### 2. Add i18n bootstrap

Create a dedicated setup module, for example:

- `src/i18n/index.ts`

Responsibilities:

- initialize `i18next`
- register `react-i18next`
- configure default language
- configure fallback language
- load namespaces/resources
- optionally detect browser language

Import this setup from:

- `src/main.tsx`

The initialization should happen before rendering the app.

### 3. Define translation resource structure

Do not keep everything in one flat file. Use namespaces aligned with the app structure.

Proposed namespaces:

- `common`
- `dialogs`
- `home`
- `profile`
- `scoreboard`
- `errors`

Suggested resource layout:

```text
src/i18n/
  index.ts
  locales/
    en/
      common.json
      dialogs.json
      home.json
      profile.json
      scoreboard.json
      errors.json
    es/
      common.json
      dialogs.json
      home.json
      profile.json
      scoreboard.json
      errors.json
```

### 4. Establish translation key naming rules

Use stable, semantic keys instead of English text as keys.

Examples:

- `profile.pageTitle`
- `profile.recovery.inputLabel`
- `profile.recovery.successMessage`
- `home.refreshDialog.title`
- `home.refreshDialog.confirmAction`
- `scoreboard.pageTitle`
- `errors.scoreboard.loadFailed`

Rules:

- key names should reflect UI meaning, not wording
- avoid embedding implementation details in keys
- prefer consistency across modules

### 5. Migrate shared and shell-level UI first

Start with the widest-impact UI:

- app-level error fallback in `src/main.tsx`
- shared dialog shell close label
- shared alerts and fallback messages
- layout navbar/footer/initial player dialog
- route-independent accessibility labels

Reason:

- this gives coverage across the full app early
- it validates the provider/bootstrap approach before feature migration

### 6. Migrate feature modules incrementally

Recommended order:

1. `Home`
2. `Profile`
3. `Scoreboard`
4. `NotFound`

For each feature:

- replace user-facing text constants with `t(...)`
- replace inline JSX literals with `t(...)`
- move option labels into translation resources
- move dialog content into translation resources
- move fallback and alert strings into translation resources

### 7. Keep constants files only for technical values

After migration, `constants.ts` files should keep only non-copy values such as:

- ids
- durations
- thresholds
- style mappings
- feature flags

If a `constants.ts` file exists only to hold visible text, remove or simplify it after migration.

### 8. Handle dynamic text patterns explicitly

Define conventions for:

- interpolation
- plurals
- lists
- formatted values

Examples:

- countdown text
- score and streak labels
- difficulty summaries
- recovery success/failure messages

Use i18next interpolation instead of string concatenation where the output is user-facing.

### 9. Keep translation decisions out of domain

Do not translate inside:

- `src/domain/wordle/*`

If domain or controller logic needs to communicate a state, return:

- a semantic enum
- a status code
- or a translation key plus interpolation params

Views should remain the main place where `t(...)` is called for user-visible text.

### 10. Testing strategy

Update test utilities to provide i18n context.

Recommended work:

- extend `src/test/utils.tsx` with an i18n-aware render helper
- use a minimal test i18n instance for stable tests
- update assertions that currently rely on old hardcoded copy
- add or update tests whenever behavior changes

Focus especially on:

- dialogs
- alerts
- accessibility labels
- form labels
- route headings

### 11. Add safeguards to avoid regressions

Add one or more of these guardrails:

- ESLint rule or convention for blocking new literal UI strings in JSX
- team rule: all new visible copy must come from i18n
- documentation in project docs or `AGENTS.md`

This should be introduced after the initial infrastructure is stable, otherwise it will create noise during migration.

## Rollout Plan

### Phase 1: Foundation

- install `i18next` and `react-i18next`
- create `src/i18n/index.ts`
- wire initialization in `src/main.tsx`
- add initial `en` resources
- add test render helper with i18n provider
- migrate global/shared texts first

### Phase 2: Feature Migration

- migrate `Home`
- migrate `Profile`
- migrate `Scoreboard`
- migrate `NotFound`
- clean obsolete text-only constants

### Phase 3: Hardening

- add `es` translations if needed
- add linting or review guardrails
- document namespace/key conventions
- verify no user-visible text remains outside i18n except explicitly approved cases

## Suggested File-by-File Migration Targets

Initial high-value files:

- `src/main.tsx`
- `src/views/NotFound.tsx`
- `src/views/Scoreboard/Scoreboard.tsx`
- `src/views/Profile/constants.ts`
- `src/views/Home/constants.ts`
- `src/layouts/View/components/InitialPlayerDialog/InitialPlayerDialog.tsx`
- `src/components/Dialogs/Dialog/Dialog.tsx`

Then continue through feature dialogs and sections:

- `src/views/Home/components/Dialogs/*`
- `src/views/Home/sections/*`
- `src/views/Profile/sections/*`
- shared UI components with visible copy

## Risks

- Mixing translation logic into domain or persistence layers.
- Migrating technical constants that should remain constants.
- Breaking tests that assert literal English strings.
- Using unstable translation keys derived from current wording.
- Leaving accessibility labels untranslated while visible labels are migrated.

## Definition of Done

The migration is complete when:

- all user-visible copy is served through `i18next` and `react-i18next`
- no copy-only `constants.ts` files remain without a reason
- domain logic stays translation-agnostic
- touched tests pass with i18n enabled
- lint/typecheck remain clean
- documentation reflects the new translation approach
