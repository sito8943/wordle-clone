import type { Status } from "./types";

export const STATUS_STYLE: Record<Status, string> = {
  empty:
    "border-neutral-300 bg-white text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100",
  tbd: "border-neutral-400 bg-neutral-100 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100",
  correct: "border-green-500 bg-green-700 text-white",
  present: "border-yellow-500 bg-yellow-500 text-black",
  absent: "border-neutral-700 bg-neutral-700 text-white",
};

export const STATUS_LABEL: Record<Status, string> = {
  empty: "empty",
  tbd: "typing",
  correct: "correct",
  present: "present",
  absent: "absent",
};

export const TILE_ENTRY_STAGGER_MS = 16;
export const BOARD_SHAKE_DURATION_MS = 220;
