import type { GuessResult } from "../../hooks/useWordle";
import type { TileStatus } from "../../utils/checker";

export type BoardPropsType = {
  guesses: GuessResult[];
  current: string;
  gameOver: boolean;
};

export type RowPropsType = {
  word?: string;
  statuses?: TileStatus[];
  current?: string;
};

export type Status = TileStatus | "empty" | "tbd";

export type TilePropsType = {
  letter?: string;
  status: Status;
};
