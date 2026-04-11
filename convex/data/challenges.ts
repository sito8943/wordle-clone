export type ChallengeSeed = {
  name: string;
  description: string;
  type: "simple" | "complex";
  conditionKey: string;
};

export const CHALLENGE_SEEDS: ChallengeSeed[] = [
  // Simple challenges (6)
  {
    name: "First Guess",
    description: "Make at least 1 guess in a round",
    type: "simple",
    conditionKey: "first_guess",
  },
  {
    name: "Steady Player",
    description: "Complete a round (win or lose)",
    type: "simple",
    conditionKey: "complete_round",
  },
  {
    name: "Explorer",
    description: "Use at least 3 different letters in your first guess",
    type: "simple",
    conditionKey: "unique_letters",
  },
  {
    name: "Three Tries",
    description: "Use at least 3 guesses in a round",
    type: "simple",
    conditionKey: "three_guesses",
  },
  {
    name: "Vowels First",
    description: "Your first guess must contain at least 2 vowels",
    type: "simple",
    conditionKey: "vowels_first",
  },
  {
    name: "Persistent",
    description: "Complete 2 rounds in the same day",
    type: "simple",
    conditionKey: "persistent",
  },

  // Complex challenges (6)
  {
    name: "Speedster",
    description: "Win a round in less than 60 seconds",
    type: "complex",
    conditionKey: "speedster",
  },
  {
    name: "Genius",
    description: "Guess the word in 2 attempts or fewer",
    type: "complex",
    conditionKey: "genius",
  },
  {
    name: "Unstoppable Streak",
    description: "Reach a win streak of 3",
    type: "complex",
    conditionKey: "unstoppable_streak",
  },
  {
    name: "Perfectionist",
    description: "Guess the word on the first try",
    type: "complex",
    conditionKey: "perfectionist",
  },
  {
    name: "Extreme Difficulty",
    description: "Win a round on Hard or Insane difficulty",
    type: "complex",
    conditionKey: "extreme_difficulty",
  },
  {
    name: "Polyglot",
    description: "Win a round in both English and Spanish in the same day",
    type: "complex",
    conditionKey: "polyglot",
  },
];
