import type { DictionaryLanguage } from "./types";

export const WORDS_CACHE_KEY_PREFIX = "wordle:dictionary";
export const WORDS_CHECKSUM_KEY_PREFIX = "wordle:dictionary:checksum";
export const WORDS_DEFAULT_LANGUAGE: DictionaryLanguage = "es";
export const WORDS_SUPPORTED_LANGUAGES: DictionaryLanguage[] = ["es"];
