import type { GuessCombo, GuessResult } from "./types";

export const getGuessCombo = (
  guess: GuessResult | null | undefined,
): GuessCombo | null => {
  const statuses = guess?.statuses;

  if (!Array.isArray(statuses)) {
    return null;
  }

  const count = statuses.reduce((total, status) => {
    if (status === "correct" || status === "present") {
      return total + 1;
    }

    return total;
  }, 0);

  if (count === 0) {
    return null;
  }

  return {
    count,
    tone: statuses.includes("correct") ? "correct" : "present",
  };
};
