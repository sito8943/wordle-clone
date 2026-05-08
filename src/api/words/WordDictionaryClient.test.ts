import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiNetworkError } from "@api/http";
import type { ApiManager } from "@api";
import { WordDictionaryClient } from "./WordDictionaryClient";
import { WORDS_CACHE_KEY_PREFIX, WORDS_CHECKSUM_KEY_PREFIX } from "./constants";

const LANGUAGE = "es";
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

type WordsManagerMock = ApiManager["words"];

const createWordsManager = (
  overrides: Partial<WordsManagerMock> = {},
): WordsManagerMock =>
  ({
    list: vi.fn().mockResolvedValue(REMOTE_WORDS),
    getChecksum: vi.fn().mockResolvedValue(REMOTE_CHECKSUM),
    ensureSeeded: vi.fn().mockResolvedValue(undefined),
    refreshChecksum: vi.fn().mockResolvedValue(REMOTE_CHECKSUM),
    seed: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }) as unknown as WordsManagerMock;

const createApiManager = (
  options: {
    isConfigured?: boolean;
    words?: Partial<WordsManagerMock>;
  } = {},
): ApiManager =>
  ({
    isConfigured: options.isConfigured ?? true,
    words: createWordsManager(options.words),
  }) as unknown as ApiManager;

describe("WordDictionaryClient", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createStorage();
  });

  describe("getStoredChecksum", () => {
    it("returns null when nothing is stored", () => {
      const client = new WordDictionaryClient(createApiManager(), storage);
      expect(client.getStoredChecksum(LANGUAGE)).toBeNull();
    });

    it("returns the stored checksum value", () => {
      storage.setItem(CHECKSUM_KEY, JSON.stringify(99999));
      const client = new WordDictionaryClient(createApiManager(), storage);
      expect(client.getStoredChecksum(LANGUAGE)).toBe(99999);
    });

    it("returns null when stored value is malformed", () => {
      storage.setItem(CHECKSUM_KEY, "not-json{{{");
      const client = new WordDictionaryClient(createApiManager(), storage);
      expect(client.getStoredChecksum(LANGUAGE)).toBeNull();
    });
  });

  describe("clearCache", () => {
    it("removes both words and checksum from storage", () => {
      storage.setItem(CACHE_KEY, JSON.stringify(["apple"]));
      storage.setItem(CHECKSUM_KEY, JSON.stringify(12345));
      const client = new WordDictionaryClient(createApiManager(), storage);

      client.clearCache(LANGUAGE);

      expect(storage.getItem(CACHE_KEY)).toBeNull();
      expect(storage.getItem(CHECKSUM_KEY)).toBeNull();
    });

    it("does not throw when cache is already empty", () => {
      const client = new WordDictionaryClient(createApiManager(), storage);
      expect(() => client.clearCache(LANGUAGE)).not.toThrow();
    });
  });

  describe("fetchRemoteChecksum", () => {
    it("calls WordsManager.getChecksum with the language", async () => {
      const getChecksum = vi.fn().mockResolvedValue(REMOTE_CHECKSUM);
      const client = new WordDictionaryClient(
        createApiManager({ words: { getChecksum } }),
        storage,
      );

      const result = await client.fetchRemoteChecksum(LANGUAGE);

      expect(getChecksum).toHaveBeenCalledWith(LANGUAGE);
      expect(result).toEqual(REMOTE_CHECKSUM);
    });

    it("normalizes legacy non-spanish language inputs to spanish", async () => {
      const getChecksum = vi.fn().mockResolvedValue(REMOTE_CHECKSUM);
      const client = new WordDictionaryClient(
        createApiManager({ words: { getChecksum } }),
        storage,
      );

      await client.fetchRemoteChecksum("en" as unknown as "es");

      expect(getChecksum).toHaveBeenCalledWith("es");
    });
  });

  describe("refreshRemoteChecksum", () => {
    it("calls WordsManager.refreshChecksum and returns the result", async () => {
      const refreshChecksum = vi.fn().mockResolvedValue(REMOTE_CHECKSUM);
      const client = new WordDictionaryClient(
        createApiManager({ words: { refreshChecksum } }),
        storage,
      );

      const result = await client.refreshRemoteChecksum(LANGUAGE);

      expect(refreshChecksum).toHaveBeenCalledWith(LANGUAGE);
      expect(result).toEqual(REMOTE_CHECKSUM);
    });
  });

  describe("loadWords", () => {
    it("returns cached words without calling the manager", async () => {
      storage.setItem(CACHE_KEY, JSON.stringify(["apple", "berry"]));
      const ensureSeeded = vi.fn();
      const list = vi.fn();
      const client = new WordDictionaryClient(
        createApiManager({ words: { ensureSeeded, list } }),
        storage,
      );

      const words = await client.loadWords(LANGUAGE);

      expect(words).toEqual(["apple", "berry"]);
      expect(ensureSeeded).not.toHaveBeenCalled();
      expect(list).not.toHaveBeenCalled();
    });

    it("fetches words from the backend when cache is empty", async () => {
      const client = new WordDictionaryClient(createApiManager(), storage);

      const words = await client.loadWords(LANGUAGE);

      expect(words).toEqual(REMOTE_WORDS);
      expect(storage.getItem(CACHE_KEY)).toBe(JSON.stringify(REMOTE_WORDS));
    });

    it("stores the remote checksum after fetching words", async () => {
      const client = new WordDictionaryClient(createApiManager(), storage);

      await client.loadWords(LANGUAGE);

      expect(storage.getItem(CHECKSUM_KEY)).toBe(
        JSON.stringify(REMOTE_CHECKSUM.checksum),
      );
    });

    it("returns cached words when backend is not configured", async () => {
      storage.setItem(CACHE_KEY, JSON.stringify(["apple"]));
      const client = new WordDictionaryClient(
        createApiManager({ isConfigured: false }),
        storage,
      );

      const words = await client.loadWords(LANGUAGE);

      expect(words).toEqual(["apple"]);
    });

    it("returns empty array when backend not configured and no cache", async () => {
      const client = new WordDictionaryClient(
        createApiManager({ isConfigured: false }),
        storage,
      );

      const words = await client.loadWords(LANGUAGE);

      expect(words).toEqual([]);
    });

    it("returns cached words on network error", async () => {
      storage.setItem(CACHE_KEY, JSON.stringify(["apple"]));
      const ensureSeeded = vi
        .fn()
        .mockRejectedValue(new ApiNetworkError("offline"));
      const client = new WordDictionaryClient(
        createApiManager({ words: { ensureSeeded } }),
        storage,
      );

      const words = await client.loadWords(LANGUAGE);

      expect(words).toEqual(["apple"]);
    });

    it("does not cache when backend returns empty list", async () => {
      const list = vi.fn().mockResolvedValue([]);
      const client = new WordDictionaryClient(
        createApiManager({ words: { list } }),
        storage,
      );

      const words = await client.loadWords(LANGUAGE);

      expect(words).toEqual([]);
      expect(storage.getItem(CACHE_KEY)).toBeNull();
    });

    it("only ensures seeded once per language across multiple loads", async () => {
      const ensureSeeded = vi.fn().mockResolvedValue(undefined);
      const list = vi.fn().mockResolvedValueOnce([]).mockResolvedValue([]);
      const client = new WordDictionaryClient(
        createApiManager({ words: { ensureSeeded, list } }),
        storage,
      );

      await client.loadWords(LANGUAGE);
      await client.loadWords(LANGUAGE);
      await client.loadWords(LANGUAGE);

      expect(ensureSeeded).toHaveBeenCalledTimes(1);
    });
  });
});
