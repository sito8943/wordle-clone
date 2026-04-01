import type { Player } from "@domain/wordle";
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

export type ToolbarProps = Pick<
  PlayControllerState,
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

export type BoardSectionProps = {
  board: BoardContentProps;
  hardModeProgress: HardModeProgressProps;
};

export type KeyboardSectionProps = Pick<
  PlayControllerState,
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
  PlayControllerState,
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
