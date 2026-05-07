import { resolveBoardRoundConfig } from "../roundConfig";
import type { BoardRoundConfig, GuessResult } from "../types";
import { BOARD_OVERFLOW_BUFFER_ROWS } from "./constants";
import type { BoardRowModel } from "./types";

export const buildBoardRows = (
  guesses: GuessResult[],
  current: string,
  gameOver: boolean,
  roundConfig?: Partial<BoardRoundConfig>,
): BoardRowModel[] => {
  const { maxGuesses, lettersPerRow } = resolveBoardRoundConfig(roundConfig);
  const totalRows = Math.max(
    maxGuesses,
    gameOver
      ? guesses.length
      : guesses.length >= maxGuesses
        ? guesses.length + BOARD_OVERFLOW_BUFFER_ROWS
        : guesses.length + 1,
  );

  return Array.from({ length: totalRows }, (_, rowIndex) => {
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
