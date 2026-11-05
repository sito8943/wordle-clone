import type { ROUTES } from "@config/routes";

/** App id in sito-feature-usage. */
export const FEATURE_USAGE_APP = "wordle";

/**
 * Catalogue sent to sito-feature-usage: every screen of the game, so the
 * ones nobody opens show up. Dotted slugs; only these names are ever sent.
 * Pages are `page.<ROUTES key in snake_case>` (see `toPageFeature`).
 */
export const WORDLE_FEATURES = [
  "page.home",
  "page.play",
  "page.classic",
  "page.zen",
  "page.lighting",
  "page.daily",
  "page.changelog",
  "page.help",
  "page.scoreboard",
  "page.settings",
  "page.profile",
] as const;

/** `ROUTES` keys that are not screens: catch-alls. */
export const NON_FEATURE_ROUTE_KEYS: readonly (keyof typeof ROUTES)[] = [
  "NOT_FOUND",
];
