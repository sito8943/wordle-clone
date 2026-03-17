import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ConvexGateway } from "../convex/ConvexGateway";
import { WordDictionaryClient } from "./WordDictionaryClient";
import {
  WORDS_CACHE_KEY_PREFIX,
  WORDS_CHECKSUM_KEY_PREFIX,
  WORDS_LANGUAGE_CHECKSUM_QUERY,
  WORDS_LIST_BY_LANGUAGE_QUERY,
} from "./constants";

const LANGUAGE = "en";
const CACHE_KEY = `${WORDS_CACHE_KEY_PREFIX}:${LANGUAGE}`;
const CHECKSUM_KEY = `${WORDS_CHECKSUM_KEY_PREFIX}:${LANGUAGE}`;
const REMOTE_WORDS = ["apple", "berry", "crane"];
const REMOTE_CHECKSUM = { checksum: 42000, updatedAt: 100 };

const createStorage = (): Storage => {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    key(index: number) {
      return [...values.keys()][index] ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
};

const createGateway = (overrides: Partial<ConvexGateway> = {}): ConvexGateway =>
  ({
    isConfigured: true,
    query: vi.fn().mockImplementation((queryName: string) => {
      if (queryName === WORDS_LANGUAGE_CHECKSUM_QUERY) return Promise.resolve(REMOTE_CHECKSUM);
      if (queryName === WORDS_LIST_BY_LANGUAGE_QUERY) return Promise.resolve(REMOTE_WORDS);
      return Promise.resolve(null);
    }),
    mutation: vi.fn().mockResolvedValue(undefined),
    isNetworkError: () => false,
    ...overrides,
  }) as unknown as ConvexGateway;

describe("WordDictionaryClient", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createStorage();
  });

  describe("getStoredChecksum", () => {
    it("returns null when nothing is stored", () => {
      const client = new WordDictionaryClient(createGateway(), storage);
      expect(client.getStoredChecksum(LANGUAGE)).toBeNull();
    });

    it("returns the stored checksum value", () => {
      storage.setItem(CHECKSUM_KEY, JSON.stringify(99999));
      const client = new WordDictionaryClient(createGateway(), storage);
      expect(client.getStoredChecksum(LANGUAGE)).toBe(99999);
    });

    it("returns null when stored value is malformed", () => {
      storage.setItem(CHECKSUM_KEY, "not-json{{{");
      const client = new WordDictionaryClient(createGateway(), storage);
      expect(client.getStoredChecksum(LANGUAGE)).toBeNull();
    });
  });

  describe("clearCache", () => {
    it("removes both words and checksum from storage", () => {
      storage.setItem(CACHE_KEY, JSON.stringify(["apple"]));
      storage.setItem(CHECKSUM_KEY, JSON.stringify(12345));
      const client = new WordDictionaryClient(createGateway(), storage);

      client.clearCache(LANGUAGE);

      expect(storage.getItem(CACHE_KEY)).toBeNull();
      expect(storage.getItem(CHECKSUM_KEY)).toBeNull();
    });

    it("does not throw when cache is already empty", () => {
      const client = new WordDictionaryClient(createGateway(), storage);
      expect(() => client.clearCache(LANGUAGE)).not.toThrow();
    });
  });

  describe("fetchRemoteChecksum", () => {
    it("calls the gateway with the checksum query and language", async () => {
      const query = vi.fn().mockResolvedValue(REMOTE_CHECKSUM);
      const client = new WordDictionaryClient(
        createGateway({ query }),
        storage,
      );

      const result = await client.fetchRemoteChecksum(LANGUAGE);

      expect(query).toHaveBeenCalledWith(WORDS_LANGUAGE_CHECKSUM_QUERY, {
        language: LANGUAGE,
      });
      expect(result).toEqual(REMOTE_CHECKSUM);
    });
  });

  describe("loadWords", () => {
    it("returns cached words without calling the gateway", async () => {
      storage.setItem(CACHE_KEY, JSON.stringify(["apple", "berry"]));
      const gateway = createGateway();
      const client = new WordDictionaryClient(gateway, storage);

      const words = await client.loadWords(LANGUAGE);

      expect(words).toEqual(["apple", "berry"]);
      expect(gateway.query).not.toHaveBeenCalled();
      expect(gateway.mutation).not.toHaveBeenCalled();
    });

    it("fetches words from Convex when cache is empty", async () => {
      const client = new WordDictionaryClient(createGateway(), storage);

      const words = await client.loadWords(LANGUAGE);

      expect(words).toEqual(REMOTE_WORDS);
      expect(storage.getItem(CACHE_KEY)).toBe(JSON.stringify(REMOTE_WORDS));
    });

    it("stores the remote checksum after fetching words", async () => {
      const client = new WordDictionaryClient(createGateway(), storage);

      await client.loadWords(LANGUAGE);

      expect(storage.getItem(CHECKSUM_KEY)).toBe(
        JSON.stringify(REMOTE_CHECKSUM.checksum),
      );
    });

    it("returns cached words when gateway is not configured", async () => {
      storage.setItem(CACHE_KEY, JSON.stringify(["apple"]));
      const client = new WordDictionaryClient(
        createGateway({ isConfigured: false }),
        storage,
      );

      const words = await client.loadWords(LANGUAGE);

      expect(words).toEqual(["apple"]);
    });

    it("returns empty array when offline and no cache", async () => {
      const client = new WordDictionaryClient(
        createGateway({ isConfigured: false }),
        storage,
      );

      const words = await client.loadWords(LANGUAGE);

      expect(words).toEqual([]);
    });

    it("returns cached words on network error", async () => {
      const networkError = new Error("offline");
      storage.setItem(CACHE_KEY, JSON.stringify(["apple"]));
      const client = new WordDictionaryClient(
        createGateway({
          mutation: vi.fn().mockRejectedValue(networkError),
          isNetworkError: (e) => e === networkError,
        }),
        storage,
      );

      const words = await client.loadWords(LANGUAGE);

      expect(words).toEqual(["apple"]);
    });
  });
});
