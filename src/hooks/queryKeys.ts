import type { PlayerLanguage, ScoreboardModeId } from "@domain/wordle";
import type { DictionaryLanguage } from "@api/words";

const TOP_SCORES_QUERY_KEY = ["scores", "top"] as const;
const DICTIONARY_QUERY_KEY = ["dictionary"] as const;
const DICTIONARY_CHECKSUM_QUERY_KEY = ["dictionary", "checksum"] as const;

export const queryKeys = {
  topScores: TOP_SCORES_QUERY_KEY,
  topScoresByLimit: (limit: number) =>
    [...TOP_SCORES_QUERY_KEY, limit] as const,
  topScoresByLimitAndLanguage: (limit: number, language: PlayerLanguage) =>
    [...TOP_SCORES_QUERY_KEY, limit, language] as const,
  topScoresByLimitLanguageAndMode: (
    limit: number,
    language: PlayerLanguage,
    modeId: ScoreboardModeId,
  ) => [...TOP_SCORES_QUERY_KEY, limit, language, modeId] as const,
  dictionary: DICTIONARY_QUERY_KEY,
  dictionaryByLanguage: (language: DictionaryLanguage) =>
    [...DICTIONARY_QUERY_KEY, language] as const,
  dictionaryChecksumByLanguage: (language: DictionaryLanguage) =>
    [...DICTIONARY_CHECKSUM_QUERY_KEY, language] as const,
};
