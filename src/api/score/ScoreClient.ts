import { ConvexGateway } from "../convex/ConvexGateway";
import type { RecordScoreInput, ScoreEntry, TopScoresResult } from "./types";

const SCOREBOARD_CACHE_KEY = "wordle:scoreboard:cache";
const SCOREBOARD_PENDING_KEY = "wordle:scoreboard:pending";
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const ADD_SCORE_MUTATION = "scores:addScore";
const LIST_TOP_SCORES_QUERY = "scores:listTopScores";

type StoredScore = {
  localId: string;
  nick: string;
  score: number;
  createdAt: number;
};

type RemoteScore = {
  id: string;
  nick: string;
  score: number;
  createdAt: number;
};

const scoreSorter = (
  a: Pick<StoredScore, "score" | "createdAt">,
  b: Pick<StoredScore, "score" | "createdAt">,
) => {
  if (a.score !== b.score) {
    return b.score - a.score;
  }

  return a.createdAt - b.createdAt;
};

const createMemoryStorage = (): Storage => {
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

const resolveStorage = (storage?: Storage): Storage => {
  if (storage) {
    return storage;
  }

  if (typeof window !== "undefined") {
    return window.localStorage;
  }

  return createMemoryStorage();
};

class ScoreClient {
  private readonly gateway: ConvexGateway;
  private readonly storage: Storage;

  constructor(gateway: ConvexGateway, storage?: Storage) {
    this.gateway = gateway;
    this.storage = resolveStorage(storage);
  }

  async recordScore(input: RecordScoreInput): Promise<void> {
    const record: StoredScore = {
      localId: this.createLocalId(input.createdAt),
      nick: this.normalizeNick(input.nick),
      score: this.normalizeScore(input.score),
      createdAt: input.createdAt ?? Date.now(),
    };

    this.addToCache(record);

    if (!this.gateway.isConfigured || !this.isOnline()) {
      this.addToPending(record);
      return;
    }

    try {
      await this.gateway.mutation(ADD_SCORE_MUTATION, {
        nick: record.nick,
        score: record.score,
        createdAt: record.createdAt,
      });
    } catch (error) {
      if (!this.gateway.isNetworkError(error)) {
        throw error;
      }
      this.addToPending(record);
    }
  }

  async listTopScores(limit = DEFAULT_LIMIT): Promise<TopScoresResult> {
    const safeLimit = this.normalizeLimit(limit);

    if (!this.gateway.isConfigured || !this.isOnline()) {
      return {
        scores: this.localTopScores(safeLimit),
        source: "local",
      };
    }

    await this.syncPendingScores();

    try {
      const remoteScores = await this.gateway.query<RemoteScore[]>(
        LIST_TOP_SCORES_QUERY,
        { limit: safeLimit },
      );

      return {
        scores: this.mergeRemoteAndPending(remoteScores, safeLimit),
        source: "convex",
      };
    } catch (error) {
      if (!this.gateway.isNetworkError(error)) {
        throw error;
      }

      return {
        scores: this.localTopScores(safeLimit),
        source: "local",
      };
    }
  }

  private async syncPendingScores(): Promise<void> {
    const pending = this.readScores(SCOREBOARD_PENDING_KEY);

    if (
      pending.length === 0 ||
      !this.gateway.isConfigured ||
      !this.isOnline()
    ) {
      return;
    }

    const stillPending: StoredScore[] = [];
    let networkDown = false;

    for (const entry of pending) {
      if (networkDown) {
        stillPending.push(entry);
        continue;
      }

      try {
        await this.gateway.mutation(ADD_SCORE_MUTATION, {
          nick: entry.nick,
          score: entry.score,
          createdAt: entry.createdAt,
        });
      } catch (error) {
        if (!this.gateway.isNetworkError(error)) {
          throw error;
        }

        networkDown = true;
        stillPending.push(entry);
      }
    }

    this.writeScores(SCOREBOARD_PENDING_KEY, stillPending);
  }

  private localTopScores(limit: number): ScoreEntry[] {
    return this.readScores(SCOREBOARD_CACHE_KEY)
      .sort(scoreSorter)
      .slice(0, limit)
      .map((entry) => ({
        id: entry.localId,
        nick: entry.nick,
        score: entry.score,
        createdAt: entry.createdAt,
        source: "local" as const,
      }));
  }

  private mergeRemoteAndPending(
    remoteScores: RemoteScore[],
    limit: number,
  ): ScoreEntry[] {
    const pending = this.readScores(SCOREBOARD_PENDING_KEY);
    const seen = new Set(remoteScores.map((entry) => this.fingerprint(entry)));

    const remoteEntries: ScoreEntry[] = remoteScores.map((entry) => ({
      id: entry.id,
      nick: entry.nick,
      score: entry.score,
      createdAt: entry.createdAt,
      source: "convex",
    }));

    const pendingEntries: ScoreEntry[] = pending
      .filter((entry) => !seen.has(this.fingerprint(entry)))
      .map((entry) => ({
        id: entry.localId,
        nick: entry.nick,
        score: entry.score,
        createdAt: entry.createdAt,
        source: "local",
      }));

    return [...remoteEntries, ...pendingEntries]
      .sort((a, b) => scoreSorter(a, b))
      .slice(0, limit);
  }

  private addToCache(entry: StoredScore): void {
    const cache = this.readScores(SCOREBOARD_CACHE_KEY);
    if (cache.some((item) => item.localId === entry.localId)) {
      return;
    }

    cache.push(entry);
    cache.sort(scoreSorter);

    this.writeScores(SCOREBOARD_CACHE_KEY, cache.slice(0, 200));
  }

  private addToPending(entry: StoredScore): void {
    const pending = this.readScores(SCOREBOARD_PENDING_KEY);
    if (pending.some((item) => item.localId === entry.localId)) {
      return;
    }

    pending.push(entry);
    this.writeScores(SCOREBOARD_PENDING_KEY, pending);
  }

  private readScores(key: string): StoredScore[] {
    try {
      const raw = this.storage.getItem(key);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(this.isStoredScore);
    } catch {
      return [];
    }
  }

  private writeScores(key: string, scores: StoredScore[]): void {
    this.storage.setItem(key, JSON.stringify(scores));
  }

  private normalizeNick(nick: string): string {
    const trimmed = nick.trim();
    if (trimmed.length === 0) {
      return "Player";
    }

    return trimmed.slice(0, 30);
  }

  private normalizeScore(score: number): number {
    if (!Number.isFinite(score)) {
      return 0;
    }

    return Math.max(0, Math.floor(score));
  }

  private normalizeLimit(limit: number): number {
    if (!Number.isFinite(limit)) {
      return DEFAULT_LIMIT;
    }

    return Math.max(1, Math.min(MAX_LIMIT, Math.floor(limit)));
  }

  private createLocalId(createdAt?: number): string {
    const baseTime = createdAt ?? Date.now();
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return `${baseTime}-${crypto.randomUUID()}`;
    }

    return `${baseTime}-${Math.random().toString(36).slice(2)}`;
  }

  private isStoredScore(value: unknown): value is StoredScore {
    if (!value || typeof value !== "object") {
      return false;
    }

    const candidate = value as Partial<StoredScore>;
    return (
      typeof candidate.localId === "string" &&
      typeof candidate.nick === "string" &&
      typeof candidate.score === "number" &&
      typeof candidate.createdAt === "number"
    );
  }

  private fingerprint(
    entry: Pick<StoredScore, "nick" | "score" | "createdAt">,
  ): string {
    return `${entry.nick}::${entry.score}::${entry.createdAt}`;
  }

  private isOnline(): boolean {
    if (typeof navigator === "undefined") {
      return true;
    }

    return navigator.onLine;
  }
}

export { ScoreClient };
