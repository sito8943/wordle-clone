import { beforeEach, describe, expect, it, vi } from "vitest";
import { DailyWordClient } from "./DailyWordClient";
import { DAILY_WORD_STORAGE_KEY_PREFIX } from "./constants";

const DATE = "2026-04-22";
const STORAGE_KEY = `${DAILY_WORD_STORAGE_KEY_PREFIX}:${DATE}`;

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

describe("DailyWordClient", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createStorage();
  });

  it("returns cached daily word without calling network", async () => {
    storage.setItem(STORAGE_KEY, JSON.stringify("PUENTE"));
    const fetchFn = vi.fn();
    const client = new DailyWordClient({ storage, fetchFn });

    const word = await client.getDailyWord(DATE);

    expect(word).toBe("PUENTE");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("fetches word from RAE payload and caches it", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: { word: "PÚENTE" } }),
    });
    const client = new DailyWordClient({ storage, fetchFn });

    const word = await client.getDailyWord(DATE);

    expect(word).toBe("PUENTE");
    expect(storage.getItem(STORAGE_KEY)).toBe(JSON.stringify("PUENTE"));
  });

  it("uses local daily proxy endpoint by default", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: { word: "PUENTE" } }),
    });
    const client = new DailyWordClient({ storage, fetchFn });

    await client.getDailyWord(DATE);

    expect(fetchFn).toHaveBeenCalledWith("/api/daily", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  });

  it("returns null when remote payload does not contain a playable word", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: { word: "123" } }),
    });
    const client = new DailyWordClient({ storage, fetchFn });

    const word = await client.getDailyWord(DATE);

    expect(word).toBeNull();
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("returns null when request fails", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error("offline"));
    const client = new DailyWordClient({ storage, fetchFn });

    const word = await client.getDailyWord(DATE);

    expect(word).toBeNull();
  });
});
