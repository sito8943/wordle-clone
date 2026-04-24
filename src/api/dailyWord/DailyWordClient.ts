import {
  DAILY_MEANING_STORAGE_KEY_PREFIX,
  DAILY_WORD_STORAGE_KEY_PREFIX,
  RAE_DAILY_WORD_API_URL,
} from "./constants";
import type { DailyWordClientOptions } from "./types";
import {
  extractDailyMeaningFromResponse,
  extractDailyWordFromResponse,
  normalizeDailyWordDate,
  normalizeDailyWordCandidate,
  normalizeDailyMeaningCandidate,
  resolveDailyMeaningEndpoint,
  resolveStorage,
} from "./utils";

class DailyWordClient {
  private readonly endpoint: string;
  private readonly storage: Storage;
  private readonly fetchFn: typeof fetch;

  constructor(options: DailyWordClientOptions = {}) {
    this.endpoint = options.endpoint ?? RAE_DAILY_WORD_API_URL;
    this.storage = resolveStorage(options.storage);
    this.fetchFn =
      options.fetchFn ??
      (typeof globalThis.fetch === "function"
        ? globalThis.fetch.bind(globalThis)
        : async () => {
            throw new Error("Fetch API is unavailable.");
          });
  }

  getCachedWord(date?: string): string | null {
    const normalizedDate = normalizeDailyWordDate(date);

    try {
      const raw = this.storage.getItem(this.getStorageKey(normalizedDate));
      if (!raw) {
        return null;
      }

      return normalizeDailyWordCandidate(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  cacheWord(word: string, date?: string): void {
    const normalizedDate = normalizeDailyWordDate(date);
    const normalizedWord = normalizeDailyWordCandidate(word);

    if (!normalizedWord) {
      return;
    }

    try {
      this.storage.setItem(
        this.getStorageKey(normalizedDate),
        JSON.stringify(normalizedWord),
      );
    } catch {
      // Ignore storage write errors.
    }
  }

  async getDailyWord(date?: string): Promise<string | null> {
    const normalizedDate = normalizeDailyWordDate(date);
    const cachedWord = this.getCachedWord(normalizedDate);

    if (cachedWord) {
      return cachedWord;
    }

    if (!this.isOnline()) {
      return null;
    }

    try {
      const response = await this.fetchFn(this.endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as unknown;
      const remoteWord = extractDailyWordFromResponse(payload);

      if (!remoteWord) {
        return null;
      }

      this.cacheWord(remoteWord, normalizedDate);
      return remoteWord;
    } catch {
      return null;
    }
  }

  getCachedMeaning(word: string, date?: string): string | null {
    const normalizedDate = normalizeDailyWordDate(date);
    const normalizedWord = normalizeDailyWordCandidate(word);

    if (!normalizedWord) {
      return null;
    }

    try {
      const raw = this.storage.getItem(
        this.getMeaningStorageKey(normalizedDate, normalizedWord),
      );
      if (!raw) {
        return null;
      }

      return normalizeDailyMeaningCandidate(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  cacheMeaning(word: string, meaning: string, date?: string): void {
    const normalizedDate = normalizeDailyWordDate(date);
    const normalizedWord = normalizeDailyWordCandidate(word);
    const normalizedMeaning = normalizeDailyMeaningCandidate(meaning);

    if (!normalizedWord || !normalizedMeaning) {
      return;
    }

    try {
      this.storage.setItem(
        this.getMeaningStorageKey(normalizedDate, normalizedWord),
        JSON.stringify(normalizedMeaning),
      );
    } catch {
      // Ignore storage write errors.
    }
  }

  async getDailyMeaning(word: string, date?: string): Promise<string | null> {
    const normalizedDate = normalizeDailyWordDate(date);
    const normalizedWord = normalizeDailyWordCandidate(word);

    if (!normalizedWord) {
      return null;
    }

    const cachedMeaning = this.getCachedMeaning(normalizedWord, normalizedDate);
    if (cachedMeaning) {
      return cachedMeaning;
    }

    if (!this.isOnline()) {
      return null;
    }

    try {
      const response = await this.fetchFn(
        resolveDailyMeaningEndpoint(this.endpoint, normalizedWord),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as unknown;
      const remoteMeaning = extractDailyMeaningFromResponse(payload);

      if (!remoteMeaning) {
        return null;
      }

      this.cacheMeaning(normalizedWord, remoteMeaning, normalizedDate);
      return remoteMeaning;
    } catch {
      return null;
    }
  }

  private getStorageKey(date: string): string {
    return `${DAILY_WORD_STORAGE_KEY_PREFIX}:${date}`;
  }

  private getMeaningStorageKey(date: string, word: string): string {
    return `${DAILY_MEANING_STORAGE_KEY_PREFIX}:${date}:${word}`;
  }

  private isOnline(): boolean {
    if (typeof navigator === "undefined") {
      return true;
    }

    return navigator.onLine;
  }
}

export { DailyWordClient };
