export const CHALLENGE_CONDITION_KEYS = {
  COMEBACK: "comeback",
  STEADY_PLAYER: "steady_player",
  RISKY: "risky",
  PERSISTENT: "persistent",
  NO_REPEAT_N_LETTERS: "no_repeat_n_letters",
  SAME_N_STARTS: "same_n_starts",
  SAME_N_ENDS: "same_n_ends",
  LATE_WIN: "late_win",
  YELLOW_FOCUS: "yellow_focus",
  FIRST_GREEN: "first_green",
  NO_HINTS: "no_hints",
  SPEEDSTER: "speedster",
  RECKLESS: "reckless",
  PALINDROME_GUESS: "palindrome_guess",
  NO_REPEAT_LETTERS: "no_repeat_letters",
  SAME_START: "same_start",
  ENDS_SAME_LETTER: "ends_same_letter",
  ALPHABETICAL_ORDER: "alphabetical_order",
  GREEN_FOCUS: "green_focus",
  RARE_LETTERS: "rare_letters",
  NO_MISPLACED: "no_misplaced",
  SAME_VOWEL_PATTERN: "same_vowel_pattern",
  NO_GRAY_TILES: "no_gray_tiles",
  PERFECT_PROGRESSION: "perfect_progression",
  ALL_YELLOW_RUN: "all_yellow_run",
  EXTREME_DIFFICULTY: "extreme_difficulty",
} as const;

const SIMPLE_CHALLENGE_CONDITION_KEYS = [
  CHALLENGE_CONDITION_KEYS.COMEBACK,
  CHALLENGE_CONDITION_KEYS.STEADY_PLAYER,
  CHALLENGE_CONDITION_KEYS.RISKY,
  CHALLENGE_CONDITION_KEYS.PERSISTENT,
  CHALLENGE_CONDITION_KEYS.NO_REPEAT_N_LETTERS,
  CHALLENGE_CONDITION_KEYS.SAME_N_STARTS,
  CHALLENGE_CONDITION_KEYS.SAME_N_ENDS,
  CHALLENGE_CONDITION_KEYS.LATE_WIN,
  CHALLENGE_CONDITION_KEYS.YELLOW_FOCUS,
  CHALLENGE_CONDITION_KEYS.FIRST_GREEN,
  CHALLENGE_CONDITION_KEYS.NO_HINTS,
] as const;

const COMPLEX_CHALLENGE_CONDITION_KEYS = [
  CHALLENGE_CONDITION_KEYS.SPEEDSTER,
  CHALLENGE_CONDITION_KEYS.RECKLESS,
  CHALLENGE_CONDITION_KEYS.PALINDROME_GUESS,
  CHALLENGE_CONDITION_KEYS.NO_REPEAT_LETTERS,
  CHALLENGE_CONDITION_KEYS.SAME_START,
  CHALLENGE_CONDITION_KEYS.ENDS_SAME_LETTER,
  CHALLENGE_CONDITION_KEYS.ALPHABETICAL_ORDER,
  CHALLENGE_CONDITION_KEYS.GREEN_FOCUS,
  CHALLENGE_CONDITION_KEYS.RARE_LETTERS,
  CHALLENGE_CONDITION_KEYS.NO_MISPLACED,
  CHALLENGE_CONDITION_KEYS.SAME_VOWEL_PATTERN,
] as const;

const WEEKLY_CHALLENGE_CONDITION_KEYS = [
  CHALLENGE_CONDITION_KEYS.NO_GRAY_TILES,
  CHALLENGE_CONDITION_KEYS.PERFECT_PROGRESSION,
  CHALLENGE_CONDITION_KEYS.ALL_YELLOW_RUN,
  CHALLENGE_CONDITION_KEYS.EXTREME_DIFFICULTY,
] as const;

const CHALLENGE_DEFAULT_SIMPLE_PERSISTENT_WINS_TARGET = 2;
const CHALLENGE_DEFAULT_SIMPLE_NO_REPEAT_N_LETTERS = 2;
const CHALLENGE_DEFAULT_SIMPLE_SAME_N_STARTS = 2;
const CHALLENGE_DEFAULT_SIMPLE_SAME_N_ENDS = 2;
const CHALLENGE_DEFAULT_SIMPLE_LATE_WIN_MAX_DURATION_MS = 180_000;
const CHALLENGE_DEFAULT_SIMPLE_YELLOW_FOCUS_MIN_PRESENT = 3;

const CHALLENGE_DEFAULT_COMPLEX_SPEEDSTER_MAX_DURATION_MS = 60_000;
const CHALLENGE_DEFAULT_COMPLEX_RECKLESS_MIN_REPEATS = 2;
const CHALLENGE_DEFAULT_COMPLEX_RECKLESS_MAX_REPEATS = 3;
const CHALLENGE_DEFAULT_COMPLEX_GREEN_FOCUS_MIN_CORRECT = 3;
const CHALLENGE_DEFAULT_COMPLEX_RARE_LETTERS = ["Q", "Z", "X", "J"] as const;
const CHALLENGE_DEFAULT_WEEKLY_PERFECT_PROGRESSION_WINS_TARGET = 3;

export type ChallengeConditionKey =
  (typeof CHALLENGE_CONDITION_KEYS)[keyof typeof CHALLENGE_CONDITION_KEYS];

const CHALLENGE_CONDITION_KEY_SET: ReadonlySet<string> = new Set([
  ...SIMPLE_CHALLENGE_CONDITION_KEYS,
  ...COMPLEX_CHALLENGE_CONDITION_KEYS,
  ...WEEKLY_CHALLENGE_CONDITION_KEYS,
]);

export const isChallengeConditionKey = (
  value: string,
): value is ChallengeConditionKey => CHALLENGE_CONDITION_KEY_SET.has(value);

export const LEGACY_CHALLENGE_CONDITION_KEY_ALIASES: Record<
  string,
  ChallengeConditionKey
> = {};

export type ChallengeSeed = {
  name: string;
  description: string;
  type: "simple" | "complex" | "weekly";
  conditionKey: ChallengeConditionKey;
};

const SPEEDSTER_MAX_SECONDS = Math.floor(
  CHALLENGE_DEFAULT_COMPLEX_SPEEDSTER_MAX_DURATION_MS / 1000,
);
const LATE_WIN_MAX_SECONDS = Math.floor(
  CHALLENGE_DEFAULT_SIMPLE_LATE_WIN_MAX_DURATION_MS / 1000,
);
const RARE_LETTERS_LABEL = CHALLENGE_DEFAULT_COMPLEX_RARE_LETTERS.join(", ");

const CHALLENGE_SEED_BY_CONDITION_KEY: Record<
  ChallengeConditionKey,
  Omit<ChallengeSeed, "conditionKey">
> = {
  [CHALLENGE_CONDITION_KEYS.COMEBACK]: {
    name: "Comeback",
    description: "Win on the last attempt",
    type: "simple",
  },
  [CHALLENGE_CONDITION_KEYS.STEADY_PLAYER]: {
    name: "Steady Player",
    description: "Win a round",
    type: "simple",
  },
  [CHALLENGE_CONDITION_KEYS.RISKY]: {
    name: "Risky",
    description: "Repeat a guess row at least once",
    type: "simple",
  },
  [CHALLENGE_CONDITION_KEYS.PERSISTENT]: {
    name: "Persistent",
    description: `Win ${CHALLENGE_DEFAULT_SIMPLE_PERSISTENT_WINS_TARGET} rounds in the same day`,
    type: "simple",
  },
  [CHALLENGE_CONDITION_KEYS.NO_REPEAT_N_LETTERS]: {
    name: "No Repeat N Letters",
    description: `Do not repeat letters within your guess rows (N=${CHALLENGE_DEFAULT_SIMPLE_NO_REPEAT_N_LETTERS})`,
    type: "simple",
  },
  [CHALLENGE_CONDITION_KEYS.SAME_N_STARTS]: {
    name: "Same N Starts",
    description: `At least ${CHALLENGE_DEFAULT_SIMPLE_SAME_N_STARTS} rows start with the same letter`,
    type: "simple",
  },
  [CHALLENGE_CONDITION_KEYS.SAME_N_ENDS]: {
    name: "Same N Ends",
    description: `At least ${CHALLENGE_DEFAULT_SIMPLE_SAME_N_ENDS} rows end with the same letter`,
    type: "simple",
  },
  [CHALLENGE_CONDITION_KEYS.LATE_WIN]: {
    name: "Late Win",
    description: `Win in less than ${LATE_WIN_MAX_SECONDS} seconds`,
    type: "simple",
  },
  [CHALLENGE_CONDITION_KEYS.YELLOW_FOCUS]: {
    name: "Yellow Focus",
    description: `Get at least ${CHALLENGE_DEFAULT_SIMPLE_YELLOW_FOCUS_MIN_PRESENT} yellow tiles in one row`,
    type: "simple",
  },
  [CHALLENGE_CONDITION_KEYS.FIRST_GREEN]: {
    name: "First Green",
    description: "Get at least one green tile on your first guess",
    type: "simple",
  },
  [CHALLENGE_CONDITION_KEYS.NO_HINTS]: {
    name: "No Hints",
    description: "Win without using hints",
    type: "simple",
  },
  [CHALLENGE_CONDITION_KEYS.SPEEDSTER]: {
    name: "Speedster",
    description: `Win in less than ${SPEEDSTER_MAX_SECONDS} seconds`,
    type: "complex",
  },
  [CHALLENGE_CONDITION_KEYS.RECKLESS]: {
    name: "Reckless",
    description: `Repeat a row between ${CHALLENGE_DEFAULT_COMPLEX_RECKLESS_MIN_REPEATS} and ${CHALLENGE_DEFAULT_COMPLEX_RECKLESS_MAX_REPEATS} times`,
    type: "complex",
  },
  [CHALLENGE_CONDITION_KEYS.PALINDROME_GUESS]: {
    name: "Palindrome Guess",
    description: "Win with a palindrome guess",
    type: "complex",
  },
  [CHALLENGE_CONDITION_KEYS.NO_REPEAT_LETTERS]: {
    name: "No Repeat Letters",
    description: "Win without repeated letters in guess rows",
    type: "complex",
  },
  [CHALLENGE_CONDITION_KEYS.SAME_START]: {
    name: "Same Start",
    description: "All guess rows start with the same letter",
    type: "complex",
  },
  [CHALLENGE_CONDITION_KEYS.ENDS_SAME_LETTER]: {
    name: "Ends Same Letter",
    description: "All guess rows end with the same letter",
    type: "complex",
  },
  [CHALLENGE_CONDITION_KEYS.ALPHABETICAL_ORDER]: {
    name: "Alphabetical Order",
    description: "Guess rows are in alphabetical order",
    type: "complex",
  },
  [CHALLENGE_CONDITION_KEYS.GREEN_FOCUS]: {
    name: "Green Focus",
    description: `Get at least ${CHALLENGE_DEFAULT_COMPLEX_GREEN_FOCUS_MIN_CORRECT} green tiles in one row`,
    type: "complex",
  },
  [CHALLENGE_CONDITION_KEYS.RARE_LETTERS]: {
    name: "Rare Letters",
    description: `Use rare letters (${RARE_LETTERS_LABEL}) in the round`,
    type: "complex",
  },
  [CHALLENGE_CONDITION_KEYS.NO_MISPLACED]: {
    name: "No Misplaced",
    description: "Finish without yellow tiles",
    type: "complex",
  },
  [CHALLENGE_CONDITION_KEYS.SAME_VOWEL_PATTERN]: {
    name: "Same Vowel Pattern",
    description: "All guess rows use a single-vowel pattern",
    type: "complex",
  },
  [CHALLENGE_CONDITION_KEYS.NO_GRAY_TILES]: {
    name: "No Gray Tiles",
    description: "Win without incorrect letters",
    type: "weekly",
  },
  [CHALLENGE_CONDITION_KEYS.PERFECT_PROGRESSION]: {
    name: "Perfect Progression",
    description: `Win ${CHALLENGE_DEFAULT_WEEKLY_PERFECT_PROGRESSION_WINS_TARGET} rounds in the week without losing`,
    type: "weekly",
  },
  [CHALLENGE_CONDITION_KEYS.ALL_YELLOW_RUN]: {
    name: "All Yellow Run",
    description: "Get a full yellow row in a round",
    type: "weekly",
  },
  [CHALLENGE_CONDITION_KEYS.EXTREME_DIFFICULTY]: {
    name: "Extreme Difficulty",
    description: "Win in insane mode",
    type: "weekly",
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
