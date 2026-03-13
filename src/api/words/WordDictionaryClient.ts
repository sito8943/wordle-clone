import { ConvexGateway } from "../convex/ConvexGateway";
import {
  WORDS_CACHE_KEY_PREFIX,
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

    if (cachedWords.length > 0) {
      return cachedWords;
    }

    if (!this.gateway.isConfigured || !this.isOnline()) {
      return cachedWords;
    }

    try {
      await this.gateway.mutation(WORDS_ENSURE_MUTATION, { language });
      const remoteWords = await this.gateway.query<unknown>(
        WORDS_LIST_BY_LANGUAGE_QUERY,
        { language },
      );
      const normalizedRemoteWords = normalizeWords(remoteWords);

      if (normalizedRemoteWords.length === 0) {
        return cachedWords;
      }

      this.storage.setItem(
        this.getCacheKey(language),
        JSON.stringify(normalizedRemoteWords),
      );
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

  private isOnline(): boolean {
    if (typeof navigator === "undefined") {
      return true;
    }

    return navigator.onLine;
  }
}

export { WordDictionaryClient };
