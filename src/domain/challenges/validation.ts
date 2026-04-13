import { MAX_GUESSES, WORD_LENGTH } from "@domain/wordle";
import type { TileStatus } from "@utils/types";
import {
  CHALLENGE_CONDITION_KEYS,
  CHALLENGE_DEFAULT_COMPLEX_GREEN_FOCUS_MIN_CORRECT,
  CHALLENGE_DEFAULT_COMPLEX_RARE_LETTERS,
  CHALLENGE_DEFAULT_COMPLEX_RECKLESS_MAX_REPEATS,
  CHALLENGE_DEFAULT_COMPLEX_RECKLESS_MIN_REPEATS,
  CHALLENGE_DEFAULT_COMPLEX_SPEEDSTER_MAX_DURATION_MS,
  CHALLENGE_DEFAULT_SIMPLE_LATE_WIN_MAX_DURATION_MS,
  CHALLENGE_DEFAULT_SIMPLE_NO_REPEAT_N_LETTERS,
  CHALLENGE_DEFAULT_SIMPLE_PERSISTENT_WINS_TARGET,
  CHALLENGE_DEFAULT_SIMPLE_SAME_N_ENDS,
  CHALLENGE_DEFAULT_SIMPLE_SAME_N_STARTS,
  CHALLENGE_DEFAULT_SIMPLE_YELLOW_FOCUS_MIN_PRESENT,
  CHALLENGE_DEFAULT_WEEKLY_PERFECT_PROGRESSION_WINS_TARGET,
} from "./constants";
import type { ChallengeConditionContext, ChallengeConditionKey } from "./types";

const VOWELS = new Set(["A", "E", "I", "O", "U"]);
const RARE_LETTERS = new Set(CHALLENGE_DEFAULT_COMPLEX_RARE_LETTERS);

const normalizeWord = (word: string): string => word.trim().toUpperCase();

const getGuessWords = (ctx: ChallengeConditionContext): string[] =>
  ctx.guesses.map((guess) => normalizeWord(guess.word)).filter(Boolean);

const getWinningGuessWord = (ctx: ChallengeConditionContext): string | null => {
  if (!ctx.won) {
    return null;
  }

  const normalizedAnswer = normalizeWord(ctx.answer);

  for (const guess of ctx.guesses) {
    const normalizedWord = normalizeWord(guess.word);
    if (normalizedWord === normalizedAnswer) {
      return normalizedWord;
    }
  }

  return null;
};

const getMaxLetterRepeatCount = (word: string): number => {
  const frequencies = new Map<string, number>();

  for (const char of word) {
    frequencies.set(char, (frequencies.get(char) ?? 0) + 1);
  }

  let maxCount = 0;
  for (const count of frequencies.values()) {
    if (count > maxCount) {
      maxCount = count;
    }
  }

  return maxCount;
};

const hasWordRepeatedInRange = (
  words: string[],
  minRepeats: number,
  maxRepeats = minRepeats,
): boolean => {
  if (words.length === 0) {
    return false;
  }

  const counts = new Map<string, number>();

  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return Array.from(counts.values()).some(
    (repeatCount) => repeatCount >= minRepeats && repeatCount <= maxRepeats,
  );
};

const hasAtLeastNRowsWithSameEdge = (
  words: string[],
  n: number,
  edge: "start" | "end",
): boolean => {
  if (words.length === 0) {
    return false;
  }

  const counts = new Map<string, number>();

  for (const word of words) {
    const edgeLetter =
      edge === "start" ? word.slice(0, 1) : word.slice(word.length - 1);

    if (!edgeLetter) {
      continue;
    }

    counts.set(edgeLetter, (counts.get(edgeLetter) ?? 0) + 1);
  }

  return Array.from(counts.values()).some((count) => count >= n);
};

const getStatusCount = (statuses: TileStatus[], target: TileStatus): number =>
  statuses.reduce(
    (count, status) => (status === target ? count + 1 : count),
    0,
  );

const countVowels = (word: string): number =>
  word.split("").filter((char) => VOWELS.has(char)).length;

const getDistinctVowels = (word: string): Set<string> =>
  new Set(word.split("").filter((char) => VOWELS.has(char)));

const isPalindrome = (word: string): boolean =>
  word.length > 0 && word === word.split("").reverse().join("");

const hasNonDecreasingLexicographicalOrder = (words: string[]): boolean => {
  for (let index = 1; index < words.length; index += 1) {
    const previous = words[index - 1];
    const current = words[index];

    if (!previous || !current || previous.localeCompare(current) > 0) {
      return false;
    }
  }

  return true;
};

const hasUsedAllRareLetters = (words: string[]): boolean => {
  if (words.length === 0) {
    return false;
  }

  const lettersUsed = new Set(words.join("").split(""));
  for (const rareLetter of RARE_LETTERS) {
    if (!lettersUsed.has(rareLetter)) {
      return false;
    }
  }

  return true;
};

const hasSingleVowelPattern = (word: string): boolean =>
  getDistinctVowels(word).size === 1;

const conditionEvaluators: Record<
  ChallengeConditionKey,
  (ctx: ChallengeConditionContext) => boolean
> = {
  // Simple challenges
  [CHALLENGE_CONDITION_KEYS.COMEBACK]: (ctx) =>
    ctx.won && ctx.guesses.length === MAX_GUESSES,

  [CHALLENGE_CONDITION_KEYS.STEADY_PLAYER]: (ctx) => ctx.won,

  [CHALLENGE_CONDITION_KEYS.RISKY]: (ctx) =>
    hasWordRepeatedInRange(getGuessWords(ctx), 2),

  [CHALLENGE_CONDITION_KEYS.PERSISTENT]: (ctx) =>
    ctx.dailyWonRounds >= CHALLENGE_DEFAULT_SIMPLE_PERSISTENT_WINS_TARGET,

  [CHALLENGE_CONDITION_KEYS.NO_REPEAT_N_LETTERS]: (ctx) => {
    const words = getGuessWords(ctx);
    return (
      words.length > 0 &&
      words.every(
        (word) =>
          getMaxLetterRepeatCount(word) <
          CHALLENGE_DEFAULT_SIMPLE_NO_REPEAT_N_LETTERS,
      )
    );
  },

  [CHALLENGE_CONDITION_KEYS.SAME_N_STARTS]: (ctx) =>
    hasAtLeastNRowsWithSameEdge(
      getGuessWords(ctx),
      CHALLENGE_DEFAULT_SIMPLE_SAME_N_STARTS,
      "start",
    ),

  [CHALLENGE_CONDITION_KEYS.SAME_N_ENDS]: (ctx) =>
    hasAtLeastNRowsWithSameEdge(
      getGuessWords(ctx),
      CHALLENGE_DEFAULT_SIMPLE_SAME_N_ENDS,
      "end",
    ),

  [CHALLENGE_CONDITION_KEYS.LATE_WIN]: (ctx) =>
    ctx.won &&
    ctx.roundDurationMs < CHALLENGE_DEFAULT_SIMPLE_LATE_WIN_MAX_DURATION_MS,

  [CHALLENGE_CONDITION_KEYS.YELLOW_FOCUS]: (ctx) =>
    ctx.guesses.some(
      (guess) =>
        getStatusCount(guess.statuses, "present") >=
        CHALLENGE_DEFAULT_SIMPLE_YELLOW_FOCUS_MIN_PRESENT,
    ),

  [CHALLENGE_CONDITION_KEYS.ONLY_ONE_VOWEL]: (ctx) => {
    const winningWord = getWinningGuessWord(ctx);
    return winningWord !== null && countVowels(winningWord) === 1;
  },

  [CHALLENGE_CONDITION_KEYS.NO_HINTS]: (ctx) => ctx.won && ctx.hintsUsed === 0,

  // Complex challenges
  [CHALLENGE_CONDITION_KEYS.SPEEDSTER]: (ctx) =>
    ctx.won &&
    ctx.roundDurationMs < CHALLENGE_DEFAULT_COMPLEX_SPEEDSTER_MAX_DURATION_MS,

  [CHALLENGE_CONDITION_KEYS.RECKLESS]: (ctx) =>
    hasWordRepeatedInRange(
      getGuessWords(ctx),
      CHALLENGE_DEFAULT_COMPLEX_RECKLESS_MIN_REPEATS,
      CHALLENGE_DEFAULT_COMPLEX_RECKLESS_MAX_REPEATS,
    ),

  [CHALLENGE_CONDITION_KEYS.PALINDROME_GUESS]: (ctx) => {
    const winningWord = getWinningGuessWord(ctx);
    return winningWord !== null && isPalindrome(winningWord);
  },

  [CHALLENGE_CONDITION_KEYS.NO_REPEAT_LETTERS]: (ctx) => {
    const words = getGuessWords(ctx);
    return (
      ctx.won &&
      words.length > 0 &&
      words.every((word) => getMaxLetterRepeatCount(word) === 1)
    );
  },

  [CHALLENGE_CONDITION_KEYS.SAME_START]: (ctx) => {
    const words = getGuessWords(ctx);
    if (words.length < 2) {
      return false;
    }

    const firstLetter = words[0]?.slice(0, 1);
    if (!firstLetter) {
      return false;
    }

    return words.every((word) => word.slice(0, 1) === firstLetter);
  },

  [CHALLENGE_CONDITION_KEYS.ENDS_SAME_LETTER]: (ctx) => {
    const words = getGuessWords(ctx);
    if (words.length < 2) {
      return false;
    }

    const lastLetter = words[0]?.slice(words[0].length - 1);
    if (!lastLetter) {
      return false;
    }

    return words.every((word) => word.slice(word.length - 1) === lastLetter);
  },

  [CHALLENGE_CONDITION_KEYS.ALPHABETICAL_ORDER]: (ctx) => {
    const words = getGuessWords(ctx);
    return words.length > 1 && hasNonDecreasingLexicographicalOrder(words);
  },

  [CHALLENGE_CONDITION_KEYS.GREEN_FOCUS]: (ctx) =>
    ctx.guesses.some(
      (guess) =>
        getStatusCount(guess.statuses, "correct") >=
        CHALLENGE_DEFAULT_COMPLEX_GREEN_FOCUS_MIN_CORRECT,
    ),

  [CHALLENGE_CONDITION_KEYS.RARE_LETTERS]: (ctx) =>
    hasUsedAllRareLetters(getGuessWords(ctx)),

  [CHALLENGE_CONDITION_KEYS.NO_MISPLACED]: (ctx) =>
    ctx.guesses.length > 0 &&
    ctx.guesses.every(
      (guess) => getStatusCount(guess.statuses, "present") === 0,
    ),

  [CHALLENGE_CONDITION_KEYS.SAME_VOWEL_PATTERN]: (ctx) => {
    const words = getGuessWords(ctx);
    return (
      words.length > 0 && words.every((word) => hasSingleVowelPattern(word))
    );
  },

  // Weekly challenges
  [CHALLENGE_CONDITION_KEYS.NO_GRAY_TILES]: (ctx) =>
    ctx.won &&
    ctx.guesses.length > 0 &&
    ctx.guesses.every(
      (guess) => getStatusCount(guess.statuses, "absent") === 0,
    ),

  [CHALLENGE_CONDITION_KEYS.PERFECT_PROGRESSION]: (ctx) =>
    ctx.weeklyWonRounds >=
      CHALLENGE_DEFAULT_WEEKLY_PERFECT_PROGRESSION_WINS_TARGET &&
    ctx.weeklyLostRounds === 0,

  [CHALLENGE_CONDITION_KEYS.ALL_YELLOW_RUN]: (ctx) =>
    ctx.guesses.some(
      (guess) => getStatusCount(guess.statuses, "present") === WORD_LENGTH,
    ),

  [CHALLENGE_CONDITION_KEYS.EXTREME_DIFFICULTY]: (ctx) =>
    ctx.won && ctx.playerDifficulty === "insane",
};

export const evaluateCondition = (
  key: ChallengeConditionKey,
  ctx: ChallengeConditionContext,
): boolean => {
  const evaluator = (
    conditionEvaluators as Partial<
      Record<string, (context: ChallengeConditionContext) => boolean>
    >
  )[key];

  if (!evaluator) {
    return false;
  }

  return evaluator(ctx);
};
