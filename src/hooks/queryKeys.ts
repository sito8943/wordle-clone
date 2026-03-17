import type { DictionaryLanguage } from "@api/words";

const TOP_SCORES_QUERY_KEY = ["scores", "top"] as const;
const DICTIONARY_QUERY_KEY = ["dictionary"] as const;

export const queryKeys = {
  topScores: TOP_SCORES_QUERY_KEY,
  topScoresByLimit: (limit: number) =>
    [...TOP_SCORES_QUERY_KEY, limit] as const,
  dictionary: DICTIONARY_QUERY_KEY,
  dictionaryByLanguage: (language: DictionaryLanguage) =>
    [...DICTIONARY_QUERY_KEY, language] as const,
};
