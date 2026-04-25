import {
  DAILY_MODE_STATUS_STORAGE_KEY_PREFIX,
  DAILY_SHIELD_USED_STORAGE_KEY_PREFIX,
  DAILY_WORD_DATE_PATTERN,
  DAILY_WORD_FALLBACK,
} from "./constants";
import { hashGameId } from "./reference";
import type {
  DailyModeOutcome,
  ResolveDailyAnswerInput,
  StoredDailyShieldUsage,
  StoredDailyModeStatus,
} from "./types";

const normalizeWord = (value: string): string => value.trim().toUpperCase();

const normalizePlayerCode = (playerCode?: string | null): string | null => {
  if (typeof playerCode !== "string") {
    return null;
  }

  const normalized = playerCode.trim().toUpperCase();
  return normalized.length > 0 ? normalized : null;
};

const normalizeDailyWordDate = (value?: string | null): string => {
  if (typeof value === "string") {
    const normalized = value.trim();
    if (DAILY_WORD_DATE_PATTERN.test(normalized)) {
      return normalized;
    }
  }

  return getTodayDateUTC();
};

const resolveDailyModeStatusStorageKey = (
  playerCode?: string | null,
): string => {
  const normalizedPlayerCode = normalizePlayerCode(playerCode);
  if (!normalizedPlayerCode) {
    return DAILY_MODE_STATUS_STORAGE_KEY_PREFIX;
  }

  return `${DAILY_MODE_STATUS_STORAGE_KEY_PREFIX}:${normalizedPlayerCode}`;
};

const resolveDailyShieldUsageStorageKey = (
  playerCode?: string | null,
): string => {
  const normalizedPlayerCode = normalizePlayerCode(playerCode);
  if (!normalizedPlayerCode) {
    return DAILY_SHIELD_USED_STORAGE_KEY_PREFIX;
  }

  return `${DAILY_SHIELD_USED_STORAGE_KEY_PREFIX}:${normalizedPlayerCode}`;
};

const isDailyModeOutcome = (value: unknown): value is DailyModeOutcome =>
  value === "won" || value === "lost";

export const getTodayDateUTC = (): string => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};

export const getMillisUntilEndOfDayUTC = (): number => {
  const now = new Date();
  const endOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );

  return Math.max(0, endOfDay.getTime() - now.getTime());
};

export const readDailyModeOutcomeForDate = (
  playerCode?: string | null,
  date: string = getTodayDateUTC(),
): DailyModeOutcome | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(
      resolveDailyModeStatusStorageKey(playerCode),
    );
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredDailyModeStatus>;
    if (
      !parsed ||
      parsed.date !== date ||
      !isDailyModeOutcome(parsed.outcome)
    ) {
      return null;
    }

    return parsed.outcome;
  } catch {
    return null;
  }
};

export const writeDailyModeOutcomeForDate = ({
  outcome,
  playerCode,
  date = getTodayDateUTC(),
}: {
  outcome: DailyModeOutcome;
  playerCode?: string | null;
  date?: string;
}): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const payload: StoredDailyModeStatus = {
      date,
      outcome,
    };
    window.localStorage.setItem(
      resolveDailyModeStatusStorageKey(playerCode),
      JSON.stringify(payload),
    );
  } catch {
    // Ignore storage write errors.
  }
};

export const clearDailyModeOutcome = (playerCode?: string | null): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(
      resolveDailyModeStatusStorageKey(playerCode),
    );
  } catch {
    // Ignore storage clear errors.
  }
};

export const clearAllDailyModeOutcomes = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const storage = window.localStorage;
    const keysToClear: string[] = [];

    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key) {
        continue;
      }

      if (
        key === DAILY_MODE_STATUS_STORAGE_KEY_PREFIX ||
        key.startsWith(`${DAILY_MODE_STATUS_STORAGE_KEY_PREFIX}:`)
      ) {
        keysToClear.push(key);
      }
    }

    for (const key of keysToClear) {
      storage.removeItem(key);
    }
  } catch {
    // Ignore storage clear errors.
  }
};

const hasDailyShieldUsageForDate = (
  playerCode?: string | null,
  date: string = getTodayDateUTC(),
): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const raw = window.localStorage.getItem(
      resolveDailyShieldUsageStorageKey(playerCode),
    );
    if (!raw) {
      return false;
    }

    const parsed = JSON.parse(raw) as Partial<StoredDailyShieldUsage>;
    if (!parsed || parsed.date !== date || parsed.used !== true) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

export const hasDailyShieldAvailableForDate = (
  playerCode?: string | null,
  date: string = getTodayDateUTC(),
): boolean => {
  const normalizedPlayerCode = normalizePlayerCode(playerCode);
  if (!normalizedPlayerCode) {
    return false;
  }

  const dailyOutcome = readDailyModeOutcomeForDate(normalizedPlayerCode, date);
  if (dailyOutcome !== "won") {
    return false;
  }

  return !hasDailyShieldUsageForDate(normalizedPlayerCode, date);
};

export const consumeDailyShieldForDate = ({
  playerCode,
  date = getTodayDateUTC(),
}: {
  playerCode?: string | null;
  date?: string;
}): void => {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedPlayerCode = normalizePlayerCode(playerCode);
  if (!normalizedPlayerCode) {
    return;
  }

  try {
    const payload: StoredDailyShieldUsage = {
      date,
      used: true,
    };
    window.localStorage.setItem(
      resolveDailyShieldUsageStorageKey(normalizedPlayerCode),
      JSON.stringify(payload),
    );
  } catch {
    // Ignore storage write errors.
  }
};

export const clearDailyShieldUsage = (playerCode?: string | null): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(
      resolveDailyShieldUsageStorageKey(playerCode),
    );
  } catch {
    // Ignore storage clear errors.
  }
};

export const clearAllDailyShieldUsages = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const storage = window.localStorage;
    const keysToClear: string[] = [];

    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key) {
        continue;
      }

      if (
        key === DAILY_SHIELD_USED_STORAGE_KEY_PREFIX ||
        key.startsWith(`${DAILY_SHIELD_USED_STORAGE_KEY_PREFIX}:`)
      ) {
        keysToClear.push(key);
      }
    }

    for (const key of keysToClear) {
      storage.removeItem(key);
    }
  } catch {
    // Ignore storage clear errors.
  }
};

export const resolveDeterministicDailyWord = (
  words: string[],
  date?: string | null,
): string => {
  if (words.length === 0) {
    return DAILY_WORD_FALLBACK;
  }

  const normalizedDate = normalizeDailyWordDate(date);
  const dayHash = hashGameId(`daily:${normalizedDate}`);
  const wordIndex = dayHash % words.length;

  return normalizeWord(words[wordIndex] ?? DAILY_WORD_FALLBACK);
};

export const resolveDailyAnswer = ({
  words,
  date,
  remoteDailyWord,
}: ResolveDailyAnswerInput): string => {
  const normalizedRemoteWord =
    typeof remoteDailyWord === "string" ? normalizeWord(remoteDailyWord) : "";

  if (normalizedRemoteWord.length > 0) {
    return normalizedRemoteWord;
  }

  return resolveDeterministicDailyWord(words, date);
};
