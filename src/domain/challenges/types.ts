import type { GuessResult } from "../wordle/types";
import type { PlayerDifficulty } from "../wordle/player";
import { CHALLENGE_CONDITION_KEYS } from "./constants";

export type ChallengeType = "simple" | "complex" | "weekly";

export type ChallengeConditionKey =
  (typeof CHALLENGE_CONDITION_KEYS)[keyof typeof CHALLENGE_CONDITION_KEYS];

export type Challenge = {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  conditionKey: ChallengeConditionKey;
};

export type DailyChallenges = {
  date: string;
  simple: Challenge;
  complex: Challenge;
};

export type ChallengeProgress = {
  challengeId: string;
  completed: boolean;
  completedAt?: number;
  pointsAwarded: number;
};

export type ChallengeConditionContext = {
  guesses: GuessResult[];
  gameOver: boolean;
  won: boolean;
  answer: string;
  maxGuesses?: number;
  playerDifficulty: PlayerDifficulty;
  roundDurationMs: number;
  dailyCompletedRounds: number;
  dailyWonRounds: number;
  dailyConsecutiveWins: number;
  hintsUsed: number;
};

export type DailyChallengeRoundTracker = {
  date: string;
  completedRounds: number;
  wonRounds: number;
  consecutiveWins: number;
};
