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
import { normalizeWords, resolveStorage } from "./utils";

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
    try {
      const raw = this.storage.getItem(this.getCacheKey(language));
      if (!raw) return [];
      return normalizeWords(JSON.parse(raw));
    } catch {
      return [];
    }
  }

  getStoredChecksum(
    language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE,
  ): number | null {
    try {
      const raw = this.storage.getItem(this.getChecksumKey(language));
      if (!raw) return null;
      return JSON.parse(raw) as number;
    } catch {
      return null;
    }
  }

  async fetchRemoteChecksum(
    language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE,
  ): Promise<RemoteChecksum | null> {
    return this.gateway.query<RemoteChecksum | null>(
      WORDS_LANGUAGE_CHECKSUM_QUERY,
      { language },
    );
  }

  clearCache(language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE): void {
    this.storage.removeItem(this.getCacheKey(language));
    this.storage.removeItem(this.getChecksumKey(language));
  }

  async refreshRemoteChecksum(
    language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE,
  ): Promise<RemoteChecksum> {
    return this.gateway.mutation<RemoteChecksum>(
      WORDS_REFRESH_CHECKSUM_MUTATION,
      { language },
    );
  }

  async loadWords(
    language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE,
  ): Promise<string[]> {
    const cachedWords = this.getCachedWords(language);

    if (cachedWords.length > 0) {
      return cachedWords;
    }

    if (!this.gateway.isConfigured || !this.isOnline()) {
      return cachedWords;
    }

    try {
      await this.gateway.mutation(WORDS_ENSURE_MUTATION, { language });

      const [remoteWords, remoteChecksum] = await Promise.all([
        this.gateway.query<unknown>(WORDS_LIST_BY_LANGUAGE_QUERY, { language }),
        this.fetchRemoteChecksum(language),
      ]);

      const normalizedRemoteWords = normalizeWords(remoteWords);

      if (normalizedRemoteWords.length === 0) {
        return cachedWords;
      }

      this.storage.setItem(
        this.getCacheKey(language),
        JSON.stringify(normalizedRemoteWords),
      );
      if (remoteChecksum) {
        this.storage.setItem(
          this.getChecksumKey(language),
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
