import type { FireVisualState } from "./types";

export const sanitizeCounter = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
};

export const getFireVisualState = (streak: number): FireVisualState => {
  const safeStreak = sanitizeCounter(streak);

  if (safeStreak >= 6) {
    return 3;
  }

  if (safeStreak >= 4) {
    return 2;
  }

  if (safeStreak >= 2) {
    return 1;
  }

  return 0;
};

export const clampSize = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 24;
  }

  return Math.min(64, Math.max(12, value));
};
