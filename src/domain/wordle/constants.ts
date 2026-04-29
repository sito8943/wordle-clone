import type { TileStatus } from "@utils/types";
import type { PlayerDifficulty, PlayerLanguage } from "./player";

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;
export const WORDLE_SESSION_STORAGE_KEY = "wordle:session-id";
export const WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY =
  "wordle:disable-start-animations";
export const WORDLE_START_ANIMATION_SESSION_KEY =
  "wordle:start-animation-session-seen";
export const WORDLE_KEYBOARD_ENTRY_ANIMATION_SESSION_KEY =
  "wordle:keyboard-entry-animation-seen";
export const HOME_MENU_SEEN_SESSION_STORAGE_KEY = "wordle:home-menu-seen";
export const MIN_ROUND_DURATION_FOR_SCORE_COMMIT_MS = 5000;

export const DIFFICULTY_SCORE_MULTIPLIERS: Record<PlayerDifficulty, number> = {
  easy: 1,
  normal: 2,
  hard: 5,
  insane: 7,
};

export const SCORE_DECIMAL_FACTOR = 10;
export const STREAK_MODIFIER = 0.3;
export const LIGHTNING_SECONDS_BONUS = 4;
export const NORMAL_DICTIONARY_ROW_BONUS = 0.4;
export const MAX_STREAK_FOR_SCORE_MULTIPLIER = 100;

export const KEYBOARD_ROWS_ES = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getKeyboardRows = (_language: PlayerLanguage) => KEYBOARD_ROWS_ES;

export const KEY_STATUS_PRIORITY: TileStatus[] = [
  "correct",
  "present",
  "absent",
];

export const DAILY_WORD_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const DAILY_WORD_FALLBACK = "PERRO";
export const DAILY_MODE_STATUS_STORAGE_KEY_PREFIX = "wordle:daily-mode-status";
export const DAILY_SHIELD_USED_STORAGE_KEY_PREFIX = "wordle:daily-shield-used";
