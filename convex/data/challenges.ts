export const CHALLENGE_CONDITION_KEYS = {
  FIRST_GUESS: "first_guess",
  COMPLETE_ROUND: "complete_round",
  UNIQUE_LETTERS: "unique_letters",
  THREE_GUESSES: "three_guesses",
  VOWELS_FIRST: "vowels_first",
  PERSISTENT: "persistent",
  SPEEDSTER: "speedster",
  GENIUS: "genius",
  UNSTOPPABLE_STREAK: "unstoppable_streak",
  PERFECTIONIST: "perfectionist",
  EXTREME_DIFFICULTY: "extreme_difficulty",
  DAILY_DOUBLE: "daily_double",
} as const;

export type ChallengeConditionKey =
  (typeof CHALLENGE_CONDITION_KEYS)[keyof typeof CHALLENGE_CONDITION_KEYS];

const CHALLENGE_CONDITION_KEY_SET: ReadonlySet<string> = new Set(
  Object.values(CHALLENGE_CONDITION_KEYS),
);

export const isChallengeConditionKey = (
  value: string,
): value is ChallengeConditionKey => CHALLENGE_CONDITION_KEY_SET.has(value);

export const LEGACY_CHALLENGE_CONDITION_KEY_ALIASES: Record<
  string,
  ChallengeConditionKey
> = {
  polyglot: CHALLENGE_CONDITION_KEYS.DAILY_DOUBLE,
};

export type ChallengeSeed = {
  name: string;
  description: string;
  type: "simple" | "complex";
  conditionKey: ChallengeConditionKey;
};

const CHALLENGE_SEED_BY_CONDITION_KEY: Record<
  ChallengeConditionKey,
  Omit<ChallengeSeed, "conditionKey">
> = {
  [CHALLENGE_CONDITION_KEYS.FIRST_GUESS]: {
    name: "First Guess",
    description: "Make at least 1 guess in a round",
    type: "simple",
  },
  [CHALLENGE_CONDITION_KEYS.COMPLETE_ROUND]: {
    name: "Steady Player",
    description: "Complete a round (win or lose)",
    type: "simple",
  },
  [CHALLENGE_CONDITION_KEYS.UNIQUE_LETTERS]: {
    name: "Explorer",
    description: "Use at least 3 different letters in your first guess",
    type: "simple",
  },
  [CHALLENGE_CONDITION_KEYS.THREE_GUESSES]: {
    name: "Three Tries",
    description: "Use at least 3 guesses in a round",
    type: "simple",
  },
  [CHALLENGE_CONDITION_KEYS.VOWELS_FIRST]: {
    name: "Vowels First",
    description: "Your first guess must contain at least 2 vowels",
    type: "simple",
  },
  [CHALLENGE_CONDITION_KEYS.PERSISTENT]: {
    name: "Persistent",
    description: "Complete 2 rounds in the same day",
    type: "simple",
  },
  [CHALLENGE_CONDITION_KEYS.SPEEDSTER]: {
    name: "Speedster",
    description: "Win a round in less than 60 seconds",
    type: "complex",
  },
  [CHALLENGE_CONDITION_KEYS.GENIUS]: {
    name: "Genius",
    description: "Guess the word in 2 attempts or fewer",
    type: "complex",
  },
  [CHALLENGE_CONDITION_KEYS.UNSTOPPABLE_STREAK]: {
    name: "Unstoppable Streak",
    description: "Reach a win streak of 3",
    type: "complex",
  },
  [CHALLENGE_CONDITION_KEYS.PERFECTIONIST]: {
    name: "Perfectionist",
    description: "Guess the word on the first try",
    type: "complex",
  },
  [CHALLENGE_CONDITION_KEYS.EXTREME_DIFFICULTY]: {
    name: "Extreme Difficulty",
    description: "Win a round on Hard or Insane difficulty",
    type: "complex",
  },
  [CHALLENGE_CONDITION_KEYS.DAILY_DOUBLE]: {
    name: "Daily Double",
    description: "Win 2 rounds in the same day",
    type: "complex",
  },
};

export const CHALLENGE_SEEDS: ChallengeSeed[] = (
  Object.entries(CHALLENGE_SEED_BY_CONDITION_KEY) as Array<
    [ChallengeConditionKey, Omit<ChallengeSeed, "conditionKey">]
  >
).map(([conditionKey, metadata]) => ({
  ...metadata,
  conditionKey,
}));
