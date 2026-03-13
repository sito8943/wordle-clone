import { ConvexGateway } from "../convex/ConvexGateway";
import {
  WORDS_CACHE_KEY_PREFIX,
  WORDS_DEFAULT_LANGUAGE,
  WORDS_ENSURE_MUTATION,
  WORDS_LIST_BY_LANGUAGE_QUERY,
} from "./constants";
import type { DictionaryLanguage } from "./types";

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

const normalizeWords = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const unique = new Set<string>();

  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }

    const normalized = item.trim().toLowerCase();
    if (normalized.length > 0) {
      unique.add(normalized);
    }
  }

  return [...unique].sort();
};

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
