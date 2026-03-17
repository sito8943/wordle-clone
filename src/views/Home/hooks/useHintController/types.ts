import type { PlayerDifficulty } from "@domain/wordle";
import type { HintTileStatus } from "@hooks/useWordle/types";

export type HintUsageSnapshot = {
  answer: string;
  hintsUsed: number;
};

export type UseHintControllerParams = {
  answer: string;
  difficulty: PlayerDifficulty;
  hasInProgressGameAtMount: boolean;
  showResumeDialog: boolean;
  gameOver: boolean;
  currentLength: number;
  revealHint: (hintStatus: HintTileStatus) => boolean;
};

export type UseHintControllerResult = {
  hintsRemaining: number;
  hintsEnabledForDifficulty: boolean;
  hintButtonDisabled: boolean;
  useHint: () => void;
  resetHints: () => void;
};
