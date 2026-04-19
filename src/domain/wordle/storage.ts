import { env } from "@config";
import { hasInProgressGame } from "./state";
import { WORDLE_MODE_IDS } from "./modeConfig";
import type {
  PersistedGameRef,
  PersistedGameState,
  WordleModeId,
} from "./types";

const toPersistedGameRef = (state: PersistedGameState): PersistedGameRef => ({
  sessionId: state.sessionId,
  gameId: state.gameId,
  seed: state.seed,
  startedAt: state.startedAt,
  guesses: state.guesses,
  current: state.current,
  gameOver: state.gameOver,
});

const resolveStorageKey = (modeId?: WordleModeId): string => {
  if (!modeId || modeId === WORDLE_MODE_IDS.CLASSIC) {
    return env.wordleGameStorageKey;
  }

  return `${env.wordleGameStorageKey}:${modeId}`;
};

export const readPersistedGameState = (modeId?: WordleModeId): unknown => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(resolveStorageKey(modeId));
    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const persistGameState = (
  state: PersistedGameState,
  modeId?: WordleModeId,
): void => {
  if (typeof window === "undefined") {
    return;
  }

  const key = resolveStorageKey(modeId);

  try {
    if (hasInProgressGame(state)) {
      localStorage.setItem(key, JSON.stringify(toPersistedGameRef(state)));
      return;
    }

    localStorage.removeItem(key);
  } catch {
    // Ignore localStorage write errors.
  }
};

export const clearPersistedGameState = (modeId?: WordleModeId): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(resolveStorageKey(modeId));
  } catch {
    // Ignore localStorage write errors.
  }
};

export const clearAllPersistedGameStates = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  const modeIds: WordleModeId[] = [
    WORDLE_MODE_IDS.CLASSIC,
    WORDLE_MODE_IDS.LIGHTNING,
    WORDLE_MODE_IDS.ZEN,
    WORDLE_MODE_IDS.DAILY,
  ];

  for (const modeId of modeIds) {
    clearPersistedGameState(modeId);
  }
};
