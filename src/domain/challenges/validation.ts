import type { ChallengeConditionContext, ChallengeConditionKey } from "./types";

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

const conditionEvaluators: Record<
  ChallengeConditionKey,
  (ctx: ChallengeConditionContext) => boolean
> = {
  // Simple challenges
  first_guess: (ctx) => ctx.guesses.length >= 1,

  complete_round: (ctx) => ctx.gameOver,

  unique_letters: (ctx) => {
    if (ctx.guesses.length === 0) return false;
    const firstWord = ctx.guesses[0].word.toUpperCase();
    const unique = new Set(firstWord.split(""));
    return unique.size >= 3;
  },

  three_guesses: (ctx) => ctx.guesses.length >= 3,

  vowels_first: (ctx) => {
    if (ctx.guesses.length === 0) return false;
    const firstWord = ctx.guesses[0].word.toUpperCase();
    const vowelCount = firstWord.split("").filter((c) => VOWELS.has(c)).length;
    return vowelCount >= 2;
  },

  persistent: (ctx) => ctx.dailyCompletedRounds >= 2,

  // Complex challenges
  speedster: (ctx) => ctx.won && ctx.roundDurationMs < 60_000,

  genius: (ctx) => ctx.won && ctx.guesses.length <= 2,

  unstoppable_streak: (ctx) => ctx.won && ctx.dailyConsecutiveWins >= 3,

  perfectionist: (ctx) => ctx.won && ctx.guesses.length === 1,

  extreme_difficulty: (ctx) =>
    ctx.won && (ctx.difficulty === "hard" || ctx.difficulty === "insane"),

  daily_double: (ctx) => ctx.won && ctx.dailyCompletedRounds >= 2,

  // Legacy alias for older seeded records.
  polyglot: (ctx) => ctx.won && ctx.dailyCompletedRounds >= 2,
};

export const evaluateCondition = (
  key: ChallengeConditionKey,
  ctx: ChallengeConditionContext,
): boolean => {
  const evaluator = conditionEvaluators[key];
  return evaluator(ctx);
};
