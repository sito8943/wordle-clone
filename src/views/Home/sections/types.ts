import type { Player } from "@domain/wordle";
import type { CSSProperties } from "react";
import type { useHomeController } from "../hooks/useHomeController";

export type NativeKeyboardClockStyle = CSSProperties;

type HomeControllerState = ReturnType<typeof useHomeController>;

export type ToolbarTimerProps = Pick<
  HomeControllerState,
  "showHardModeTimer" | "hardModeSecondsLeft" | "hardModeTickPulse"
> & {
  hardModeClockBoostScale: number;
};

export type ToolbarProps = Pick<
  HomeControllerState,
  | "currentWinStreak"
  | "dictionaryLoading"
  | "dictionaryWords"
  | "openWordsDialog"
  | "hintsEnabledForDifficulty"
  | "useHint"
  | "hintButtonDisabled"
  | "hintsRemaining"
  | "openHelpDialog"
  | "openDeveloperConsoleDialog"
  | "showRefreshAttention"
  | "refreshAttentionPulse"
  | "refreshAttentionScale"
  | "refreshBoard"
  | "dictionaryError"
> & {
  wordListButtonEnabled: boolean;
  developerConsoleEnabled: boolean;
  timer: ToolbarTimerProps;
};

export type BoardContentProps = Pick<
  HomeControllerState,
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
> & {
  animateTileEntry: boolean;
  answer: string;
};

export type HardModeProgressProps = Pick<
  HomeControllerState,
  | "showHardModeFinalStretchBar"
  | "hardModeSecondsLeft"
  | "hardModeFinalStretchProgressPercent"
>;

export type BoardSectionProps = {
  board: BoardContentProps;
  hardModeProgress: HardModeProgressProps;
};

export type KeyboardSectionProps = Pick<
  HomeControllerState,
  | "guesses"
  | "current"
  | "handleKey"
  | "gameOver"
  | "won"
  | "keyboardEntryAnimationEnabled"
  | "showResumeDialog"
> & {
  preferNativeKeyboard: boolean;
};

export type DialogsSectionProps = Pick<
  HomeControllerState,
  | "message"
  | "showResumeDialog"
  | "showRefreshDialog"
  | "showWordsDialog"
  | "showHelpDialog"
  | "showDeveloperConsoleDialog"
  | "showVictoryDialog"
  | "showDefeatDialog"
  | "showEndOfGameSettingsHint"
  | "endOfGameAnswer"
  | "victoryScoreSummary"
  | "endOfGameCurrentStreak"
  | "endOfGameBestStreak"
  | "continuePreviousBoard"
  | "startNewBoard"
  | "closeEndOfGameDialog"
  | "cancelRefreshBoard"
  | "confirmRefreshBoard"
  | "dictionaryWords"
  | "currentLanguage"
  | "closeWordsDialog"
  | "closeHelpDialog"
  | "closeDeveloperConsoleDialog"
  | "submitDeveloperPlayer"
  | "refreshRemoteDictionaryChecksum"
  | "isRefreshingDictionaryChecksum"
  | "dictionaryChecksumMessage"
  | "dictionaryChecksumMessageKind"
> & {
  wordListButtonEnabled: boolean;
  developerConsoleEnabled: boolean;
  player: Player;
};
