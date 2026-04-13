import { WORDS_DEFAULT_LANGUAGE, WORDS_SUPPORTED_LANGUAGES } from "./constants";
import type { DictionaryLanguage } from "./types";

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

export const normalizeDictionaryLanguage = (
  value: unknown,
): DictionaryLanguage => {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (WORDS_SUPPORTED_LANGUAGES.includes(normalized as DictionaryLanguage)) {
      return normalized as DictionaryLanguage;
    }
  }

  return WORDS_DEFAULT_LANGUAGE;
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

export const normalizeWords = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const unique = new Set<string>();

  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }

    const normalized = item.trim().toLowerCase();
    if (normalized.length > 0) {
      unique.add(normalized);
    }
  }

  return [...unique].sort();
};
