import type { TileStatus } from "@utils/types";
import { KEY_STATUS_PRIORITY } from "./constants";
import type { GuessResult } from "./types";

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
        KEY_STATUS_PRIORITY.indexOf(next) <
          KEY_STATUS_PRIORITY.indexOf(previous)
      ) {
        result[letter] = next;
      }
    });
  }

  return result;
};
