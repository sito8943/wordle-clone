import type { PlayerLanguage, ScoreboardModeId } from "@domain/wordle";
import type { DictionaryLanguage } from "@api/words";

const TOP_SCORES_QUERY_KEY = ["scores", "top"] as const;
const DICTIONARY_QUERY_KEY = ["dictionary"] as const;
const DICTIONARY_CHECKSUM_QUERY_KEY = ["dictionary", "checksum"] as const;
const WORDS_QUERY_KEY = ["words"] as const;
const WORDS_CHECKSUM_QUERY_KEY = ["words", "checksum"] as const;
const SCORES_QUERY_KEY = ["scores"] as const;
const PLAYERS_QUERY_KEY = ["players"] as const;
const CHALLENGES_QUERY_KEY = ["challenges"] as const;
const ADMIN_QUERY_KEY = ["admin"] as const;

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
  words: WORDS_QUERY_KEY,
  wordsByLanguage: (language: DictionaryLanguage) =>
    [...WORDS_QUERY_KEY, "list", language] as const,
  wordsChecksumByLanguage: (language: DictionaryLanguage) =>
    [...WORDS_CHECKSUM_QUERY_KEY, language] as const,
  scores: SCORES_QUERY_KEY,
  topScoresV2: (params: {
    limit?: number;
    language?: PlayerLanguage;
    modeId?: ScoreboardModeId;
  }) =>
    [
      ...SCORES_QUERY_KEY,
      "top",
      params.limit ?? null,
      params.language ?? null,
      params.modeId ?? null,
    ] as const,
  players: PLAYERS_QUERY_KEY,
  playerMe: (language?: PlayerLanguage) =>
    [...PLAYERS_QUERY_KEY, "me", language ?? null] as const,
  playerNickAvailability: (nick: string) =>
    [...PLAYERS_QUERY_KEY, "nick-availability", nick] as const,
  playerByCode: (code: string) =>
    [...PLAYERS_QUERY_KEY, "by-code", code] as const,
  challenges: CHALLENGES_QUERY_KEY,
  challengesList: () => [...CHALLENGES_QUERY_KEY, "list"] as const,
  challengesToday: (date: string) =>
    [...CHALLENGES_QUERY_KEY, "today", date] as const,
  challengesProgress: (date: string) =>
    [...CHALLENGES_QUERY_KEY, "progress", date] as const,
  admin: ADMIN_QUERY_KEY,
  adminDbStatus: () => [...ADMIN_QUERY_KEY, "db-status"] as const,
};
