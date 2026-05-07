import { resolveBoardRoundConfig } from "../roundConfig";
import type { BoardRoundConfig, GuessResult } from "../types";
import { BOARD_OVERFLOW_BUFFER_ROWS } from "./constants";
import type { BoardRowModel, BuildBoardRowsOptions } from "./types";

export const buildBoardRows = (
  guesses: GuessResult[],
  current: string,
  gameOver: boolean,
  roundConfig?: Partial<BoardRoundConfig>,
  options: BuildBoardRowsOptions = {},
): BoardRowModel[] => {
  const { maxGuesses, lettersPerRow } = resolveBoardRoundConfig(roundConfig);
  const overflowBufferRows =
    typeof options.overflowBufferRows === "number" &&
    Number.isFinite(options.overflowBufferRows) &&
    options.overflowBufferRows > 0
      ? Math.floor(options.overflowBufferRows)
      : BOARD_OVERFLOW_BUFFER_ROWS;
  const overflowTriggerRemainingRows =
    typeof options.overflowTriggerRemainingRows === "number" &&
    Number.isFinite(options.overflowTriggerRemainingRows) &&
    options.overflowTriggerRemainingRows >= 0
      ? Math.floor(options.overflowTriggerRemainingRows)
      : 0;

  let totalRows = Math.max(maxGuesses, guesses.length);

  if (!gameOver && guesses.length >= maxGuesses) {
    totalRows += overflowBufferRows;
  }

  if (
    !gameOver &&
    overflowTriggerRemainingRows > 0 &&
    overflowBufferRows > 0
  ) {
    while (totalRows - guesses.length <= overflowTriggerRemainingRows) {
      totalRows += overflowBufferRows;
    }
  }

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
