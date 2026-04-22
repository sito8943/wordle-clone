import { DAILY_WORD_DATE_PATTERN, DAILY_WORD_FALLBACK } from "./constants";
import { hashGameId } from "./reference";
import type { ResolveDailyAnswerInput } from "./types";

const normalizeWord = (value: string): string => value.trim().toUpperCase();

const normalizeDailyWordDate = (value?: string | null): string => {
  if (typeof value === "string") {
    const normalized = value.trim();
    if (DAILY_WORD_DATE_PATTERN.test(normalized)) {
      return normalized;
    }
  }

  return getTodayDateUTC();
};

const hasDictionaryWord = (words: string[], word: string): boolean => {
  const normalizedWord = normalizeWord(word).toLowerCase();

  return words.some((candidate) => candidate === normalizedWord);
};

export const getTodayDateUTC = (): string => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
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

  if (
    normalizedRemoteWord.length > 0 &&
    (words.length === 0 || hasDictionaryWord(words, normalizedRemoteWord))
  ) {
    return normalizedRemoteWord;
  }

  return resolveDeterministicDailyWord(words, date);
};
