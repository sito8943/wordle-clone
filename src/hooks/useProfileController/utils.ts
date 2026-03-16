import type { PersistedGameState } from "../../domain/wordle";
import type { PlayerDifficulty } from "../../providers/types";

export const hasActivePersistedGame = (value: unknown): boolean => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeState = value as Partial<PersistedGameState>;
  const hasAttemptedGuess =
    Array.isArray(maybeState.guesses) && maybeState.guesses.length > 0;
  const hasTypedLetters =
    typeof maybeState.current === "string" && maybeState.current.length > 0;

  return (
    maybeState.gameOver === false && (hasAttemptedGuess || hasTypedLetters)
  );
};

export const getPlayerDifficultyLabel = (
  difficulty: PlayerDifficulty,
): string => {
  if (difficulty === "easy") {
    return "Easy";
  }

  if (difficulty === "insane") {
    return "Insane";
  }

  if (difficulty === "hard") {
    return "Hard";
  }

  return "Normal";
};
