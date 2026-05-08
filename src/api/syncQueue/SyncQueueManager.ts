import type { StoredRoundSyncEvent, StoredScore } from "@api/score";

const ROUND_EVENTS_KEY = "wordle:sync-events";
const PENDING_SCORES_KEY = "wordle:scoreboard:pending";

const resolveStorage = (storage?: Storage): Storage => {
  if (storage) return storage;
  if (typeof window !== "undefined") return window.localStorage;
  const memory = new Map<string, string>();
  return {
    get length() {
      return memory.size;
    },
    clear: () => memory.clear(),
    getItem: (key: string) => memory.get(key) ?? null,
    key: (i: number) => [...memory.keys()][i] ?? null,
    removeItem: (key: string) => {
      memory.delete(key);
    },
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
  } as Storage;
};

class SyncQueueManager {
  private readonly storage: Storage;

  constructor(storage?: Storage) {
    this.storage = resolveStorage(storage);
  }

  enqueueRoundEvent(event: StoredRoundSyncEvent): void {
    const queue = this.readRoundEvents();
    const next = queue.filter((entry) => entry.id !== event.id);
    next.push(event);
    this.writeRoundEvents(next);
  }

  readRoundEvents(): StoredRoundSyncEvent[] {
    return this.readJsonArray<StoredRoundSyncEvent>(ROUND_EVENTS_KEY);
  }

  writeRoundEvents(events: StoredRoundSyncEvent[]): void {
    const sorted = [...events].sort(
      (left, right) => left.happenedAt - right.happenedAt,
    );
    this.write(ROUND_EVENTS_KEY, JSON.stringify(sorted));
  }

  removeRoundEvents(ids: string[]): void {
    if (ids.length === 0) return;
    const ignored = new Set(ids);
    const next = this.readRoundEvents().filter(
      (entry) => !ignored.has(entry.id),
    );
    this.writeRoundEvents(next);
  }

  clearRoundEvents(): void {
    this.remove(ROUND_EVENTS_KEY);
  }

  enqueuePendingScore(score: StoredScore): void {
    const queue = this.readPendingScores();
    const next = queue.filter((entry) => entry.localId !== score.localId);
    next.push(score);
    this.writePendingScores(next);
  }

  readPendingScores(): StoredScore[] {
    return this.readJsonArray<StoredScore>(PENDING_SCORES_KEY);
  }

  writePendingScores(scores: StoredScore[]): void {
    this.write(PENDING_SCORES_KEY, JSON.stringify(scores));
  }

  removePendingScore(localId: string): void {
    const next = this.readPendingScores().filter(
      (entry) => entry.localId !== localId,
    );
    this.writePendingScores(next);
  }

  clearPendingScores(): void {
    this.remove(PENDING_SCORES_KEY);
  }

  private readJsonArray<T>(key: string): T[] {
    try {
      const raw = this.storage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  private write(key: string, value: string): void {
    try {
      this.storage.setItem(key, value);
    } catch {
      /* swallow */
    }
  }

  private remove(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch {
      /* swallow */
    }
  }
}

export { SyncQueueManager };
export { ROUND_EVENTS_KEY, PENDING_SCORES_KEY };
