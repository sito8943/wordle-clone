import {
  DAILY_REFERENCE_STORAGE_KEY_PREFIX,
  DAILY_MEANING_STORAGE_KEY_PREFIX,
  DAILY_WORD_STORAGE_KEY_PREFIX,
  RAE_DAILY_WORD_API_URL,
} from "./constants";
import { resolveAnswerFromGameReference } from "@domain/wordle";
import { getWordDictionary } from "@utils/words";
import type { DailyWordClientOptions, DailyWordReference } from "./types";
import {
  extractDailyReferenceFromResponse,
  extractDailyMeaningFromResponse,
  extractDailyWordFromResponse,
  normalizeDailyWordDate,
  normalizeDailyWordCandidate,
  normalizeDailyMeaningCandidate,
  normalizeDailyWordReferenceCandidate,
  resolveStorage,
} from "./utils";

class DailyWordClient {
  private readonly endpoint: string;
  private readonly storage: Storage;
  private readonly fetchFn: typeof fetch;
  private readonly wordMemoryByDate = new Map<string, string>();

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
    const memoryWord = normalizeDailyWordCandidate(
      this.wordMemoryByDate.get(normalizedDate),
    );
    if (memoryWord) {
      return memoryWord;
    }

    try {
      const legacyRaw = this.storage.getItem(
        this.getLegacyWordStorageKey(normalizedDate),
      );
      if (legacyRaw) {
        const legacyWord = normalizeDailyWordCandidate(JSON.parse(legacyRaw));
        if (legacyWord) {
          this.wordMemoryByDate.set(normalizedDate, legacyWord);
          try {
            this.storage.removeItem(this.getLegacyWordStorageKey(normalizedDate));
          } catch {
            // Ignore legacy cache clear errors.
          }
          return legacyWord;
        }
      }
    } catch {
      // Ignore legacy cache read errors.
    }

    const referenceWord = this.resolveWordFromReference(normalizedDate);
    if (referenceWord) {
      this.wordMemoryByDate.set(normalizedDate, referenceWord);
      return referenceWord;
    }

    return null;
  }

  cacheWord(word: string, date?: string): void {
    const normalizedDate = normalizeDailyWordDate(date);
    const normalizedWord = normalizeDailyWordCandidate(word);

    if (!normalizedWord) {
      return;
    }

    try {
      this.clearStaleDailyCacheEntries(normalizedDate);
    } catch {
      // Ignore stale-cache clear errors.
    }

    this.wordMemoryByDate.set(normalizedDate, normalizedWord);

    try {
      this.storage.removeItem(this.getLegacyWordStorageKey(normalizedDate));
    } catch {
      // Ignore legacy cache clear errors.
    }
  }

  getCachedReference(date?: string): DailyWordReference | null {
    const normalizedDate = normalizeDailyWordDate(date);

    try {
      const raw = this.storage.getItem(
        this.getReferenceStorageKey(normalizedDate),
      );
      if (!raw) {
        return null;
      }

      return normalizeDailyWordReferenceCandidate(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  cacheReference(reference: DailyWordReference, date?: string): void {
    const normalizedDate = normalizeDailyWordDate(date);
    const normalizedReference =
      normalizeDailyWordReferenceCandidate(reference);

    if (!normalizedReference) {
      return;
    }

    try {
      this.clearStaleDailyCacheEntries(normalizedDate);
    } catch {
      // Ignore stale-cache clear errors.
    }

    try {
      this.storage.setItem(
        this.getReferenceStorageKey(normalizedDate),
        JSON.stringify(normalizedReference),
      );
    } catch {
      // Ignore storage write errors.
    }
  }

  async getDailyReference(date?: string): Promise<DailyWordReference | null> {
    const normalizedDate = normalizeDailyWordDate(date);
    const cachedReference = this.getCachedReference(normalizedDate);

    if (cachedReference) {
      return cachedReference;
    }

    const dailyPayload = await this.fetchDailyPayload();
    if (!dailyPayload) {
      return null;
    }

    this.storeDailyPayload(dailyPayload, normalizedDate);
    return dailyPayload.reference;
  }

  async getDailyWord(date?: string): Promise<string | null> {
    const normalizedDate = normalizeDailyWordDate(date);
    const cachedWord = this.getCachedWord(normalizedDate);

    if (cachedWord) {
      return cachedWord;
    }

    const dailyPayload = await this.fetchDailyPayload();
    if (!dailyPayload) {
      return null;
    }

    this.storeDailyPayload(dailyPayload, normalizedDate);

    if (dailyPayload.word) {
      return dailyPayload.word;
    }

    const referenceWord = this.resolveWordFromReference(normalizedDate);
    if (referenceWord) {
      this.wordMemoryByDate.set(normalizedDate, referenceWord);
      return referenceWord;
    }

    return null;
  }

  getCachedMeaning(word: string, date?: string): string | null {
    const normalizedDate = normalizeDailyWordDate(date);
    const normalizedWord = normalizeDailyWordCandidate(word);

    if (!normalizedWord) {
      return null;
    }

    try {
      const raw = this.storage.getItem(
        this.getMeaningStorageKey(normalizedDate),
      );
      if (raw) {
        const meaning = normalizeDailyMeaningCandidate(JSON.parse(raw));
        if (meaning) {
          return meaning;
        }
      }
    } catch {
      // Ignore current cache read errors.
    }

    try {
      const legacyRaw = this.storage.getItem(
        this.getLegacyMeaningStorageKey(normalizedDate, normalizedWord),
      );
      if (!legacyRaw) {
        return null;
      }

      const legacyMeaning = normalizeDailyMeaningCandidate(
        JSON.parse(legacyRaw),
      );
      if (!legacyMeaning) {
        return null;
      }

      this.cacheMeaning(normalizedWord, legacyMeaning, normalizedDate);
      return legacyMeaning;
    } catch {
      return null;
    }
  }

  cacheMeaning(word: string, meaning: string, date?: string): void {
    const normalizedDate = normalizeDailyWordDate(date);
    const normalizedMeaning = normalizeDailyMeaningCandidate(meaning);

    if (!normalizedMeaning) {
      return;
    }

    try {
      this.clearStaleDailyCacheEntries(normalizedDate);
    } catch {
      // Ignore stale-cache clear errors.
    }

    try {
      this.storage.setItem(
        this.getMeaningStorageKey(normalizedDate),
        JSON.stringify(normalizedMeaning),
      );
    } catch {
      // Ignore storage write errors.
    }

    const normalizedWord = normalizeDailyWordCandidate(word);
    if (!normalizedWord) {
      return;
    }

    try {
      this.storage.removeItem(
        this.getLegacyMeaningStorageKey(normalizedDate, normalizedWord),
      );
    } catch {
      // Ignore legacy cache clear errors.
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

    const dailyPayload = await this.fetchDailyPayload();
    if (!dailyPayload) {
      return null;
    }

    this.storeDailyPayload(dailyPayload, normalizedDate);
    if (!dailyPayload.meaning) {
      return null;
    }

    if (dailyPayload.word && dailyPayload.word !== normalizedWord) {
      return null;
    }

    return dailyPayload.meaning;
  }

  private async fetchDailyPayload(): Promise<{
    word: string | null;
    meaning: string | null;
    reference: DailyWordReference | null;
  } | null> {
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
      const remoteReference = extractDailyReferenceFromResponse(payload);
      if (!remoteWord && !remoteReference) {
        return null;
      }

      const remoteMeaning = extractDailyMeaningFromResponse(payload);

      return {
        word: remoteWord,
        meaning: remoteMeaning,
        reference: remoteReference,
      };
    } catch {
      return null;
    }
  }

  private storeDailyPayload(
    payload: {
      word: string | null;
      meaning: string | null;
      reference: DailyWordReference | null;
    },
    date: string,
  ): void {
    if (payload.reference) {
      this.cacheReference(payload.reference, date);
    }

    if (payload.word) {
      this.cacheWord(payload.word, date);
    }

    if (payload.meaning) {
      this.cacheMeaning(payload.word ?? "", payload.meaning, date);
    }
  }

  private resolveWordFromReference(date: string): string | null {
    const reference = this.getCachedReference(date);
    if (!reference) {
      return null;
    }

    return normalizeDailyWordCandidate(
      resolveAnswerFromGameReference(reference, getWordDictionary()),
    );
  }

  private getLegacyWordStorageKey(date: string): string {
    return `${DAILY_WORD_STORAGE_KEY_PREFIX}:${date}`;
  }

  private getReferenceStorageKey(date: string): string {
    return `${DAILY_REFERENCE_STORAGE_KEY_PREFIX}:${date}`;
  }

  private getMeaningStorageKey(date: string): string {
    return `${DAILY_MEANING_STORAGE_KEY_PREFIX}:${date}`;
  }

  private getLegacyMeaningStorageKey(date: string, word: string): string {
    return `${DAILY_MEANING_STORAGE_KEY_PREFIX}:${date}:${word}`;
  }

  private clearStaleDailyCacheEntries(currentDate: string): void {
    const keysToClear: string[] = [];
    const currentReferenceKey = this.getReferenceStorageKey(currentDate);
    const currentMeaningKey = this.getMeaningStorageKey(currentDate);

    for (let index = 0; index < this.storage.length; index += 1) {
      const key = this.storage.key(index);
      if (!key) {
        continue;
      }

      if (key.startsWith(`${DAILY_WORD_STORAGE_KEY_PREFIX}:`)) {
        keysToClear.push(key);
        continue;
      }

      if (
        key.startsWith(`${DAILY_REFERENCE_STORAGE_KEY_PREFIX}:`) &&
        key !== currentReferenceKey
      ) {
        keysToClear.push(key);
        continue;
      }

      if (
        key.startsWith(`${DAILY_MEANING_STORAGE_KEY_PREFIX}:`) &&
        key !== currentMeaningKey
      ) {
        keysToClear.push(key);
      }
    }

    for (const key of keysToClear) {
      this.storage.removeItem(key);
    }

    for (const dateKey of [...this.wordMemoryByDate.keys()]) {
      if (dateKey !== currentDate) {
        this.wordMemoryByDate.delete(dateKey);
      }
    }
  }

  private isOnline(): boolean {
    if (typeof navigator === "undefined") {
      return true;
    }

    return navigator.onLine;
  }
}

export { DailyWordClient };
