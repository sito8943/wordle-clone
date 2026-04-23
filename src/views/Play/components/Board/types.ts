import type {
  BoardCellStatus,
  BoardRoundConfig,
  GuessResult,
} from "@domain/wordle";

export type BoardPropsType = {
  guesses: GuessResult[];
  current: string;
  gameOver: boolean;
  roundConfig?: Partial<BoardRoundConfig>;
  animateEntry?: boolean;
  animateTileEntry?: boolean;
  shakePulse?: number;
  activeRowHintStatuses?: Partial<Record<number, HintTileStatus>>;
  hintRevealPulse?: number;
  hintRevealTileIndex?: number | null;
  comboFlash?: ComboFlash | null;
  normalDictionaryBonusRowFlags?: boolean[];
  activeTileIndex?: number | null;
  onTileSelect?: (index: number) => void;
};

export type RowPropsType = {
  row: BoardRowViewModel;
  normalDictionaryBonusTooltip?: string;
};

export type BoardRowViewModel = {
  key: number;
  tiles: TileViewModel[];
  isPastRow: boolean;
  isActiveRow: boolean;
  showNormalDictionaryBonusIndicator: boolean;
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
  tile: TileViewModel;
};

export type TileViewModel = {
  key: number;
  letter?: string;
  status: Status;
  animationOrder: number;
  animateEntry: boolean;
  isActive: boolean;
  onClick?: (key: number) => void;
  isHintReveal: boolean;
  hintRevealPulse: number;
};

export type UseBoardControllerParams = Pick<
  BoardPropsType,
  | "guesses"
  | "current"
  | "gameOver"
  | "roundConfig"
  | "animateTileEntry"
  | "shakePulse"
  | "hintRevealPulse"
  | "activeRowHintStatuses"
  | "hintRevealTileIndex"
  | "normalDictionaryBonusRowFlags"
  | "activeTileIndex"
  | "onTileSelect"
>;
