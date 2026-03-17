import { WORDS_DEFAULT_LANGUAGE } from "@api/words";
import type { DictionaryLanguage } from "@api/words";

const FALLBACK_WORD = "apple";

let currentLanguage: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE;
let currentWords: string[] = [];
let currentWordsSet = new Set<string>();

const normalizeWords = (words: string[]): string[] => {
  const uniqueWords = new Set<string>();

  for (const word of words) {
    const normalized = word.trim().toLowerCase();
    if (normalized.length > 0) {
      uniqueWords.add(normalized);
    }
  }

  return [...uniqueWords].sort();
};

const getStorageKey = (language: DictionaryLanguage): string =>
  `wordle:dictionary:${language}`;

const saveWordsToStorage = (
  words: string[],
  language: DictionaryLanguage,
): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(getStorageKey(language), JSON.stringify(words));
  } catch {
    // Ignore localStorage write errors.
  }
};

const readWordsFromStorage = (language: DictionaryLanguage): string[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(getStorageKey(language));
    if (!raw) {
      return [];
    }

    return normalizeWords(JSON.parse(raw) as string[]);
  } catch {
    return [];
  }
};

const applyWords = (words: string[]): void => {
  currentWords = words;
  currentWordsSet = new Set(words);
};

const ensureWordsLoaded = (): void => {
  if (currentWords.length > 0) {
    return;
  }

  applyWords(readWordsFromStorage(currentLanguage));
};

export const loadWordDictionaryFromCache = (
  language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE,
): string[] => {
  currentLanguage = language;
  const cachedWords = readWordsFromStorage(language);
  applyWords(cachedWords);
  return cachedWords;
};

export const setWordDictionary = (
  words: string[],
  language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE,
): string[] => {
  currentLanguage = language;
  const normalized = normalizeWords(words);
  applyWords(normalized);
  saveWordsToStorage(normalized, language);
  return normalized;
};

export const getWordDictionary = (): string[] => {
  ensureWordsLoaded();
  return currentWords;
};

export const hasWordDictionary = (): boolean => {
  ensureWordsLoaded();
  return currentWords.length > 0;
};

export function getRandomWord(): string {
  ensureWordsLoaded();

  if (currentWords.length === 0) {
    return FALLBACK_WORD.toUpperCase();
  }

  return currentWords[
    Math.floor(Math.random() * currentWords.length)
  ].toUpperCase();
}

export function isValidWord(word: string): boolean {
  ensureWordsLoaded();
  const normalized = word.toLowerCase();

  if (currentWords.length === 0) {
    return normalized.length === 5;
  }

  return currentWordsSet.has(normalized);
}
