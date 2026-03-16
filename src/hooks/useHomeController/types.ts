export type HardModeTimerSnapshot = {
  sessionId: string;
  secondsLeft: number;
  timerStarted: boolean;
};

export type HintUsageSnapshot = {
  sessionId: string;
  answer: string;
  hintsUsed: number;
};
