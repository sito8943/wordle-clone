import type { PlayerLanguage } from "@domain/wordle";
import { DAILY_CHALLENGE_ROUND_TRACKER_STORAGE_KEY_PREFIX } from "./constants";
import type { DailyChallengeRoundTracker } from "./types";

const DEFAULT_PLAYER_TRACKER_SCOPE = "anonymous";

const isBrowser = (): boolean => typeof window !== "undefined";

const buildStorageKey = (playerCode: string): string => {
  const scope =
    typeof playerCode === "string" && playerCode.trim().length > 0
      ? playerCode.trim()
      : DEFAULT_PLAYER_TRACKER_SCOPE;
  return `${DAILY_CHALLENGE_ROUND_TRACKER_STORAGE_KEY_PREFIX}:${scope}`;
};

const sanitizeWonLanguages = (value: unknown): PlayerLanguage[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const unique = new Set<PlayerLanguage>();

  for (const item of value) {
    if (item === "en" || item === "es") {
      unique.add(item);
    }
  }

  return Array.from(unique);
};

const getDefaultTracker = (date: string): DailyChallengeRoundTracker => ({
  date,
  completedRounds: 0,
  consecutiveWins: 0,
  wonLanguages: [],
});

const parseTracker = (
  raw: string | null,
  date: string,
): DailyChallengeRoundTracker => {
  if (!raw) {
    return getDefaultTracker(date);
  }

  try {
    const parsed = JSON.parse(raw) as {
      date?: unknown;
      completedRounds?: unknown;
      consecutiveWins?: unknown;
      wonLanguages?: unknown;
    };
    const parsedDate = typeof parsed.date === "string" ? parsed.date : date;

    if (parsedDate !== date) {
      return getDefaultTracker(date);
    }

    const completedRounds =
      typeof parsed.completedRounds === "number" &&
      Number.isFinite(parsed.completedRounds) &&
      parsed.completedRounds > 0
        ? Math.floor(parsed.completedRounds)
        : 0;
    const consecutiveWins =
      typeof parsed.consecutiveWins === "number" &&
      Number.isFinite(parsed.consecutiveWins) &&
      parsed.consecutiveWins > 0
        ? Math.floor(parsed.consecutiveWins)
        : 0;

    return {
      date,
      completedRounds,
      consecutiveWins,
      wonLanguages: sanitizeWonLanguages(parsed.wonLanguages),
    };
  } catch {
    return getDefaultTracker(date);
  }
};

const persistTracker = (
  playerCode: string,
  tracker: DailyChallengeRoundTracker,
): void => {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(
      buildStorageKey(playerCode),
      JSON.stringify(tracker),
    );
  } catch {
    // Ignore storage failures for non-critical daily tracker data.
  }
};

export const readDailyChallengeRoundTracker = (
  date: string,
  playerCode: string,
): DailyChallengeRoundTracker => {
  if (!isBrowser()) {
    return getDefaultTracker(date);
  }

  try {
    const raw = window.localStorage.getItem(buildStorageKey(playerCode));
    return parseTracker(raw, date);
  } catch {
    return getDefaultTracker(date);
  }
};

export const recordDailyChallengeRoundCompletion = ({
  date,
  playerCode,
  language,
  won,
}: {
  date: string;
  playerCode: string;
  language: PlayerLanguage;
  won: boolean;
}): DailyChallengeRoundTracker => {
  const current = readDailyChallengeRoundTracker(date, playerCode);
  const nextWonLanguages = won
    ? Array.from(new Set<PlayerLanguage>([...current.wonLanguages, language]))
    : current.wonLanguages;
  const next: DailyChallengeRoundTracker = {
    date,
    completedRounds: current.completedRounds + 1,
    consecutiveWins: won ? current.consecutiveWins + 1 : 0,
    wonLanguages: nextWonLanguages,
  };

  persistTracker(playerCode, next);

  return next;
};

export const resetDailyChallengeRoundTracker = (
  date: string,
  playerCode: string,
): DailyChallengeRoundTracker => {
  const next = getDefaultTracker(date);
  persistTracker(playerCode, next);
  return next;
};
