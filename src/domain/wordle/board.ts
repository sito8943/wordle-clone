import type { GuessResult } from "./types";

export type BoardCellStatus =
  | "correct"
  | "present"
  | "absent"
  | "empty"
  | "tbd";

export type BoardRowModel = {
  letters: string[];
  statuses: BoardCellStatus[];
};

const BOARD_ROWS = 6;
const BOARD_COLUMNS = 5;

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
