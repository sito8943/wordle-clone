import { DIFFICULTY_SCORE_MULTIPLIERS, MAX_GUESSES } from "./constants";
import type { PlayerDifficulty } from "./player";
import { isValidWord } from "@utils/words";

export const NORMAL_DICTIONARY_ROW_BONUS = 0.4;

const roundScoreToSingleDecimal = (value: number): number =>
  Math.round(value * 10) / 10;

export const getPointsForWin = (guessesUsed: number): number =>
  Math.max(0, MAX_GUESSES - guessesUsed + 1);

const toSafeDifficultyMultiplier = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }

  return value;
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

const normalizeGuessWord = (word: string): string => word.trim().toLowerCase();

const isNormalDictionaryBonusRow = (
  guess: string,
  normalizedAnswer: string,
): boolean => {
  const normalizedGuess = normalizeGuessWord(guess);

  if (normalizedGuess.length === 0 || normalizedGuess === normalizedAnswer) {
    return false;
  }

  return isValidWord(normalizedGuess);
};

export const getNormalDictionaryBonusRowFlags = (
  guesses: string[],
  answer: string,
): boolean[] => {
  const normalizedAnswer = normalizeGuessWord(answer);

  return guesses.map((guess) =>
    isNormalDictionaryBonusRow(guess, normalizedAnswer),
  );
};

export const getNormalDictionaryRowsBonusPoints = (
  guesses: string[],
  answer: string,
  perRowBonus = NORMAL_DICTIONARY_ROW_BONUS,
): number => {
  const safePerRowBonus = toSafeDictionaryRowBonus(perRowBonus);

  if (safePerRowBonus === 0) {
    return 0;
  }

  const validNonAnswerRows = getNormalDictionaryBonusRowFlags(
    guesses,
    answer,
  ).filter(Boolean).length;

  return roundScoreToSingleDecimal(validNonAnswerRows * safePerRowBonus);
};
