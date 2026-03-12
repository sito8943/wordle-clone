import type { TileStatus } from "../../utils/checker";
import type { GuessResult } from "./types";

export const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
] as const;

const STATUS_PRIORITY: TileStatus[] = ["correct", "present", "absent"];

export const getKeyStatuses = (
  guesses: GuessResult[],
): Record<string, TileStatus> => {
  const result: Record<string, TileStatus> = {};

  for (const { word, statuses } of guesses) {
    word.split("").forEach((letter, index) => {
      const previous = result[letter];
      const next = statuses[index];

      if (
        !previous ||
        STATUS_PRIORITY.indexOf(next) < STATUS_PRIORITY.indexOf(previous)
      ) {
        result[letter] = next;
      }
    });
  }

  return result;
};
