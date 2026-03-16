import type { CSSProperties, KeyboardEvent, RefObject } from "react";
import type { GuessResult } from "../../domain/wordle";
import type { Player } from "../../providers/types";
import type { BoardPropsType } from "../../components/Board/types";

export type HomeDialogsProps = {
  message: string;
  showResumeDialog: boolean;
  showRefreshDialog: boolean;
  showWordsDialog: boolean;
  showHelpDialog: boolean;
  showDeveloperConsoleDialog: boolean;
  continuePreviousBoard: () => void;
  startNewBoard: () => void;
  cancelRefreshBoard: () => void;
  confirmRefreshBoard: () => void;
  wordListButtonEnabled: boolean;
  dictionaryWords: string[];
  closeWordsDialog: () => void;
  closeHelpDialog: () => void;
  developerConsoleEnabled: boolean;
  player: Player;
  closeDeveloperConsoleDialog: () => void;
  submitDeveloperPlayer: (nextPlayer: Partial<Player>) => void;
};

export type HomeToolbarProps = {
  currentWinStreak: number;
  wordListButtonEnabled: boolean;
  dictionaryLoading: boolean;
  dictionaryWordsCount: number;
  openWordsDialog: () => void;
  hintsEnabledForDifficulty: boolean;
  useHint: () => void;
  hintButtonDisabled: boolean;
  hintsRemaining: number;
  openHelpDialog: () => void;
  developerConsoleEnabled: boolean;
  openDeveloperConsoleDialog: () => void;
  showHardModeTimer: boolean;
  hardModeSecondsLeft: number;
  hardModeTickPulse: number;
  hardModeClockBoostScale: number;
  refreshBoard: () => void;
  dictionaryError: string | null;
};

export type HomeBoardSectionProps = {
  guesses: GuessResult[];
  current: string;
  gameOver: boolean;
  won: boolean;
  answer: string;
  startAnimationSeed: number;
  startAnimationsEnabled: boolean;
  boardShakePulse: number;
  showHardModeFinalStretchBar: boolean;
  hardModeSecondsLeft: number;
  hardModeFinalStretchProgressPercent: number;
  animateTileEntry: boolean;
  activeRowHintStatuses: BoardPropsType["activeRowHintStatuses"];
  hintRevealPulse: number;
  hintRevealTileIndex: number | null;
};

export type HomeKeyboardSectionProps = {
  preferNativeKeyboard: boolean;
  guesses: GuessResult[];
  handleKey: (key: string) => void;
  gameOver: boolean;
  won: boolean;
  keyboardEntryAnimationEnabled: boolean;
  showResumeDialog: boolean;
};

export type UseNativeKeyboardInputParams = {
  enabled: boolean;
  blocked: boolean;
  onKey: (key: string) => void;
};

export type UseNativeKeyboardInputResult = {
  nativeKeyboardInputRef: RefObject<HTMLInputElement | null>;
  focusNativeKeyboardInput: () => void;
  handleNativeKeyboardKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleNativeKeyboardInput: () => void;
};

export type NativeKeyboardClockStyle = CSSProperties;
