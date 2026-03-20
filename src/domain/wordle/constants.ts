import type { TileStatus } from "@utils/types";
import type { PlayerDifficulty } from "./player";

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;
export const WORDLE_SESSION_STORAGE_KEY = "wordle:session-id";
export const WORDLE_ANIMATIONS_DISABLED_STORAGE_KEY =
  "wordle:disable-start-animations";
export const WORDLE_START_ANIMATION_SESSION_KEY =
  "wordle:start-animation-session-seen";
export const WORDLE_KEYBOARD_ENTRY_ANIMATION_SESSION_KEY =
  "wordle:keyboard-entry-animation-seen";

export const DIFFICULTY_SCORE_MULTIPLIERS: Record<PlayerDifficulty, number> = {
  easy: 1,
  normal: 2,
  hard: 3,
  insane: 4,
};

export const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
] as const;

export const KEY_STATUS_PRIORITY: TileStatus[] = [
  "correct",
  "present",
  "absent",
];
