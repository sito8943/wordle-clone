import type {
  BoardRoundConfig,
  GuessCombo,
  GuessResult,
  WordleModeId,
} from "@domain/wordle";

export type ComboFlash = GuessCombo & {
  pulse: number;
};

export type HardModeTimerSnapshot = {
  sessionId: string;
  secondsLeft: number;
  timerStarted: boolean;
};

export type EndOfGameScoreSummaryItemKey =
  | "base"
  | "difficulty"
  | "streak"
  | "time"
  | "dictionary";

export type EndOfGameScoreSummaryItem = {
  key: EndOfGameScoreSummaryItemKey;
  value: number;
};

export type EndOfGameScoreSummary = {
  items: EndOfGameScoreSummaryItem[];
  total: number;
};

export type EndOfGameSnapshot = {
  answer: string;
  currentStreak: number;
  bestStreak: number;
  challengeBonusPoints: number;
  scoreSummary: EndOfGameScoreSummary | null;
};

export type UsePlayControllerOptions = {
  modeId?: WordleModeId;
  allowSubmitWhenModalOpen?: boolean;
};

export type UseHardModeTimerParams = {
  sessionId: string;
  hardModeEnabled: boolean;
  hasInProgressGameAtMount: boolean;
  boardVersion: number;
  showResumeDialog: boolean;
  pauseTimer?: boolean;
  pauseWhenHidden?: boolean;
  gameOver: boolean;
  guessesLength: number;
  currentLength: number;
  forceLoss: () => void;
  modeId: WordleModeId;
};

export type UseHardModeTimerResult = {
  showHardModeTimer: boolean;
  showHardModeFinalStretchBar: boolean;
  hardModeSecondsLeft: number;
  hardModeTimerStarted: boolean;
  hardModeTickPulse: number;
  hardModeClockBoostScale: number;
  hardModeFinalStretchProgressPercent: number;
  boardShakePulse: number;
  resetHardModeTimer: () => void;
};

export type VictoryBoardShareCaptureSnapshot = {
  answer: string;
  guesses: GuessResult[];
  roundConfig?: Partial<BoardRoundConfig>;
};
