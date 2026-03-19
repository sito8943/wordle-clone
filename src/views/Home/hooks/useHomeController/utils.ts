import type { PlayerDifficulty } from "@domain/wordle";
import {
  END_OF_GAME_DIALOG_SEEN_SESSION_STORAGE_KEY,
  HARD_MODE_FINAL_STRETCH_SECONDS,
  HARD_MODE_TOTAL_SECONDS,
} from "./constants";
import type { HardModeTimerSnapshot } from "./types";

let hardModeTimerSnapshot: HardModeTimerSnapshot | null = null;

export const getDifficultyScoreMultiplier = (
  difficulty: PlayerDifficulty,
): number => {
  if (difficulty === "easy") {
    return 1;
  }

  if (difficulty === "insane") {
    return 4;
  }

  if (difficulty === "hard") {
    return 3;
  }

  return 2;
};

export const getHardModeClockBoostScale = (secondsLeft: number): number => {
  if (secondsLeft <= HARD_MODE_FINAL_STRETCH_SECONDS) {
    return 0.28;
  }

  if (secondsLeft <= 30) {
    return 0.2;
  }

  if (secondsLeft <= 45) {
    return 0.14;
  }

  return 0.1;
};

export const getHardModeFinalStretchProgressPercent = (
  secondsLeft: number,
): number =>
  Math.max(
    0,
    Math.min(100, (secondsLeft / HARD_MODE_FINAL_STRETCH_SECONDS) * 100),
  );

export const isWithinHardModeFinalStretch = (secondsLeft: number): boolean =>
  secondsLeft <= HARD_MODE_FINAL_STRETCH_SECONDS &&
  secondsLeft <= HARD_MODE_TOTAL_SECONDS;

export const getDefaultHardModeTimerSnapshot = (
  sessionId: string,
): HardModeTimerSnapshot => ({
  sessionId,
  secondsLeft: HARD_MODE_TOTAL_SECONDS,
  timerStarted: false,
});

export const getInitialHardModeTimerSnapshot = (
  sessionId: string,
  hardModeEnabled: boolean,
  hasActiveGame: boolean,
): HardModeTimerSnapshot => {
  if (
    hardModeEnabled &&
    hasActiveGame &&
    hardModeTimerSnapshot &&
    hardModeTimerSnapshot.sessionId === sessionId
  ) {
    return hardModeTimerSnapshot;
  }

  return getDefaultHardModeTimerSnapshot(sessionId);
};

export const clearHardModeTimerSnapshot = (): void => {
  hardModeTimerSnapshot = null;
};

export const setHardModeTimerSnapshot = (
  snapshot: HardModeTimerSnapshot,
): void => {
  hardModeTimerSnapshot = snapshot;
};

export const hasSeenEndOfGameDialogInSession = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.sessionStorage.getItem(
      END_OF_GAME_DIALOG_SEEN_SESSION_STORAGE_KEY,
    ) === "seen"
  );
};

export const markEndOfGameDialogAsSeenInSession = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    END_OF_GAME_DIALOG_SEEN_SESSION_STORAGE_KEY,
    "seen",
  );
};
