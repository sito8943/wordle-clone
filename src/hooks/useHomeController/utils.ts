import type { PlayerDifficulty } from "../../providers/types";
import {
  EASY_MODE_HINT_LIMIT,
  HARD_MODE_FINAL_STRETCH_SECONDS,
  HARD_MODE_HINT_LIMIT,
  HARD_MODE_TOTAL_SECONDS,
  HINT_USAGE_SESSION_STORAGE_KEY,
  NORMAL_MODE_HINT_LIMIT,
} from "./constants";
import type { HardModeTimerSnapshot, HintUsageSnapshot } from "./types";
import type { HintTileStatus } from "../useWordle/types";

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

export const getHintsLimitByDifficulty = (
  difficulty: PlayerDifficulty,
): number => {
  if (difficulty === "easy") {
    return EASY_MODE_HINT_LIMIT;
  }

  if (difficulty === "hard") {
    return HARD_MODE_HINT_LIMIT;
  }

  if (difficulty === "insane") {
    return HARD_MODE_HINT_LIMIT;
  }

  return NORMAL_MODE_HINT_LIMIT;
};

export const getHintStatusByDifficulty = (
  difficulty: PlayerDifficulty,
): HintTileStatus | null => {
  if (difficulty === "easy") {
    return "correct";
  }

  if (difficulty === "normal") {
    return "present";
  }

  return null;
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

const normalizeHintsUsed = (hintsUsed: number): number => {
  if (!Number.isFinite(hintsUsed) || hintsUsed < 0) {
    return 0;
  }

  return Math.floor(hintsUsed);
};

const isHintUsageSnapshot = (value: unknown): value is HintUsageSnapshot => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybe = value as Partial<HintUsageSnapshot>;

  return (
    typeof maybe.sessionId === "string" &&
    typeof maybe.answer === "string" &&
    typeof maybe.hintsUsed === "number"
  );
};

export const getDefaultHintUsageSnapshot = (
  sessionId: string,
  answer: string,
): HintUsageSnapshot => ({
  sessionId,
  answer,
  hintsUsed: 0,
});

export const getInitialHintUsageSnapshot = (
  sessionId: string,
  answer: string,
  hasActiveGame: boolean,
): HintUsageSnapshot => {
  const fallback = getDefaultHintUsageSnapshot(sessionId, answer);

  if (typeof window === "undefined") {
    return fallback;
  }

  if (!hasActiveGame) {
    return fallback;
  }

  try {
    const raw = sessionStorage.getItem(HINT_USAGE_SESSION_STORAGE_KEY);
    if (!raw) {
      return fallback;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isHintUsageSnapshot(parsed)) {
      return fallback;
    }

    if (parsed.sessionId !== sessionId || parsed.answer !== answer) {
      return fallback;
    }

    return {
      ...parsed,
      hintsUsed: normalizeHintsUsed(parsed.hintsUsed),
    };
  } catch {
    return fallback;
  }
};

export const setHintUsageSnapshot = (snapshot: HintUsageSnapshot): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(
      HINT_USAGE_SESSION_STORAGE_KEY,
      JSON.stringify({
        ...snapshot,
        hintsUsed: normalizeHintsUsed(snapshot.hintsUsed),
      }),
    );
  } catch {
    // Ignore storage write errors.
  }
};
