import { ConvexGateway } from "../convex/ConvexGateway";
import {
  WORDS_CACHE_KEY_PREFIX,
  WORDS_CHECKSUM_KEY_PREFIX,
  WORDS_CHECKSUM_QUERY,
  WORDS_DEFAULT_LANGUAGE,
  WORDS_ENSURE_MUTATION,
  WORDS_LIST_BY_LANGUAGE_QUERY,
} from "./constants";
import type { DictionaryLanguage } from "./types";
import { normalizeWords, resolveStorage } from "./utils";

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
      if (!raw) {
        return [];
      }

      return normalizeWords(JSON.parse(raw));
    } catch {
      return [];
    }
  }

  async loadWords(
    language: DictionaryLanguage = WORDS_DEFAULT_LANGUAGE,
  ): Promise<string[]> {
    const cachedWords = this.getCachedWords(language);
    console.log(cachedWords);
    if (!this.gateway.isConfigured || !this.isOnline()) {
      return cachedWords;
    }

    try {
      await this.gateway.mutation(WORDS_ENSURE_MUTATION, { language });

      if (cachedWords.length > 0) {
        const needsRefresh = await this.checksumMismatch(language);
        if (!needsRefresh) {
          return cachedWords;
        }
      }

      const remoteWords = await this.gateway.query<unknown>(
        WORDS_LIST_BY_LANGUAGE_QUERY,
        { language },
      );
      const normalizedRemoteWords = normalizeWords(remoteWords);

      if (normalizedRemoteWords.length === 0) {
        return cachedWords;
      }

      this.persistWords(language, normalizedRemoteWords);
      return normalizedRemoteWords;
    } catch (error) {
      if (!this.gateway.isNetworkError(error)) {
        throw error;
      }

      return cachedWords;
    }
  }

  private async checksumMismatch(
    language: DictionaryLanguage,
  ): Promise<boolean> {
    try {
      const remote = await this.gateway.query<{
        checksum: number;
        count: number;
      }>(WORDS_CHECKSUM_QUERY, { language });
      console.log(remote);
      const stored = this.getStoredChecksum(language);
      return stored !== remote.checksum;
    } catch {
      return false;
    }
  }

  private getStoredChecksum(language: DictionaryLanguage): number | null {
    try {
      const raw = this.storage.getItem(this.getChecksumKey(language));
      if (!raw) return null;
      return JSON.parse(raw) as number;
    } catch {
      return null;
    }
  }

  private persistWords(language: DictionaryLanguage, words: string[]): void {
    this.storage.setItem(this.getCacheKey(language), JSON.stringify(words));
    this.storage.setItem(
      this.getChecksumKey(language),
      JSON.stringify(this.computeLocalChecksum(words)),
    );
  }

  private computeLocalChecksum(words: string[]): number {
    let hash = 5381;
    const str = words.join(",");
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
      hash = hash >>> 0;
    }
    return hash;
  }

  private getCacheKey(language: DictionaryLanguage): string {
    return `${WORDS_CACHE_KEY_PREFIX}:${language}`;
  }

  private getChecksumKey(language: DictionaryLanguage): string {
    return `${WORDS_CHECKSUM_KEY_PREFIX}:${language}`;
  }

  private isOnline(): boolean {
    if (typeof navigator === "undefined") {
      return true;
    }

    return navigator.onLine;
  }
}

export { WordDictionaryClient };
