import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ConvexGateway } from "../convex/ConvexGateway";
import { ScoreClient } from "./ScoreClient";
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
    await client.recordScore({
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
});
