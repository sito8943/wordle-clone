import type { PersistedGameState } from "@domain/wordle";

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
