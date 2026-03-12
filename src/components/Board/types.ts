import type { BoardCellStatus, GuessResult } from "../../domain/wordle";

export type BoardPropsType = {
  guesses: GuessResult[];
  current: string;
  gameOver: boolean;
  animateEntry?: boolean;
};

export type RowPropsType = {
  letters: string[];
  statuses: BoardCellStatus[];
};

export type Status = BoardCellStatus;

export type TilePropsType = {
  letter?: string;
  status: Status;
};
