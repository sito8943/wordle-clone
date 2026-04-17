import { resolveBoardRoundConfig } from "../roundConfig";
import type { BoardRoundConfig, GuessResult } from "../types";
import type { BoardRowModel } from "./types";

export const buildBoardRows = (
  guesses: GuessResult[],
  current: string,
  gameOver: boolean,
  roundConfig?: Partial<BoardRoundConfig>,
): BoardRowModel[] => {
  const { maxGuesses, lettersPerRow } = resolveBoardRoundConfig(roundConfig);

  return Array.from({ length: maxGuesses }, (_, rowIndex) => {
    if (rowIndex < guesses.length) {
      return {
        letters: guesses[rowIndex].word.split(""),
        statuses: guesses[rowIndex].statuses,
      };
    }

    if (rowIndex === guesses.length && !gameOver) {
      return {
        letters: Array.from(
          { length: lettersPerRow },
          (_, cellIndex) => current[cellIndex]?.trim() || "",
        ),
        statuses: Array.from({ length: lettersPerRow }, (_, cellIndex) =>
          current[cellIndex]?.trim() ? "tbd" : "empty",
        ),
      };
    }

    return {
      letters: Array.from({ length: lettersPerRow }, () => ""),
      statuses: Array.from({ length: lettersPerRow }, () => "empty"),
    };
  });
};
