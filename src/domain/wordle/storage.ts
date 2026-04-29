import { env } from "@config";
import { hasInProgressGame } from "./state";
import { getTodayDateUTC } from "./daily";
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

const resolveUtcDateFromTimestamp = (value: unknown): string | null => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  const timestamp = Math.floor(value);
  return new Date(timestamp).toISOString().slice(0, 10);
};

const shouldClearStaleDailyState = (
  modeId: WordleModeId | undefined,
  parsed: unknown,
): boolean => {
  if (
    modeId !== WORDLE_MODE_IDS.DAILY ||
    !parsed ||
    typeof parsed !== "object"
  ) {
    return false;
  }

  const startedAt = resolveUtcDateFromTimestamp(
    (parsed as { startedAt?: unknown }).startedAt,
  );

  if (!startedAt) {
    return false;
  }

  return startedAt !== getTodayDateUTC();
};

export const readPersistedGameState = (modeId?: WordleModeId): unknown => {
  if (typeof window === "undefined") {
    return null;
  }

  const key = resolveStorageKey(modeId);

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (shouldClearStaleDailyState(modeId, parsed)) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed;
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
