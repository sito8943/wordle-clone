import { SCOREBOARD_MODE_IDS, type PlayerLanguage } from "@domain/wordle";
import type {
  RemoteScore,
  RemoteScoresResponse,
  ScoreEntry,
  StoredScore,
  TopScoresResult,
} from "./types";

const decorateRemoteScore = (
  remote: RemoteScore,
  defaults: { language: PlayerLanguage },
): ScoreEntry => ({
  id: remote.id,
  nick: remote.nick,
  language: remote.language ?? defaults.language,
  modeId: remote.modeId ?? SCOREBOARD_MODE_IDS.CLASSIC,
  score: remote.score,
  streak: remote.streak ?? 0,
  hasWonDailyToday: remote.hasWonDailyToday,
  hasDailyShieldAvailableToday: remote.hasDailyShieldAvailableToday,
  createdAt: remote.createdAt,
  source: "convex",
  isCurrentClient: remote.isCurrentClient ?? false,
});

export const decorateTopScoresResponse = (
  response: RemoteScoresResponse,
  defaults: { language: PlayerLanguage },
): TopScoresResult => ({
  scores: response.scores.map((score) => decorateRemoteScore(score, defaults)),
  source: "convex",
  currentClientRank: response.currentClientRank ?? null,
  currentClientEntry: response.currentClientEntry
    ? decorateRemoteScore(response.currentClientEntry, defaults)
    : null,
});

export const scoreSorter = (
  a: Pick<StoredScore, "score" | "createdAt">,
  b: Pick<StoredScore, "score" | "createdAt">,
) => {
  if (a.score !== b.score) {
    return b.score - a.score;
  }

  return a.createdAt - b.createdAt;
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
