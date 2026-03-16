import { MAX_GUESSES } from "./constants";

export const getPointsForWin = (guessesUsed: number): number =>
  Math.max(0, MAX_GUESSES - guessesUsed + 1);

const toSafeDifficultyMultiplier = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }

  return Math.floor(value);
};

const toSafeStreakBonus = (value: number): number => {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.floor(value);
};

export const getTotalPointsForWin = (
  guessesUsed: number,
  difficultyMultiplier: number,
  streakBonus: number,
): number =>
  getPointsForWin(guessesUsed) +
  toSafeDifficultyMultiplier(difficultyMultiplier) +
  toSafeStreakBonus(streakBonus);
