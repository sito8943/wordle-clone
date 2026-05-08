import type { ApiManager } from "@api";
import { ApiNetworkError } from "@api/http";
import {
  WORDS_CACHE_KEY_PREFIX,
  WORDS_CHECKSUM_KEY_PREFIX,
  WORDS_DEFAULT_LANGUAGE,
} from "./constants";
import type { DictionaryLanguage } from "./types";
import { normalizeDictionaryLanguage, resolveStorage } from "./utils";

type RemoteChecksum = { checksum: number; updatedAt: number };

class WordDictionaryClient {
  private readonly apiManager: ApiManager;
  private readonly storage: Storage;
  private readonly ensuredLanguages = new Set<DictionaryLanguage>();

  constructor(apiManager: ApiManager, storage?: Storage) {
    this.apiManager = apiManager;
    this.storage = resolveStorage(storage);
  }

  getCachedWords(
    language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE,
  ): string[] {
    const normalizedLanguage = normalizeDictionaryLanguage(language);

    try {
      const raw = this.storage.getItem(this.getCacheKey(normalizedLanguage));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [];
    } catch {
      return [];
    }
  }

  getStoredChecksum(
    language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE,
  ): number | null {
    const normalizedLanguage = normalizeDictionaryLanguage(language);

    try {
      const raw = this.storage.getItem(this.getChecksumKey(normalizedLanguage));
      if (!raw) return null;
      return JSON.parse(raw) as number;
    } catch {
      return null;
    }
  }

  async fetchRemoteChecksum(
    language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE,
  ): Promise<RemoteChecksum | null> {
    const normalizedLanguage = normalizeDictionaryLanguage(language);
    return this.apiManager.words.getChecksum(normalizedLanguage);
  }

  clearCache(language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE): void {
    const normalizedLanguage = normalizeDictionaryLanguage(language);

    this.storage.removeItem(this.getCacheKey(normalizedLanguage));
    this.storage.removeItem(this.getChecksumKey(normalizedLanguage));
  }

  async refreshRemoteChecksum(
    language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE,
  ): Promise<RemoteChecksum> {
    const normalizedLanguage = normalizeDictionaryLanguage(language);
    return this.apiManager.words.refreshChecksum(normalizedLanguage);
  }

  async loadWords(
    language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE,
  ): Promise<string[]> {
    const normalizedLanguage = normalizeDictionaryLanguage(language);
    const cachedWords = this.getCachedWords(normalizedLanguage);

    if (cachedWords.length > 0) {
      return cachedWords;
    }

    if (!this.apiManager.isConfigured || !this.isOnline()) {
      return cachedWords;
    }

    try {
      if (!this.ensuredLanguages.has(normalizedLanguage)) {
        await this.apiManager.words.ensureSeeded(normalizedLanguage);
        this.ensuredLanguages.add(normalizedLanguage);
      }

      const [remoteWords, remoteChecksum] = await Promise.all([
        this.apiManager.words.list(normalizedLanguage),
        this.fetchRemoteChecksum(normalizedLanguage),
      ]);

      if (remoteWords.length === 0) {
        return cachedWords;
      }

      this.storage.setItem(
        this.getCacheKey(normalizedLanguage),
        JSON.stringify(remoteWords),
      );
      if (remoteChecksum) {
        this.storage.setItem(
          this.getChecksumKey(normalizedLanguage),
          JSON.stringify(remoteChecksum.checksum),
        );
      }

      return remoteWords;
    } catch (error) {
      if (!(error instanceof ApiNetworkError)) {
        throw error;
      }
      return cachedWords;
    }
  }

  private getCacheKey(language: DictionaryLanguage): string {
    return `${WORDS_CACHE_KEY_PREFIX}:${language}`;
  }

  private getChecksumKey(language: DictionaryLanguage): string {
    return `${WORDS_CHECKSUM_KEY_PREFIX}:${language}`;
  }

  private isOnline(): boolean {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  }
}

export { WordDictionaryClient };
