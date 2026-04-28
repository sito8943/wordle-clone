import { beforeEach, describe, expect, it, vi } from "vitest";
import { DailyWordClient } from "./DailyWordClient";
import {
  DAILY_MEANING_STORAGE_KEY_PREFIX,
  RAE_DAILY_WORD_API_URL,
  DAILY_WORD_STORAGE_KEY_PREFIX,
} from "./constants";

const DATE = "2026-04-22";
const PREVIOUS_DATE = "2026-04-21";
const WORD = "LECTURA";
const STORAGE_KEY = `${DAILY_WORD_STORAGE_KEY_PREFIX}:${DATE}`;
const MEANING_STORAGE_KEY =
  `${DAILY_MEANING_STORAGE_KEY_PREFIX}:${DATE}:${WORD}`;
const PREVIOUS_STORAGE_KEY =
  `${DAILY_WORD_STORAGE_KEY_PREFIX}:${PREVIOUS_DATE}`;
const PREVIOUS_MEANING_STORAGE_KEY =
  `${DAILY_MEANING_STORAGE_KEY_PREFIX}:${PREVIOUS_DATE}:PUENTE`;

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

  it("removes previous daily cache entries when a new day is cached", async () => {
    storage.setItem(PREVIOUS_STORAGE_KEY, JSON.stringify("PUENTE"));
    storage.setItem(PREVIOUS_MEANING_STORAGE_KEY, JSON.stringify("Antiguo"));

    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          word: WORD,
          meaning: "Descripción",
        },
      }),
    });
    const client = new DailyWordClient({ storage, fetchFn });

    const dailyWord = await client.getDailyWord(DATE);
    const dailyMeaning = await client.getDailyMeaning(WORD, DATE);

    expect(dailyWord).toBe(WORD);
    expect(dailyMeaning).toBe("Descripción");
    expect(storage.getItem(STORAGE_KEY)).toBe(JSON.stringify(WORD));
    expect(storage.getItem(MEANING_STORAGE_KEY)).toBe(
      JSON.stringify("Descripción"),
    );
    expect(storage.getItem(PREVIOUS_STORAGE_KEY)).toBeNull();
    expect(storage.getItem(PREVIOUS_MEANING_STORAGE_KEY)).toBeNull();
  });

  it("uses configured daily endpoint by default", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: { word: "PUENTE" } }),
    });
    const client = new DailyWordClient({ storage, fetchFn });

    await client.getDailyWord(DATE);

    expect(fetchFn).toHaveBeenCalledWith(RAE_DAILY_WORD_API_URL, {
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

  it("fetches daily meaning from daily payload, normalizes it and caches by day + word", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          word: "LECTURA",
          meaning: "   Acción de leer   ",
        },
      }),
    });
    const client = new DailyWordClient({ storage, fetchFn });

    const meaning = await client.getDailyMeaning(WORD, DATE);

    expect(meaning).toBe("Acción de leer");
    expect(fetchFn).toHaveBeenCalledWith(RAE_DAILY_WORD_API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    expect(storage.getItem(MEANING_STORAGE_KEY)).toBe(
      JSON.stringify("Acción de leer"),
    );
  });

  it("returns cached daily meaning without calling network", async () => {
    storage.setItem(MEANING_STORAGE_KEY, JSON.stringify("Acción de leer"));
    const fetchFn = vi.fn();
    const client = new DailyWordClient({ storage, fetchFn });

    const meaning = await client.getDailyMeaning(WORD, DATE);

    expect(meaning).toBe("Acción de leer");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("supports daily payloads that provide meaning as data.meanings", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          word: "LECTURA",
          meanings: [
            {
              senses: [{ description: "Descripción desde senses" }],
            },
          ],
        },
      }),
    });
    const client = new DailyWordClient({ storage, fetchFn });

    const meaning = await client.getDailyMeaning(WORD, DATE);

    expect(meaning).toBe("Descripción desde senses");
  });

  it("does not expose the word in URL when fetching meaning", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          word: "LECTURA",
          meaning: "Descripción",
        },
      }),
    });
    const client = new DailyWordClient({ storage, fetchFn });

    await client.getDailyMeaning(WORD, DATE);

    expect(fetchFn).toHaveBeenCalledWith(RAE_DAILY_WORD_API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  });

  it("uses a single network call for daily word and meaning when both are requested", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          word: "LECTURA",
          meaning: "Descripción",
        },
      }),
    });
    const client = new DailyWordClient({ storage, fetchFn });

    const word = await client.getDailyWord(DATE);
    const meaning = await client.getDailyMeaning("LECTURA", DATE);

    expect(word).toBe("LECTURA");
    expect(meaning).toBe("Descripción");
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
