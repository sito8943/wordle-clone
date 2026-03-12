import type { ThemePreference } from "./types";

export const THEME_PREFERENCE_STORAGE_KEY = "wordle:theme-preference";
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";
export const THEME_PREFERENCE_SYNC_EVENT = "wordle:theme-preference:sync";