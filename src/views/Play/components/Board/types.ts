import type { BoardCellStatus, GuessResult } from "@domain/wordle";

export type BoardPropsType = {
  guesses: GuessResult[];
  current: string;
  gameOver: boolean;
  animateEntry?: boolean;
  animateTileEntry?: boolean;
  isLoss?: boolean;
  shakePulse?: number;
  activeRowHintStatuses?: Partial<Record<number, HintTileStatus>>;
  hintRevealPulse?: number;
  hintRevealTileIndex?: number | null;
  comboFlash?: ComboFlash | null;
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
  hintRevealPulse?: number;
  hintRevealTileIndex?: number | null;
};

export type BoardRowViewModel = {
  key: number;
  letters: string[];
  statuses: BoardCellStatus[];
  startTileIndex: number;
  activeTileIndex: number | null;
  isPastRow: boolean;
  isActiveRow: boolean;
  hintRevealTileIndex: number | null;
};

export type Status = BoardCellStatus;
export type HintTileStatus = Extract<Status, "correct" | "present">;
export type ComboFlashTone = HintTileStatus;

export type ComboFlash = {
  count: number;
  tone: ComboFlashTone;
  pulse: number;
};

export type TilePropsType = {
  letter?: string;
  status: Status;
  animationOrder?: number;
  animateEntry?: boolean;
  isActive?: boolean;
  isLoss?: boolean;
  isHintReveal?: boolean;
  hintRevealPulse?: number;
};
