export type HardModeTimerSnapshot = {
  sessionId: string;
  secondsLeft: number;
  timerStarted: boolean;
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
