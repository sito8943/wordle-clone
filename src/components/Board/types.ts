import type { BoardCellStatus, GuessResult } from "../../domain/wordle";

export type BoardPropsType = {
  guesses: GuessResult[];
  current: string;
  gameOver: boolean;
  animateEntry?: boolean;
  animateTileEntry?: boolean;
  isLoss?: boolean;
};

export type RowPropsType = {
  letters: string[];
  statuses: BoardCellStatus[];
  startTileIndex?: number;
  activeTileIndex?: number | null;
  isPastRow?: boolean;
  isActiveRow?: boolean;
  animateTileEntry?: boolean;
  isLoss?: boolean;
};

export type Status = BoardCellStatus;

export type TilePropsType = {
  letter?: string;
  status: Status;
  animationOrder?: number;
  animateEntry?: boolean;
  isActive?: boolean;
  isLoss?: boolean;
};
