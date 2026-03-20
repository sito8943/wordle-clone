import { DIFFICULTY_SCORE_MULTIPLIERS, MAX_GUESSES } from "./constants";
import type { PlayerDifficulty } from "./player";

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

export const getInsaneTimeBonus = (secondsLeft: number): number => {
  if (!Number.isFinite(secondsLeft) || secondsLeft <= 1) {
    return 0;
  }

  return Math.max(0, Math.floor(secondsLeft / 2));
};

export const getDifficultyScoreMultiplier = (
  difficulty: PlayerDifficulty,
): number => DIFFICULTY_SCORE_MULTIPLIERS[difficulty];

const toSafeTimeBonus = (value: number): number => {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.floor(value);
};

export const getTotalPointsForWin = (
  guessesUsed: number,
  difficultyMultiplier: number,
  streakBonus: number,
  timeBonus = 0,
): number =>
  getPointsForWin(guessesUsed) *
  toSafeDifficultyMultiplier(difficultyMultiplier) +
  toSafeStreakBonus(streakBonus) +
  toSafeTimeBonus(timeBonus);
