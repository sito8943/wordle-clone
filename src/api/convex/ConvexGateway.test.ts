import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConvexGateway } from "./ConvexGateway";

const queryMock = vi.fn();
const mutationMock = vi.fn();

vi.mock("convex/browser", () => ({
  ConvexHttpClient: vi.fn(
    class {
      query = queryMock;
      mutation = mutationMock;
    },
  ),
}));

describe("ConvexGateway", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    queryMock.mockReset();
    mutationMock.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports not configured when url is missing", () => {
    const gateway = new ConvexGateway();

    expect(gateway.isConfigured).toBe(false);
  });

  it("calls backend compatibility endpoints when backendUrl is configured", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, result: { scores: [] } }), {
        status: 200,
      }),
    );
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, result: { ok: true } }), {
        status: 200,
      }),
    );
    const gateway = new ConvexGateway({
      backendUrl: "http://localhost:8787/",
    });

    await expect(gateway.query("scores:list", { limit: 5 })).resolves.toEqual({
      scores: [],
    });
    await expect(
      gateway.mutation("scores:update", { nick: "Ana" }),
    ).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8787/api/query",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "scores:list", args: { limit: 5 } }),
      },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8787/api/mutation",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "scores:update",
          args: { nick: "Ana" },
        }),
      },
    );
  });

  it("creates a Convex client and forwards queries and mutations in legacy mode", async () => {
    queryMock.mockResolvedValue({ scores: [] });
    mutationMock.mockResolvedValue({ ok: true });
    const gateway = new ConvexGateway({
      convexUrl: "https://example.convex.cloud",
    });

    expect(gateway.isConfigured).toBe(true);

    await expect(gateway.query("scores:list", { limit: 5 })).resolves.toEqual({
      scores: [],
    });
    await expect(
      gateway.mutation("scores:update", { nick: "Ana" }),
    ).resolves.toEqual({ ok: true });

    expect(queryMock).toHaveBeenCalledWith("scores:list", { limit: 5 });
    expect(mutationMock).toHaveBeenCalledWith("scores:update", { nick: "Ana" });
  });

  it("throws when trying to use backend without configuration", async () => {
    const gateway = new ConvexGateway();

    await expect(gateway.query("scores:list")).rejects.toThrow(
      "Backend is not configured. Missing VITE_BACKEND_URL or VITE_CONVEX_URL.",
    );
    await expect(gateway.mutation("scores:update")).rejects.toThrow(
      "Backend is not configured. Missing VITE_BACKEND_URL or VITE_CONVEX_URL.",
    );
  });

  it("propagates backend error payloads", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: false, error: "invalid payload" }), {
        status: 400,
      }),
    );
    const gateway = new ConvexGateway({
      backendUrl: "http://localhost:8787",
    });

    await expect(gateway.query("scores:list")).rejects.toThrow(
      "invalid payload",
    );
  });

  it("detects common network errors from message text", () => {
    const gateway = new ConvexGateway("https://example.convex.cloud");

    expect(gateway.isNetworkError(new Error("Failed to fetch"))).toBe(true);
    expect(gateway.isNetworkError(new Error("Network timeout"))).toBe(true);
    expect(gateway.isNetworkError(new Error("connect ECONNREFUSED"))).toBe(
      true,
    );
    expect(gateway.isNetworkError(new Error("Validation error"))).toBe(false);
    expect(gateway.isNetworkError("offline")).toBe(false);
  });
});
