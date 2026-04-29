import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ConvexGateway } from "../convex/ConvexGateway";
import { ScoreClient } from "./ScoreClient";
import {
  SCOREBOARD_CACHE_KEY,
  SCOREBOARD_CLIENT_ID_KEY,
  SCOREBOARD_PENDING_KEY,
  SCOREBOARD_PROFILE_IDENTITY_KEY,
  SYNC_ROUND_EVENTS_MUTATION,
  UPDATE_SCORE_MUTATION,
  WORDLE_SYNC_EVENTS_KEY,
} from "./constants";
import type { ScoreClientGatewayOverrides } from "./types";

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

const createGateway = (
  overrides: ScoreClientGatewayOverrides = {},
): ConvexGateway =>
  ({
    isConfigured: overrides.isConfigured ?? false,
    query: overrides.query ?? vi.fn().mockResolvedValue([]),
    mutation: overrides.mutation ?? vi.fn().mockResolvedValue(undefined),
    isNetworkError: overrides.isNetworkError ?? (() => false),
  }) as unknown as ConvexGateway;

describe("ScoreClient", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createStorage();
  });

  it("keeps one local row per nick and updates the score", async () => {
    const client = new ScoreClient(createGateway(), storage);

    await client.recordScore({
      nick: "CITO",
      score: 5,
      streak: 1,
      createdAt: 1000,
    });
    await client.recordScore({
      nick: "cito",
      score: 9,
      streak: 2,
      createdAt: 2000,
    });
    storage.setItem(SCOREBOARD_CLIENT_ID_KEY, "other-client");
    const otherClient = new ScoreClient(createGateway(), storage);
    await otherClient.recordScore({
      nick: "ANA",
      score: 12,
      streak: 4,
      createdAt: 1500,
    });

    const result = await client.listTopScores(10);

    expect(result.source).toBe("local");
    expect(result.scores).toHaveLength(2);

    const cito = result.scores.find(
      (entry) => entry.nick.toLowerCase() === "cito",
    );
    expect(cito?.score).toBe(9);
    expect(cito?.streak).toBe(2);
  });

  it("keeps separate local scoreboards for classic, lightning and daily modes", async () => {
    const client = new ScoreClient(createGateway(), storage);

    await client.recordScore({
      nick: "CITO",
      score: 12,
      streak: 3,
      modeId: "classic",
      createdAt: 1000,
    });
    await client.recordScore({
      nick: "CITO",
      score: 6,
      streak: 2,
      modeId: "lightning",
      createdAt: 2000,
    });
    await client.recordScore({
      nick: "CITO",
      score: 4,
      streak: 5,
      modeId: "daily",
      createdAt: 3000,
    });

    const classic = await client.listTopScores(10, "en", "classic");
    const lightning = await client.listTopScores(10, "en", "lightning");
    const daily = await client.listTopScores(10, "en", "daily");

    expect(classic.scores).toHaveLength(1);
    expect(classic.scores[0].score).toBe(12);
    expect(classic.scores[0].modeId).toBe("classic");
    expect(lightning.scores).toHaveLength(1);
    expect(lightning.scores[0].score).toBe(6);
    expect(lightning.scores[0].modeId).toBe("lightning");
    expect(daily.scores).toHaveLength(1);
    expect(daily.scores[0].score).toBe(4);
    expect(daily.scores[0].modeId).toBe("daily");
  });

  it("syncs and fetches daily scores remotely when gateway is configured", async () => {
    const query = vi.fn().mockResolvedValue({
      scores: [
        {
          id: "remote-daily",
          nick: "CITO",
          modeId: "daily",
          score: 3,
          streak: 1,
          createdAt: 1000,
        },
      ],
      currentClientRank: null,
      currentClientEntry: null,
    });
    const mutation = vi.fn().mockResolvedValue(undefined);
    const client = new ScoreClient(
      createGateway({
        isConfigured: true,
        query,
        mutation,
      }),
      storage,
    );

    await client.recordScore({
      nick: "CITO",
      score: 3,
      streak: 1,
      modeId: "daily",
      createdAt: 1000,
    });
    const result = await client.listTopScores(10, "en", "daily");
    await client.syncPendingScores();

    expect(result.source).toBe("convex");
    expect(result.scores).toHaveLength(1);
    expect(result.scores[0].modeId).toBe("daily");
    expect(query).toHaveBeenCalledWith(
      "scores:listTopScores",
      expect.objectContaining({
        modeId: "daily",
      }),
    );
    expect(mutation).toHaveBeenCalledWith(
      "scores:addScore",
      expect.objectContaining({
        modeId: "daily",
      }),
    );
  });

  it("keeps local cached daily score visible while remote response is stale", async () => {
    const query = vi.fn().mockResolvedValue({
      scores: [],
      currentClientRank: null,
      currentClientEntry: null,
    });
    const client = new ScoreClient(
      createGateway({
        isConfigured: true,
        query,
        mutation: vi.fn().mockResolvedValue(undefined),
      }),
      storage,
    );

    client.cachePlayerScore({
      nick: "Player",
      language: "en",
      modeId: "daily",
      score: 1,
      streak: 1,
      createdAt: 1000,
      overwriteExisting: true,
    });

    const result = await client.listTopScores(10, "en", "daily");

    expect(result.source).toBe("convex");
    expect(result.scores).toHaveLength(1);
    expect(result.scores[0]).toMatchObject({
      nick: "Player",
      modeId: "daily",
      score: 1,
      streak: 1,
      isCurrentClient: true,
    });
    expect(result.currentClientEntry?.nick).toBe("Player");
  });

  it("falls back to local scores when remote mode does not match the requested mode", async () => {
    const query = vi.fn().mockResolvedValue({
      scores: [
        {
          id: "remote-classic",
          nick: "CITO",
          modeId: "classic",
          score: 90,
          streak: 3,
          createdAt: 1000,
        },
      ],
      currentClientRank: 1,
      currentClientEntry: {
        id: "remote-classic-me",
        nick: "CITO",
        modeId: "classic",
        score: 90,
        streak: 3,
        createdAt: 1000,
        isCurrentClient: true,
      },
    });

    const client = new ScoreClient(
      createGateway({
        isConfigured: true,
        query,
        mutation: vi.fn().mockResolvedValue(undefined),
      }),
      storage,
    );

    await client.recordScore({
      nick: "CITO",
      score: 3,
      streak: 1,
      modeId: "daily",
      createdAt: 2000,
    });

    const result = await client.listTopScores(10, "en", "daily");

    expect(result.source).toBe("local");
    expect(result.scores).toHaveLength(1);
    expect(result.scores[0].modeId).toBe("daily");
    expect(result.scores[0].score).toBe(3);
    expect(result.currentClientRank).toBe(1);
  });

  it("merges remote and pending rows without duplicating the same nick", async () => {
    const networkError = new Error("Network offline");
    const query = vi.fn().mockResolvedValue([
      { id: "remote-cito", nick: "CITO", score: 7, streak: 3, createdAt: 1000 },
      { id: "remote-ana", nick: "ANA", score: 11, streak: 5, createdAt: 1001 },
    ]);
    const mutation = vi.fn().mockRejectedValue(networkError);

    const client = new ScoreClient(
      createGateway({
        isConfigured: true,
        query,
        mutation,
        isNetworkError: (error) => error === networkError,
      }),
      storage,
    );

    await client.recordScore({
      nick: "CITO",
      score: 10,
      streak: 6,
      createdAt: 2000,
    });

    const result = await client.listTopScores(10);

    expect(result.source).toBe("convex");

    const citoRows = result.scores.filter(
      (entry) => entry.nick.toLowerCase() === "cito",
    );

    expect(citoRows).toHaveLength(1);
    expect(citoRows[0].score).toBe(10);
    expect(citoRows[0].streak).toBe(6);
    expect(citoRows[0].isCurrentClient).toBe(true);
    expect(result.scores).toHaveLength(2);

    expect(query).toHaveBeenCalledTimes(1);
    const queryArgs = query.mock.calls[0]?.[1];
    expect(queryArgs.limit).toBe(10);
    expect(typeof queryArgs.clientId).toBe("string");
    expect(queryArgs.clientId.length).toBeGreaterThan(0);
  });

  it("uses a stable clientId when sending scores", async () => {
    const mutation = vi.fn().mockResolvedValue(undefined);
    const client = new ScoreClient(
      createGateway({
        isConfigured: true,
        mutation,
      }),
      storage,
    );

    await client.recordScore({
      nick: "Sito",
      score: 6,
      streak: 1,
      createdAt: 1000,
    });
    await client.recordScore({
      nick: "Sito",
      score: 9,
      streak: 2,
      createdAt: 2000,
    });

    const firstPayload = mutation.mock.calls[0]?.[1];
    const secondPayload = mutation.mock.calls[1]?.[1];

    expect(typeof firstPayload.clientId).toBe("string");
    expect(firstPayload.clientId.length).toBeGreaterThan(0);
    expect(secondPayload.clientId).toBe(firstPayload.clientId);
  });

  it("keeps the latest streak when score does not increase", async () => {
    const client = new ScoreClient(createGateway(), storage);

    await client.recordScore({
      nick: "Sito",
      score: 10,
      streak: 4,
      createdAt: 1000,
    });
    await client.recordScore({
      nick: "Sito",
      score: 10,
      streak: 0,
      createdAt: 2000,
    });

    const result = await client.listTopScores(10);

    expect(result.scores).toHaveLength(1);
    expect(result.scores[0].score).toBe(10);
    expect(result.scores[0].streak).toBe(0);
  });

  it("overwrites current client score when requested", async () => {
    const client = new ScoreClient(createGateway(), storage);

    await client.recordScore({
      nick: "Sito",
      score: 25,
      streak: 4,
      createdAt: 1000,
    });
    await client.recordScore({
      nick: "Sito",
      score: 3,
      streak: 1,
      createdAt: 2000,
      overwriteExisting: true,
    });

    const result = await client.listTopScores(10);

    expect(result.scores).toHaveLength(1);
    expect(result.scores[0].score).toBe(3);
    expect(result.scores[0].streak).toBe(1);
    expect(result.scores[0].createdAt).toBe(2000);
  });

  it("replaces old nick rows for the current client on overwrite", async () => {
    const client = new ScoreClient(createGateway(), storage);

    await client.recordScore({
      nick: "Sito",
      score: 25,
      streak: 4,
      createdAt: 1000,
    });
    await client.recordScore({
      nick: "Sito #2",
      score: 25,
      streak: 4,
      overwriteExisting: true,
    });

    const result = await client.listTopScores(10);

    expect(result.scores).toHaveLength(1);
    expect(result.scores[0].nick).toBe("Sito #2");
    expect(result.scores[0].createdAt).toBe(1000);
  });

  it("deduplicates legacy local rows for the same local record", async () => {
    const clientId = "client-me";
    storage.setItem(SCOREBOARD_CLIENT_ID_KEY, clientId);
    storage.setItem(
      SCOREBOARD_CACHE_KEY,
      JSON.stringify([
        {
          localId: "shared-local-id",
          clientId,
          nick: "Old Nick",
          score: 20,
          streak: 3,
          createdAt: 1000,
        },
        {
          localId: "shared-local-id",
          clientId,
          nick: "New Nick",
          score: 20,
          streak: 3,
          createdAt: 1000,
        },
      ]),
    );

    const client = new ScoreClient(createGateway(), storage);
    const result = await client.listTopScores(10);

    expect(result.scores).toHaveLength(1);
    expect(result.scores[0].nick).toBe("New Nick");
    expect(result.currentClientEntry?.nick).toBe("New Nick");
  });

  it("syncs pending overwrite scores using update mutation", async () => {
    const networkError = new Error("Network offline");
    const mutation = vi
      .fn()
      .mockRejectedValueOnce(networkError)
      .mockResolvedValueOnce(undefined);
    const query = vi.fn().mockResolvedValue([]);
    const client = new ScoreClient(
      createGateway({
        isConfigured: true,
        query,
        mutation,
        isNetworkError: (error) => error === networkError,
      }),
      storage,
    );

    await client.recordScore(
      {
        nick: "Sito",
        score: 3,
        streak: 1,
        createdAt: 2000,
        overwriteExisting: true,
      },
      UPDATE_SCORE_MUTATION,
    );

    await client.syncPendingScores();

    expect(mutation).toHaveBeenNthCalledWith(
      2,
      UPDATE_SCORE_MUTATION,
      expect.objectContaining({
        nick: "Sito",
        score: 3,
        streak: 1,
        createdAt: 2000,
      }),
    );
  });

  it("returns current client rank metadata from remote response", async () => {
    const query = vi.fn().mockResolvedValue({
      scores: [{ id: "remote-a", nick: "ANA", score: 20, createdAt: 1000 }],
      currentClientRank: 12,
      currentClientEntry: {
        id: "remote-me",
        nick: "Sito #2",
        score: 3,
        streak: 7,
        createdAt: 2000,
        isCurrentClient: true,
      },
    });

    const client = new ScoreClient(
      createGateway({
        isConfigured: true,
        query,
        mutation: vi.fn().mockResolvedValue(undefined),
      }),
      storage,
    );

    const result = await client.listTopScores(10);

    expect(result.currentClientRank).toBe(12);
    expect(result.currentClientEntry?.nick).toBe("Sito #2");
    expect(result.currentClientEntry?.streak).toBe(7);
    expect(result.currentClientEntry?.isCurrentClient).toBe(true);
    expect(result.scores).toHaveLength(1);
  });

  it("keeps the daily-winner shield flag from remote scores", async () => {
    const query = vi.fn().mockResolvedValue({
      scores: [
        {
          id: "remote-a",
          nick: "ANA",
          score: 20,
          streak: 3,
          createdAt: 1000,
          hasWonDailyToday: true,
        },
      ],
      currentClientRank: null,
      currentClientEntry: null,
    });

    const client = new ScoreClient(
      createGateway({
        isConfigured: true,
        query,
        mutation: vi.fn().mockResolvedValue(undefined),
      }),
      storage,
    );

    const result = await client.listTopScores(10);

    expect(result.scores).toHaveLength(1);
    expect(result.scores[0].hasWonDailyToday).toBe(true);
  });

  it("keeps the daily-shield availability flag from remote scores", async () => {
    const query = vi.fn().mockResolvedValue({
      scores: [
        {
          id: "remote-a",
          nick: "ANA",
          score: 20,
          streak: 3,
          createdAt: 1000,
          hasWonDailyToday: true,
          hasDailyShieldAvailableToday: false,
        },
      ],
      currentClientRank: null,
      currentClientEntry: null,
    });

    const client = new ScoreClient(
      createGateway({
        isConfigured: true,
        query,
        mutation: vi.fn().mockResolvedValue(undefined),
      }),
      storage,
    );

    const result = await client.listTopScores(10);

    expect(result.scores).toHaveLength(1);
    expect(result.scores[0].hasDailyShieldAvailableToday).toBe(false);
  });

  it("marks current local rows when daily was won today in storage", async () => {
    const clientId = "client-me";
    const today = new Date().toISOString().slice(0, 10);
    storage.setItem(SCOREBOARD_CLIENT_ID_KEY, clientId);
    storage.setItem(
      "wordle:daily-mode-status",
      JSON.stringify({ date: today, outcome: "won" }),
    );
    storage.setItem(
      SCOREBOARD_CACHE_KEY,
      JSON.stringify([
        {
          localId: "local-me",
          clientId,
          nick: "Sito",
          language: "en",
          modeId: "classic",
          score: 12,
          streak: 2,
          createdAt: 1000,
        },
      ]),
    );

    const client = new ScoreClient(createGateway(), storage);
    const result = await client.listTopScores(10, "en", "classic");

    expect(result.scores).toHaveLength(1);
    expect(result.scores[0].hasWonDailyToday).toBe(true);
  });

  it("marks current local rows with unavailable shield after local shield consumption", async () => {
    const clientId = "client-me";
    const today = new Date().toISOString().slice(0, 10);
    storage.setItem(SCOREBOARD_CLIENT_ID_KEY, clientId);
    storage.setItem(
      "wordle:daily-mode-status",
      JSON.stringify({ date: today, outcome: "won" }),
    );
    storage.setItem(
      "wordle:daily-shield-used",
      JSON.stringify({ date: today, used: true }),
    );
    storage.setItem(
      SCOREBOARD_CACHE_KEY,
      JSON.stringify([
        {
          localId: "local-me",
          clientId,
          nick: "Sito",
          language: "en",
          modeId: "classic",
          score: 12,
          streak: 2,
          createdAt: 1000,
        },
      ]),
    );

    const client = new ScoreClient(createGateway(), storage);
    const result = await client.listTopScores(10, "en", "classic");

    expect(result.scores).toHaveLength(1);
    expect(result.scores[0].hasDailyShieldAvailableToday).toBe(false);
  });

  it("prefers current player scoped shield usage over legacy unscoped daily status", async () => {
    const clientId = "client-me";
    const today = new Date().toISOString().slice(0, 10);
    storage.setItem(SCOREBOARD_CLIENT_ID_KEY, clientId);
    storage.setItem(
      "player",
      JSON.stringify({
        name: "Sito",
        code: "AB12",
      }),
    );
    storage.setItem(
      "wordle:daily-mode-status",
      JSON.stringify({ date: today, outcome: "won" }),
    );
    storage.setItem(
      "wordle:daily-mode-status:AB12",
      JSON.stringify({ date: today, outcome: "won" }),
    );
    storage.setItem(
      "wordle:daily-shield-used:AB12",
      JSON.stringify({ date: today, used: true }),
    );
    storage.setItem(
      SCOREBOARD_CACHE_KEY,
      JSON.stringify([
        {
          localId: "local-me",
          clientId,
          nick: "Sito",
          language: "en",
          modeId: "classic",
          score: 12,
          streak: 2,
          createdAt: 1000,
        },
      ]),
    );

    const client = new ScoreClient(createGateway(), storage);
    const result = await client.listTopScores(10, "en", "classic");

    expect(result.scores).toHaveLength(1);
    expect(result.scores[0].hasDailyShieldAvailableToday).toBe(false);
  });

  it("checks nick availability through remote query", async () => {
    const query = vi.fn().mockResolvedValue(true);
    const client = new ScoreClient(
      createGateway({
        isConfigured: true,
        query,
        mutation: vi.fn().mockResolvedValue(undefined),
      }),
      storage,
    );

    const available = await client.isNickAvailable(" Ana ");

    expect(available).toBe(true);
    expect(query).toHaveBeenCalledWith("scores:isNickAvailable", {
      nick: "Ana",
      clientId: expect.any(String),
    });
  });

  it("falls back to local nick availability when offline", async () => {
    const client = new ScoreClient(
      createGateway({ isConfigured: false }),
      storage,
    );
    const clientId = storage.getItem(SCOREBOARD_CLIENT_ID_KEY) ?? "";

    storage.setItem(
      SCOREBOARD_CACHE_KEY,
      JSON.stringify([
        {
          localId: "other-a",
          clientId: "other-client",
          nick: "Ana",
          score: 8,
          streak: 2,
          createdAt: 1000,
        },
      ]),
    );
    expect(await client.isNickAvailable("ana")).toBe(false);

    storage.setItem(
      SCOREBOARD_CACHE_KEY,
      JSON.stringify([
        {
          localId: "me-a",
          clientId,
          nick: "Ana",
          score: 8,
          streak: 2,
          createdAt: 1000,
        },
      ]),
    );
    expect(await client.isNickAvailable("ana")).toBe(true);
  });

  it("upserts a player profile and adopts the returned identity", async () => {
    const mutation = vi
      .fn()
      .mockResolvedValueOnce({
        id: "remote-player",
        clientId: "remote-client",
        clientRecordId: "remote-record",
        nick: "Ana",
        playerCode: "AB12",
        score: 14,
        streak: 3,
        hasWonDailyToday: true,
        difficulty: "hard",
        keyboardPreference: "native",
        tutorialPromptSeenModes: {
          classic: true,
          lightning: true,
        },
        createdAt: 1000,
      },
    )
      .mockResolvedValueOnce(undefined);
    const client = new ScoreClient(
      createGateway({
        isConfigured: true,
        mutation,
      }),
      storage,
    );

    const profile = await client.upsertPlayerProfile({
      nick: "Ana",
      language: "en",
      score: 14,
      streak: 3,
      difficulty: "hard",
      keyboardPreference: "native",
      tutorialPromptSeenModes: {
        classic: true,
        lightning: true,
      },
    });

    expect(profile.playerCode).toBe("AB12");
    expect(profile.hasWonDailyToday).toBe(true);
    expect(profile.tutorialPromptSeenModes).toEqual({
      classic: true,
      lightning: true,
    });
    expect(mutation).toHaveBeenNthCalledWith(
      1,
      "scores:upsertPlayerProfile",
      expect.objectContaining({
        tutorialPromptSeenModes: {
          classic: true,
          lightning: true,
        },
      }),
    );
    expect(
      JSON.parse(storage.getItem(SCOREBOARD_PROFILE_IDENTITY_KEY) || "{}"),
    ).toEqual({
      clientRecordId: "remote-record",
    });

    await client.recordScore({
      nick: "Ana",
      score: 20,
      streak: 4,
      createdAt: 2000,
    });

    expect(mutation).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.objectContaining({
        clientRecordId: "remote-record",
        nick: "Ana",
        score: 20,
      }),
    );
  });

  it("recovers a player by code and can adopt that identity locally", async () => {
    const query = vi.fn().mockResolvedValue({
      id: "remote-player",
      clientId: "previous-browser",
      clientRecordId: "remote-record",
      nick: "Recovered",
      playerCode: "ZX90",
      score: 40,
      streak: 7,
      progressByMode: {
        classic: { score: 40, streak: 7, updatedAt: 1000 },
        lightning: { score: 15, streak: 4, updatedAt: 1500 },
        daily: { score: 5, streak: 1, updatedAt: 2000 },
      },
      difficulty: "normal",
      keyboardPreference: "onscreen",
      createdAt: 1000,
    });
    const client = new ScoreClient(
      createGateway({
        isConfigured: true,
        query,
        mutation: vi.fn().mockResolvedValue(undefined),
      }),
      storage,
    );

    const profile = await client.recoverPlayerByCode("zx90");
    client.adoptRecoveredIdentity(profile);

    expect(query).toHaveBeenCalledWith("scores:getPlayerByCode", {
      code: "ZX90",
    });

    const cache = JSON.parse(storage.getItem(SCOREBOARD_CACHE_KEY) || "[]");
    expect(cache).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          localId: "remote-record",
          nick: "Recovered",
          modeId: "classic",
          score: 40,
          streak: 7,
        }),
        expect.objectContaining({
          localId: "remote-record",
          nick: "Recovered",
          modeId: "lightning",
          score: 15,
          streak: 4,
        }),
        expect.objectContaining({
          localId: "remote-record",
          nick: "Recovered",
          modeId: "daily",
          score: 5,
          streak: 1,
        }),
      ]),
    );
    expect(client.getCurrentClientScoreSnapshot("en", "lightning")).toEqual({
      score: 15,
      streak: 4,
    });
    expect(client.getCurrentClientScoreSnapshot("en", "daily")).toEqual({
      score: 5,
      streak: 1,
    });
  });

  it("requests top scores using the recovered profile identity", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        id: "remote-player",
        clientId: "previous-browser",
        clientRecordId: "remote-record",
        nick: "Recovered",
        playerCode: "ZX90",
        score: 40,
        streak: 7,
        difficulty: "normal",
        keyboardPreference: "onscreen",
        createdAt: 1000,
      })
      .mockResolvedValueOnce({
        scores: [],
        currentClientRank: null,
        currentClientEntry: null,
      });
    const client = new ScoreClient(
      createGateway({
        isConfigured: true,
        query,
        mutation: vi.fn().mockResolvedValue(undefined),
      }),
      storage,
    );

    const profile = await client.recoverPlayerByCode("zx90");
    client.adoptRecoveredIdentity(profile);
    await client.listTopScores(10);

    expect(query).toHaveBeenNthCalledWith(2, "scores:listTopScores", {
      limit: 10,
      language: "en",
      modeId: "classic",
      clientId: expect.any(String),
      clientRecordId: "remote-record",
    });
  });

  it("requests the current player profile using the provided language", async () => {
    const query = vi.fn().mockResolvedValue({
      id: "remote-player",
      clientId: "remote-client",
      clientRecordId: "remote-record",
      nick: "Ana",
      playerCode: "AB12",
      score: 14,
      streak: 3,
      hasWonDailyToday: true,
      difficulty: "hard",
      keyboardPreference: "native",
      createdAt: 1000,
    });
    const client = new ScoreClient(
      createGateway({
        isConfigured: true,
        query,
        mutation: vi.fn().mockResolvedValue(undefined),
      }),
      storage,
    );

    const profile = await client.getCurrentPlayerProfile("es");

    expect(query).toHaveBeenCalledWith("scores:getCurrentPlayerProfile", {
      clientId: expect.any(String),
      clientRecordId: undefined,
      language: "es",
    });
    expect(profile?.language).toBe("es");
    expect(profile?.hasWonDailyToday).toBe(true);
  });

  it("queues round events locally and syncs them as deltas", async () => {
    const mutation = vi.fn().mockResolvedValue({
      id: "remote-player",
      clientId: "remote-client",
      clientRecordId: "remote-record",
      nick: "Ana",
      playerCode: "AB12",
      score: 24,
      streak: 0,
      difficulty: "normal",
      keyboardPreference: "onscreen",
      createdAt: 2000,
    });
    const client = new ScoreClient(
      createGateway({
        isConfigured: true,
        mutation,
      }),
      storage,
    );

    client.queueRoundEvent({
      id: "win-1",
      kind: "win",
      pointsDelta: 8,
      modeId: "classic",
      happenedAt: 1000,
      version: 2,
    });
    client.queueRoundEvent({
      id: "loss-1",
      kind: "loss",
      modeId: "classic",
      happenedAt: 2000,
      version: 2,
    });

    await client.syncRoundEvents({
      nick: "Ana",
      language: "en",
      difficulty: "normal",
      keyboardPreference: "onscreen",
    });

    expect(mutation).toHaveBeenCalledWith(
      SYNC_ROUND_EVENTS_MUTATION,
      expect.objectContaining({
        nick: "Ana",
        events: [
          {
            id: "win-1",
            kind: "win",
            pointsDelta: 8,
            modeId: "classic",
            happenedAt: 1000,
            version: 2,
          },
          {
            id: "loss-1",
            kind: "loss",
            modeId: "classic",
            happenedAt: 2000,
            version: 2,
          },
        ],
      }),
    );
    expect(storage.getItem(WORDLE_SYNC_EVENTS_KEY)).toBeNull();
  });

  it("syncs v3 win events with round proof metadata", async () => {
    const mutation = vi.fn().mockResolvedValue({
      id: "remote-player",
      clientId: "remote-client",
      clientRecordId: "remote-record",
      nick: "Ana",
      playerCode: "AB12",
      score: 24,
      streak: 1,
      difficulty: "normal",
      keyboardPreference: "onscreen",
      createdAt: 2000,
    });
    const client = new ScoreClient(
      createGateway({
        isConfigured: true,
        mutation,
      }),
      storage,
    );

    client.queueRoundEvent({
      id: "win-v3-1",
      kind: "win",
      pointsDelta: 8,
      modeId: "classic",
      happenedAt: 1000,
      version: 3,
      proof: {
        roundStartedAt: 500,
        guessesUsed: 3,
        difficulty: "normal",
        hardModeEnabled: false,
        hardModeSecondsLeft: 60,
        guessWords: ["SLATE", "CRANE", "APPLE"],
      },
    });

    await client.syncRoundEvents({
      nick: "Ana",
      language: "en",
      difficulty: "normal",
      keyboardPreference: "onscreen",
    });

    expect(mutation).toHaveBeenCalledWith(
      SYNC_ROUND_EVENTS_MUTATION,
      expect.objectContaining({
        events: [
          {
            id: "win-v3-1",
            kind: "win",
            pointsDelta: 8,
            modeId: "classic",
            happenedAt: 1000,
            version: 3,
            proof: {
              roundStartedAt: 500,
              guessesUsed: 3,
              difficulty: "normal",
              hardModeEnabled: false,
              hardModeSecondsLeft: 60,
              guessWords: ["SLATE", "CRANE", "APPLE"],
            },
          },
        ],
      }),
    );
    expect(storage.getItem(WORDLE_SYNC_EVENTS_KEY)).toBeNull();
  });

  it("keeps local classic snapshot when sync returns a stale profile", async () => {
    const mutation = vi.fn().mockResolvedValue({
      id: "remote-player",
      clientId: "remote-client",
      clientRecordId: "remote-record",
      nick: "Ana",
      playerCode: "AB12",
      score: 10,
      streak: 1,
      difficulty: "normal",
      keyboardPreference: "onscreen",
      createdAt: 1000,
    });
    const client = new ScoreClient(
      createGateway({
        isConfigured: true,
        mutation,
      }),
      storage,
    );

    client.cachePlayerScore({
      nick: "Ana",
      language: "en",
      modeId: "classic",
      score: 20,
      streak: 2,
      createdAt: 2000,
      overwriteExisting: true,
    });
    client.queueRoundEvent({
      id: "win-1",
      kind: "win",
      pointsDelta: 10,
      modeId: "classic",
      happenedAt: 3000,
      version: 2,
    });

    await client.syncRoundEvents({
      nick: "Ana",
      language: "en",
      difficulty: "normal",
      keyboardPreference: "onscreen",
    });

    expect(client.getCurrentClientScoreSnapshot("en", "classic")).toEqual({
      score: 20,
      streak: 2,
    });
  });

  it("prefers cache snapshot over pending rows for current streak", () => {
    const client = new ScoreClient(createGateway(), storage);
    const clientId = storage.getItem(SCOREBOARD_CLIENT_ID_KEY) ?? "";

    storage.setItem(
      SCOREBOARD_CACHE_KEY,
      JSON.stringify([
        {
          localId: "current-cache",
          clientId,
          nick: "Ana",
          language: "en",
          modeId: "classic",
          score: 12,
          streak: 0,
          createdAt: 2000,
        },
      ]),
    );
    storage.setItem(
      SCOREBOARD_PENDING_KEY,
      JSON.stringify([
        {
          localId: "current-pending",
          clientId,
          nick: "Ana",
          language: "en",
          modeId: "classic",
          score: 99,
          streak: 7,
          createdAt: 1000,
          mutation: "scores:addScore",
        },
      ]),
    );

    expect(client.getCurrentClientScoreSnapshot("en", "classic")).toEqual({
      score: 12,
      streak: 0,
    });
  });

  it("queues daily round events for remote sync", async () => {
    const mutation = vi.fn().mockResolvedValue({
      id: "remote-player",
      clientId: "remote-client",
      clientRecordId: "remote-record",
      nick: "Ana",
      playerCode: "AB12",
      score: 1,
      streak: 1,
      difficulty: "normal",
      keyboardPreference: "onscreen",
      createdAt: 1000,
    });
    const client = new ScoreClient(
      createGateway({
        isConfigured: true,
        mutation,
      }),
      storage,
    );

    client.queueRoundEvent({
      id: "daily-win-1",
      kind: "win",
      pointsDelta: 1,
      modeId: "daily",
      happenedAt: 1000,
      version: 2,
    });

    await client.syncRoundEvents({
      nick: "Ana",
      language: "en",
      difficulty: "normal",
      keyboardPreference: "onscreen",
    });

    expect(mutation).toHaveBeenCalledWith(
      SYNC_ROUND_EVENTS_MUTATION,
      expect.objectContaining({
        events: [
          {
            id: "daily-win-1",
            kind: "win",
            pointsDelta: 1,
            modeId: "daily",
            happenedAt: 1000,
            version: 2,
          },
        ],
      }),
    );
    expect(storage.getItem(WORDLE_SYNC_EVENTS_KEY)).toBeNull();
  });
});
