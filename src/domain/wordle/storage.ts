import { env } from "@config";
import { hasInProgressGame } from "./state";
import type { PersistedGameRef, PersistedGameState } from "./types";

const toPersistedGameRef = (state: PersistedGameState): PersistedGameRef => ({
  sessionId: state.sessionId,
  gameId: state.gameId,
  seed: state.seed,
  startedAt: state.startedAt,
  guesses: state.guesses,
  current: state.current,
  gameOver: state.gameOver,
});

export const readPersistedGameState = (): unknown => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(env.wordleGameStorageKey);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const persistGameState = (state: PersistedGameState): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (hasInProgressGame(state)) {
      localStorage.setItem(
        env.wordleGameStorageKey,
        JSON.stringify(toPersistedGameRef(state)),
      );
      return;
    }

    localStorage.removeItem(env.wordleGameStorageKey);
  } catch {
    // Ignore localStorage write errors.
  }
};

export const clearPersistedGameState = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(env.wordleGameStorageKey);
  } catch {
    // Ignore localStorage write errors.
  }
};
