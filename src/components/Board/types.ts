import type { BoardCellStatus, GuessResult } from "../../domain/wordle";

export type BoardPropsType = {
  guesses: GuessResult[];
  current: string;
  gameOver: boolean;
  animateEntry?: boolean;
  isLoss?: boolean;
};

export type RowPropsType = {
  letters: string[];
  statuses: BoardCellStatus[];
  isLoss?: boolean;
};

export type Status = BoardCellStatus;

export type TilePropsType = {
  letter?: string;
  status: Status;
  isLoss?: boolean;
};
