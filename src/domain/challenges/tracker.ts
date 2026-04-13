import { DAILY_CHALLENGE_ROUND_TRACKER_STORAGE_KEY_PREFIX } from "./constants";
import type { DailyChallengeRoundTracker } from "./types";

const DEFAULT_PLAYER_TRACKER_SCOPE = "anonymous";

const isBrowser = (): boolean => typeof window !== "undefined";

const buildStorageKey = (prefix: string, playerCode: string): string => {
  const scope =
    typeof playerCode === "string" && playerCode.trim().length > 0
      ? playerCode.trim()
      : DEFAULT_PLAYER_TRACKER_SCOPE;
  return `${prefix}:${scope}`;
};

const parsePositiveInteger = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.floor(value);
};

const getDefaultDailyTracker = (date: string): DailyChallengeRoundTracker => ({
  date,
  completedRounds: 0,
  wonRounds: 0,
  consecutiveWins: 0,
});

const parseDailyTracker = (
  raw: string | null,
  date: string,
): DailyChallengeRoundTracker => {
  if (!raw) {
    return getDefaultDailyTracker(date);
  }

  try {
    const parsed = JSON.parse(raw) as {
      date?: unknown;
      completedRounds?: unknown;
      wonRounds?: unknown;
      consecutiveWins?: unknown;
    };
    const parsedDate = typeof parsed.date === "string" ? parsed.date : date;

    if (parsedDate !== date) {
      return getDefaultDailyTracker(date);
    }

    return {
      date,
      completedRounds: parsePositiveInteger(parsed.completedRounds),
      wonRounds: parsePositiveInteger(parsed.wonRounds),
      consecutiveWins: parsePositiveInteger(parsed.consecutiveWins),
    };
  } catch {
    return getDefaultDailyTracker(date);
  }
};

const persistTracker = <T>(storageKey: string, tracker: T): void => {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(tracker));
  } catch {
    // Ignore storage failures for non-critical challenge tracker data.
  }
};

export const readDailyChallengeRoundTracker = (
  date: string,
  playerCode: string,
): DailyChallengeRoundTracker => {
  if (!isBrowser()) {
    return getDefaultDailyTracker(date);
  }

  try {
    const storageKey = buildStorageKey(
      DAILY_CHALLENGE_ROUND_TRACKER_STORAGE_KEY_PREFIX,
      playerCode,
    );
    const raw = window.localStorage.getItem(storageKey);
    return parseDailyTracker(raw, date);
  } catch {
    return getDefaultDailyTracker(date);
  }
};

export const recordDailyChallengeRoundCompletion = ({
  date,
  playerCode,
  won,
}: {
  date: string;
  playerCode: string;
  won: boolean;
}): DailyChallengeRoundTracker => {
  const current = readDailyChallengeRoundTracker(date, playerCode);
  const next: DailyChallengeRoundTracker = {
    date,
    completedRounds: current.completedRounds + 1,
    wonRounds: won ? current.wonRounds + 1 : current.wonRounds,
    consecutiveWins: won ? current.consecutiveWins + 1 : 0,
  };

  const storageKey = buildStorageKey(
    DAILY_CHALLENGE_ROUND_TRACKER_STORAGE_KEY_PREFIX,
    playerCode,
  );
  persistTracker(storageKey, next);

  return next;
};

export const resetDailyChallengeRoundTracker = (
  date: string,
  playerCode: string,
): DailyChallengeRoundTracker => {
  const next = getDefaultDailyTracker(date);
  const storageKey = buildStorageKey(
    DAILY_CHALLENGE_ROUND_TRACKER_STORAGE_KEY_PREFIX,
    playerCode,
  );
  persistTracker(storageKey, next);
  return next;
};
