import { beforeEach, describe, expect, it } from "vitest";
import { ScoreClient } from "./ScoreClient";
import {
  SCOREBOARD_CACHE_KEY,
  SCOREBOARD_CLIENT_ID_KEY,
  SCOREBOARD_PROFILE_IDENTITY_KEY,
} from "./constants";

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

describe("ScoreClient", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createStorage();
  });

  it("creates and persists a stable clientId on construction", () => {
    const client = new ScoreClient(storage);
    const stored = storage.getItem(SCOREBOARD_CLIENT_ID_KEY);
    expect(stored).toBeTruthy();
    expect(stored?.length).toBeGreaterThan(0);

    new ScoreClient(storage);
    expect(storage.getItem(SCOREBOARD_CLIENT_ID_KEY)).toBe(stored);
    void client;
  });

  it("returns zero snapshot when no cached score exists", () => {
    const client = new ScoreClient(storage);
    expect(client.getCurrentClientScoreSnapshot("en", "classic")).toEqual({
      score: 0,
      streak: 0,
    });
  });

  it("cachePlayerScore stores a current-client row per language and mode", () => {
    const client = new ScoreClient(storage);
    client.cachePlayerScore({
      nick: "Ana",
      language: "en",
      modeId: "classic",
      score: 12,
      streak: 2,
      createdAt: 1000,
    });

    expect(client.getCurrentClientScoreSnapshot("en", "classic")).toEqual({
      score: 12,
      streak: 2,
    });
    expect(client.getCurrentClientScoreSnapshot("en", "lightning")).toEqual({
      score: 0,
      streak: 0,
    });
  });

  it("cachePlayerScore with overwriteExisting replaces the previous entry", () => {
    const client = new ScoreClient(storage);
    client.cachePlayerScore({
      nick: "Ana",
      language: "en",
      modeId: "classic",
      score: 99,
      streak: 7,
      createdAt: 1000,
    });
    client.cachePlayerScore({
      nick: "Ana",
      language: "en",
      modeId: "classic",
      score: 5,
      streak: 1,
      createdAt: 2000,
      overwriteExisting: true,
    });

    expect(client.getCurrentClientScoreSnapshot("en", "classic")).toEqual({
      score: 5,
      streak: 1,
    });
  });

  it("adoptRecoveredIdentity writes profile identity and replaces current-browser scores", () => {
    const client = new ScoreClient(storage);

    client.adoptRecoveredIdentity({
      id: "remote-player",
      clientId: null,
      clientRecordId: "remote-record",
      nick: "Recovered",
      playerCode: "ZX90",
      language: "en",
      score: 4,
      streak: 1,
      progressByMode: {
        classic: { score: 4, streak: 1, updatedAt: 1000 },
        lightning: { score: 2, streak: 1, updatedAt: 1500 },
        daily: { score: 1, streak: 1, updatedAt: 2000 },
      },
      difficulty: "normal",
      keyboardPreference: "onscreen",
      createdAt: 1000,
    });

    const identityRaw = storage.getItem(SCOREBOARD_PROFILE_IDENTITY_KEY) ?? "";
    expect(JSON.parse(identityRaw)).toEqual({
      clientRecordId: "remote-record",
    });

    expect(client.getCurrentClientScoreSnapshot("en", "classic")).toEqual({
      score: 4,
      streak: 1,
    });
    expect(client.getCurrentClientScoreSnapshot("en", "lightning")).toEqual({
      score: 2,
      streak: 1,
    });
    expect(client.getCurrentClientScoreSnapshot("en", "daily")).toEqual({
      score: 1,
      streak: 1,
    });
  });

  it("adoptRecoveredIdentity drops previous-browser entries when mergeCurrentBrowserProgress=false", () => {
    const client = new ScoreClient(storage);
    const currentClientId = storage.getItem(SCOREBOARD_CLIENT_ID_KEY) ?? "";

    storage.setItem(
      SCOREBOARD_CACHE_KEY,
      JSON.stringify([
        {
          localId: "old-record",
          clientId: currentClientId,
          nick: "Old Local",
          language: "en",
          modeId: "classic",
          score: 90,
          streak: 12,
          createdAt: 3000,
        },
      ]),
    );

    client.adoptRecoveredIdentity(
      {
        id: "remote-player",
        clientId: null,
        clientRecordId: "remote-record",
        nick: "Recovered",
        playerCode: "ZX90",
        language: "en",
        score: 4,
        streak: 1,
        progressByMode: {
          classic: { score: 4, streak: 1, updatedAt: 1000 },
        },
        difficulty: "normal",
        keyboardPreference: "onscreen",
        createdAt: 1000,
      },
      { mergeCurrentBrowserProgress: false },
    );

    const cache = JSON.parse(storage.getItem(SCOREBOARD_CACHE_KEY) || "[]");
    expect(
      cache.some((entry: { nick?: string }) => entry.nick === "Old Local"),
    ).toBe(false);
    expect(client.getCurrentClientScoreSnapshot("en", "classic")).toEqual({
      score: 4,
      streak: 1,
    });
  });

  it("adoptRecoveredIdentity prefers higher local score when merging current-browser progress", () => {
    const client = new ScoreClient(storage);
    const currentClientId = storage.getItem(SCOREBOARD_CLIENT_ID_KEY) ?? "";

    client.cachePlayerScore({
      nick: "Ana",
      language: "en",
      modeId: "classic",
      score: 50,
      streak: 5,
      createdAt: 5000,
      overwriteExisting: true,
    });
    void currentClientId;

    client.adoptRecoveredIdentity({
      id: "remote-player",
      clientId: null,
      clientRecordId: "remote-record",
      nick: "Ana",
      playerCode: "AB12",
      language: "en",
      score: 10,
      streak: 1,
      progressByMode: {
        classic: { score: 10, streak: 1, updatedAt: 1000 },
      },
      difficulty: "normal",
      keyboardPreference: "onscreen",
      createdAt: 1000,
    });

    expect(client.getCurrentClientScoreSnapshot("en", "classic")).toEqual({
      score: 50,
      streak: 5,
    });
  });
});
