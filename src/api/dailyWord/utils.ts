import {
  ACCENTED_LETTER_REPLACEMENTS,
  DAILY_WORD_DATE_PATTERN,
} from "./constants";
import type {
  DailyWordMeaningEntry,
  DailyWordMeaningResponse,
  DailyWordResponse,
} from "./types";

const normalizeCharacter = (character: string): string => {
  if (character === "Ñ") {
    return character;
  }

  return ACCENTED_LETTER_REPLACEMENTS[character] ?? character;
};

export const getTodayDateUTC = (): string => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};

export const normalizeDailyWordDate = (value?: string | null): string => {
  if (typeof value === "string") {
    const normalized = value.trim();
    if (DAILY_WORD_DATE_PATTERN.test(normalized)) {
      return normalized;
    }
  }

  return getTodayDateUTC();
};

export const normalizeDailyWordCandidate = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = [...value.trim().toUpperCase()]
    .map(normalizeCharacter)
    .join("")
    .replace(/[^A-ZÑ]/g, "");

  if (normalized.length === 0) {
    return null;
  }

  return normalized;
};

export const extractDailyWordFromResponse = (
  payload: unknown,
): string | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const maybeResponse = payload as DailyWordResponse;

  return normalizeDailyWordCandidate(maybeResponse.data?.word);
};

export const normalizeDailyMeaningCandidate = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().replace(/\s+/g, " ");

  return normalized.length > 0 ? normalized : null;
};

const extractMeaningFromMeanings = (
  meanings?: DailyWordMeaningEntry[],
): string | null => {
  if (!Array.isArray(meanings)) {
    return null;
  }

  for (const meaning of meanings) {
    if (!meaning || typeof meaning !== "object" || !Array.isArray(meaning.senses)) {
      continue;
    }

    for (const sense of meaning.senses) {
      if (!sense || typeof sense !== "object") {
        continue;
      }

      const normalizedMeaning = normalizeDailyMeaningCandidate(sense.description);
      if (normalizedMeaning) {
        return normalizedMeaning;
      }
    }
  }

  return null;
};

export const extractDailyMeaningFromResponse = (
  payload: unknown,
): string | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const maybeResponse = payload as DailyWordResponse & DailyWordMeaningResponse;
  const directMeaning = normalizeDailyMeaningCandidate(maybeResponse.data?.meaning);

  if (directMeaning) {
    return directMeaning;
  }

  return extractMeaningFromMeanings(maybeResponse.data?.meanings);
};

export const createMemoryStorage = (): Storage => {
  const memory = new Map<string, string>();

  return {
    get length() {
      return memory.size;
    },
    clear() {
      memory.clear();
    },
    getItem(key: string) {
      return memory.get(key) ?? null;
    },
    key(index: number) {
      return [...memory.keys()][index] ?? null;
    },
    removeItem(key: string) {
      memory.delete(key);
    },
    setItem(key: string, value: string) {
      memory.set(key, value);
    },
  };
};

export const resolveStorage = (storage?: Storage): Storage => {
  if (storage) {
    return storage;
  }

  if (typeof window !== "undefined") {
    return window.localStorage;
  }

  return createMemoryStorage();
};
