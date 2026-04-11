import type { PlayerDifficulty, PlayerLanguage } from "../wordle/player";
import type { GuessResult } from "../wordle/types";

export type ChallengeType = "simple" | "complex";

export type ChallengeConditionKey =
  | "first_guess"
  | "complete_round"
  | "unique_letters"
  | "three_guesses"
  | "vowels_first"
  | "persistent"
  | "speedster"
  | "genius"
  | "unstoppable_streak"
  | "perfectionist"
  | "extreme_difficulty"
  | "polyglot";

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
  difficulty: PlayerDifficulty;
  streak: number;
  roundDurationMs: number;
  language: PlayerLanguage;
  dailyCompletedRounds: number;
  dailyLanguagesWon: PlayerLanguage[];
};
