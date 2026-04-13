import { ConvexGateway } from "../convex/ConvexGateway";
import {
  WORDS_CACHE_KEY_PREFIX,
  WORDS_CHECKSUM_KEY_PREFIX,
  WORDS_DEFAULT_LANGUAGE,
  WORDS_ENSURE_MUTATION,
  WORDS_REFRESH_CHECKSUM_MUTATION,
  WORDS_LANGUAGE_CHECKSUM_QUERY,
  WORDS_LIST_BY_LANGUAGE_QUERY,
} from "./constants";
import type { DictionaryLanguage } from "./types";
import {
  normalizeDictionaryLanguage,
  normalizeWords,
  resolveStorage,
} from "./utils";

type RemoteChecksum = { checksum: number; updatedAt: number };

class WordDictionaryClient {
  private readonly gateway: ConvexGateway;
  private readonly storage: Storage;

  constructor(gateway: ConvexGateway, storage?: Storage) {
    this.gateway = gateway;
    this.storage = resolveStorage(storage);
  }

  getCachedWords(
    language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE,
  ): string[] {
    const normalizedLanguage = normalizeDictionaryLanguage(language);

    try {
      const raw = this.storage.getItem(this.getCacheKey(normalizedLanguage));
      if (!raw) return [];
      return normalizeWords(JSON.parse(raw));
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

    return this.gateway.query<RemoteChecksum | null>(
      WORDS_LANGUAGE_CHECKSUM_QUERY,
      { language: normalizedLanguage },
    );
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

    return this.gateway.mutation<RemoteChecksum>(
      WORDS_REFRESH_CHECKSUM_MUTATION,
      { language: normalizedLanguage },
    );
  }

  async loadWords(
    language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE,
  ): Promise<string[]> {
    const normalizedLanguage = normalizeDictionaryLanguage(language);
    const cachedWords = this.getCachedWords(normalizedLanguage);

    if (cachedWords.length > 0) {
      return cachedWords;
    }

    if (!this.gateway.isConfigured || !this.isOnline()) {
      return cachedWords;
    }

    try {
      await this.gateway.mutation(WORDS_ENSURE_MUTATION, {
        language: normalizedLanguage,
      });

      const [remoteWords, remoteChecksum] = await Promise.all([
        this.gateway.query<unknown>(WORDS_LIST_BY_LANGUAGE_QUERY, {
          language: normalizedLanguage,
        }),
        this.fetchRemoteChecksum(normalizedLanguage),
      ]);

      const normalizedRemoteWords = normalizeWords(remoteWords);

      if (normalizedRemoteWords.length === 0) {
        return cachedWords;
      }

      this.storage.setItem(
        this.getCacheKey(normalizedLanguage),
        JSON.stringify(normalizedRemoteWords),
      );
      if (remoteChecksum) {
        this.storage.setItem(
          this.getChecksumKey(normalizedLanguage),
          JSON.stringify(remoteChecksum.checksum),
        );
      }

      return normalizedRemoteWords;
    } catch (error) {
      if (!this.gateway.isNetworkError(error)) {
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
