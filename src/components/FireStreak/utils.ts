export const sanitizeCounter = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
};

export type FireVisualState = 0 | 1 | 2 | 3;

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
