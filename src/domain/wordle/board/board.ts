import type { GuessResult } from "../types";
import { BOARD_ROWS, BOARD_COLUMNS } from "./constant";
import type { BoardRowModel } from "./types";

export const buildBoardRows = (
  guesses: GuessResult[],
  current: string,
  gameOver: boolean,
): BoardRowModel[] =>
  Array.from({ length: BOARD_ROWS }, (_, rowIndex) => {
    if (rowIndex < guesses.length) {
      return {
        letters: guesses[rowIndex].word.split(""),
        statuses: guesses[rowIndex].statuses,
      };
    }

    if (rowIndex === guesses.length && !gameOver) {
      return {
        letters: Array.from(
          { length: BOARD_COLUMNS },
          (_, cellIndex) => current[cellIndex] ?? "",
        ),
        statuses: Array.from({ length: BOARD_COLUMNS }, (_, cellIndex) =>
          current[cellIndex] ? "tbd" : "empty",
        ),
      };
    }

    return {
      letters: Array.from({ length: BOARD_COLUMNS }, () => ""),
      statuses: Array.from({ length: BOARD_COLUMNS }, () => "empty"),
    };
  });
