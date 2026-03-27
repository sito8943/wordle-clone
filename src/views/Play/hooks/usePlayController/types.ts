export type HardModeTimerSnapshot = {
  sessionId: string;
  secondsLeft: number;
  timerStarted: boolean;
};

export type EndOfGameScoreSummaryItemKey =
  | "base"
  | "difficulty"
  | "streak"
  | "time";

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
  scoreSummary: EndOfGameScoreSummary | null;
};

export type UseHardModeTimerParams = {
  sessionId: string;
  hardModeEnabled: boolean;
  hasInProgressGameAtMount: boolean;
  boardVersion: number;
  showResumeDialog: boolean;
  gameOver: boolean;
  guessesLength: number;
  currentLength: number;
  forceLoss: () => void;
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
