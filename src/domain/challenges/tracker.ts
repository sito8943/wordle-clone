import {
  DAILY_CHALLENGE_ROUND_TRACKER_STORAGE_KEY_PREFIX,
  WEEKLY_CHALLENGE_ROUND_TRACKER_STORAGE_KEY_PREFIX,
} from "./constants";
import type {
  DailyChallengeRoundTracker,
  WeeklyChallengeRoundTracker,
} from "./types";

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

const parseUtcDate = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const getDefaultDailyTracker = (date: string): DailyChallengeRoundTracker => ({
  date,
  completedRounds: 0,
  wonRounds: 0,
  consecutiveWins: 0,
});

const getDefaultWeeklyTracker = (
  weekStart: string,
): WeeklyChallengeRoundTracker => ({
  weekStart,
  completedRounds: 0,
  wonRounds: 0,
  lostRounds: 0,
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

const parseWeeklyTracker = (
  raw: string | null,
  weekStart: string,
): WeeklyChallengeRoundTracker => {
  if (!raw) {
    return getDefaultWeeklyTracker(weekStart);
  }

  try {
    const parsed = JSON.parse(raw) as {
      weekStart?: unknown;
      completedRounds?: unknown;
      wonRounds?: unknown;
      lostRounds?: unknown;
    };
    const parsedWeekStart =
      typeof parsed.weekStart === "string" ? parsed.weekStart : weekStart;

    if (parsedWeekStart !== weekStart) {
      return getDefaultWeeklyTracker(weekStart);
    }

    return {
      weekStart,
      completedRounds: parsePositiveInteger(parsed.completedRounds),
      wonRounds: parsePositiveInteger(parsed.wonRounds),
      lostRounds: parsePositiveInteger(parsed.lostRounds),
    };
  } catch {
    return getDefaultWeeklyTracker(weekStart);
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

export const getWeekStartDateUTC = (date: string): string => {
  const parsed = parseUtcDate(date);
  const baseDate = parsed ?? new Date();
  const normalized = new Date(
    Date.UTC(
      baseDate.getUTCFullYear(),
      baseDate.getUTCMonth(),
      baseDate.getUTCDate(),
    ),
  );
  const dayOfWeek = normalized.getUTCDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  normalized.setUTCDate(normalized.getUTCDate() - daysSinceMonday);
  return normalized.toISOString().slice(0, 10);
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

export const readWeeklyChallengeRoundTracker = (
  weekStart: string,
  playerCode: string,
): WeeklyChallengeRoundTracker => {
  if (!isBrowser()) {
    return getDefaultWeeklyTracker(weekStart);
  }

  try {
    const storageKey = buildStorageKey(
      WEEKLY_CHALLENGE_ROUND_TRACKER_STORAGE_KEY_PREFIX,
      playerCode,
    );
    const raw = window.localStorage.getItem(storageKey);
    return parseWeeklyTracker(raw, weekStart);
  } catch {
    return getDefaultWeeklyTracker(weekStart);
  }
};

export const recordWeeklyChallengeRoundCompletion = ({
  weekStart,
  playerCode,
  won,
}: {
  weekStart: string;
  playerCode: string;
  won: boolean;
}): WeeklyChallengeRoundTracker => {
  const current = readWeeklyChallengeRoundTracker(weekStart, playerCode);
  const next: WeeklyChallengeRoundTracker = {
    weekStart,
    completedRounds: current.completedRounds + 1,
    wonRounds: won ? current.wonRounds + 1 : current.wonRounds,
    lostRounds: won ? current.lostRounds : current.lostRounds + 1,
  };

  const storageKey = buildStorageKey(
    WEEKLY_CHALLENGE_ROUND_TRACKER_STORAGE_KEY_PREFIX,
    playerCode,
  );
  persistTracker(storageKey, next);

  return next;
};

export const resetWeeklyChallengeRoundTracker = (
  weekStart: string,
  playerCode: string,
): WeeklyChallengeRoundTracker => {
  const next = getDefaultWeeklyTracker(weekStart);
  const storageKey = buildStorageKey(
    WEEKLY_CHALLENGE_ROUND_TRACKER_STORAGE_KEY_PREFIX,
    playerCode,
  );
  persistTracker(storageKey, next);
  return next;
};
