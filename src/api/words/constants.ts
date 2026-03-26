import type { DictionaryLanguage } from "./types";

export const WORDS_CACHE_KEY_PREFIX = "wordle:dictionary";
export const WORDS_CHECKSUM_KEY_PREFIX = "wordle:dictionary:checksum";
export const WORDS_DEFAULT_LANGUAGE: DictionaryLanguage = "en";
export const WORDS_SUPPORTED_LANGUAGES: DictionaryLanguage[] = ["en", "es"];

export const WORDS_ENSURE_MUTATION = "words:ensureLanguageSeeded";
export const WORDS_SEED_LANGUAGE_MUTATION = "words:seedLanguageWords";
export const WORDS_REFRESH_CHECKSUM_MUTATION = "words:refreshLanguageChecksum";
export const WORDS_LIST_BY_LANGUAGE_QUERY = "words:listByLanguage";
export const WORDS_LANGUAGE_CHECKSUM_QUERY = "words:getLanguageChecksum";
