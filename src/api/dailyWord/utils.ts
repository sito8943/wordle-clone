import {
  ACCENTED_LETTER_REPLACEMENTS,
  DAILY_WORD_DATE_PATTERN,
} from "./constants";
import type { DailyWordMeaningResponse, DailyWordResponse } from "./types";

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

export const extractDailyMeaningFromResponse = (
  payload: unknown,
): string | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const maybeResponse = payload as DailyWordMeaningResponse;

  if (!Array.isArray(maybeResponse.data?.meanings)) {
    return null;
  }

  for (const meaning of maybeResponse.data.meanings) {
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

const DAILY_PATH_SUFFIX = "/daily";

const toWordsPath = (path: string, normalizedWord: string): string => {
  const sanitizedPath = path.replace(/\/+$/, "");
  const basePath = sanitizedPath.endsWith(DAILY_PATH_SUFFIX)
    ? sanitizedPath.slice(0, -DAILY_PATH_SUFFIX.length)
    : sanitizedPath;

  return `${basePath}/words/${encodeURIComponent(normalizedWord.toLowerCase())}`;
};

export const resolveDailyMeaningEndpoint = (
  endpoint: string,
  word: string,
): string => {
  const normalizedWord = normalizeDailyWordCandidate(word);

  if (!normalizedWord) {
    return endpoint;
  }

  try {
    const sentinelBase = "https://wordle-local.invalid";
    const parsedEndpoint = new URL(endpoint, sentinelBase);
    parsedEndpoint.pathname = toWordsPath(parsedEndpoint.pathname, normalizedWord);
    parsedEndpoint.search = "";
    parsedEndpoint.hash = "";

    return parsedEndpoint.origin === sentinelBase
      ? parsedEndpoint.pathname
      : parsedEndpoint.toString();
  } catch {
    return toWordsPath(endpoint, normalizedWord);
  }
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
