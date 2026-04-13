import type { usePlayController } from "@views/Play/hooks";

type PlayControllerState = ReturnType<typeof usePlayController>;

export type BoardContentProps = Pick<
  PlayControllerState,
  | "guesses"
  | "current"
  | "gameOver"
  | "won"
  | "showLegacyEndOfGameMessage"
  | "startAnimationSeed"
  | "startAnimationsEnabled"
  | "boardShakePulse"
  | "activeRowHintStatuses"
  | "hintRevealPulse"
  | "hintRevealTileIndex"
  | "comboFlash"
  | "normalDictionaryBonusRowFlags"
  | "activeTileIndex"
  | "selectActiveTile"
  | "manualTileSelection"
> & {
  animateTileEntry: boolean;
  answer: string;
};

export type HardModeProgressProps = Pick<
  PlayControllerState,
  | "showHardModeFinalStretchBar"
  | "hardModeSecondsLeft"
  | "hardModeFinalStretchProgressPercent"
>;
