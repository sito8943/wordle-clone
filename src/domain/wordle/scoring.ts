import { DIFFICULTY_SCORE_MULTIPLIERS, MAX_GUESSES } from "./constants";
import type { PlayerDifficulty } from "./player";
import { isValidWord } from "@utils/words";

export const NORMAL_DICTIONARY_ROW_BONUS = 0.4;

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

const toSafeDictionaryRowBonus = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return value;
};

export const getStreakScoreMultiplier = (streak: number): number => {
  const safeStreak = toSafeStreakBonus(streak);

  return 1 + 0.3 * Math.sqrt(safeStreak);
};

export const getBaseScoreForWin = (
  guessesUsed: number,
  difficultyMultiplier: number,
  timeBonus = 0,
): number =>
  getPointsForWin(guessesUsed) *
    toSafeDifficultyMultiplier(difficultyMultiplier) +
  toSafeTimeBonus(timeBonus);

export const getTotalPointsForWin = (
  guessesUsed: number,
  difficultyMultiplier: number,
  streak: number,
  timeBonus = 0,
): number =>
  Math.round(
    getBaseScoreForWin(guessesUsed, difficultyMultiplier, timeBonus) *
      getStreakScoreMultiplier(streak),
  );

export const getNormalDictionaryRowsBonusPoints = (
  guesses: string[],
  answer: string,
  perRowBonus = NORMAL_DICTIONARY_ROW_BONUS,
): number => {
  const safePerRowBonus = toSafeDictionaryRowBonus(perRowBonus);

  if (safePerRowBonus === 0) {
    return 0;
  }

  const normalizedAnswer = answer.trim().toLowerCase();
  const validNonAnswerRows = guesses.reduce((count, guess) => {
    const normalizedGuess = guess.trim().toLowerCase();

    if (normalizedGuess.length === 0 || normalizedGuess === normalizedAnswer) {
      return count;
    }

    return isValidWord(normalizedGuess) ? count + 1 : count;
  }, 0);

  return Math.round(validNonAnswerRows * safePerRowBonus);
};
