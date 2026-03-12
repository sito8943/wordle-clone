import { env } from "../../config/env";
import { hasAttemptedRow } from "./state";
import type { PersistedGameState } from "./types";

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
    if (hasAttemptedRow(state)) {
      localStorage.setItem(env.wordleGameStorageKey, JSON.stringify(state));
      return;
    }

    localStorage.removeItem(env.wordleGameStorageKey);
  } catch {
    // Ignore localStorage write errors.
  }
};
