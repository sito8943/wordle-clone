import type { CSSProperties } from "react";
import type { usePlayController } from "../hooks/usePlayController";

export type NativeKeyboardClockStyle = CSSProperties;

type PlayControllerState = ReturnType<typeof usePlayController>;

export type ToolbarTimerProps = Pick<
  PlayControllerState,
  "showHardModeTimer" | "hardModeSecondsLeft" | "hardModeTickPulse"
> & {
  hardModeClockBoostScale: number;
};

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
