import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ConvexGateway } from "../convex/ConvexGateway";
import { ScoreClient } from "./ScoreClient";

type GatewayOverrides = {
  isConfigured?: boolean;
  query?: ReturnType<typeof vi.fn>;
  mutation?: ReturnType<typeof vi.fn>;
  isNetworkError?: (error: unknown) => boolean;
};

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

const createGateway = (overrides: GatewayOverrides = {}): ConvexGateway =>
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

    await client.recordScore({ nick: "CITO", score: 5, createdAt: 1000 });
    await client.recordScore({ nick: "cito", score: 9, createdAt: 2000 });
    await client.recordScore({ nick: "ANA", score: 12, createdAt: 1500 });

    const result = await client.listTopScores(10);

    expect(result.source).toBe("local");
    expect(result.scores).toHaveLength(2);

    const cito = result.scores.find(
      (entry) => entry.nick.toLowerCase() === "cito",
    );
    expect(cito?.score).toBe(9);
  });

  it("merges remote and pending rows without duplicating the same nick", async () => {
    const networkError = new Error("Network offline");
    const query = vi.fn().mockResolvedValue([
      { id: "remote-cito", nick: "CITO", score: 7, createdAt: 1000 },
      { id: "remote-ana", nick: "ANA", score: 11, createdAt: 1001 },
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

    await client.recordScore({ nick: "CITO", score: 10, createdAt: 2000 });

    const result = await client.listTopScores(10);

    expect(result.source).toBe("convex");

    const citoRows = result.scores.filter(
      (entry) => entry.nick.toLowerCase() === "cito",
    );

    expect(citoRows).toHaveLength(1);
    expect(citoRows[0].score).toBe(10);
    expect(result.scores).toHaveLength(2);

    expect(query).toHaveBeenCalledTimes(1);
  });
});
