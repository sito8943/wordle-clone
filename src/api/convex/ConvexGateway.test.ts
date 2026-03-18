import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConvexGateway } from "./ConvexGateway";

const queryMock = vi.fn();
const mutationMock = vi.fn();
const constructorMock = vi.fn();

vi.mock("convex/browser", () => ({
  ConvexHttpClient: vi.fn(
    class {
      constructor(url: string) {
        constructorMock(url);
      }

      query = queryMock;
      mutation = mutationMock;
    },
  ),
}));

describe("ConvexGateway", () => {
  beforeEach(() => {
    constructorMock.mockReset();
    queryMock.mockReset();
    mutationMock.mockReset();
  });

  it("reports not configured when url is missing", () => {
    const gateway = new ConvexGateway();

    expect(gateway.isConfigured).toBe(false);
  });

  it("creates a Convex client and forwards queries and mutations", async () => {
    queryMock.mockResolvedValue({ scores: [] });
    mutationMock.mockResolvedValue({ ok: true });
    const gateway = new ConvexGateway("https://example.convex.cloud");

    expect(gateway.isConfigured).toBe(true);
    expect(constructorMock).toHaveBeenCalledWith(
      "https://example.convex.cloud",
    );

    await expect(gateway.query("scores:list", { limit: 5 })).resolves.toEqual({
      scores: [],
    });
    await expect(
      gateway.mutation("scores:update", { nick: "Ana" }),
    ).resolves.toEqual({ ok: true });

    expect(queryMock).toHaveBeenCalledWith("scores:list", { limit: 5 });
    expect(mutationMock).toHaveBeenCalledWith("scores:update", { nick: "Ana" });
  });

  it("throws when trying to use Convex without configuration", async () => {
    const gateway = new ConvexGateway();

    await expect(gateway.query("scores:list")).rejects.toThrow(
      "Convex is not configured. Missing VITE_CONVEX_URL.",
    );
    await expect(gateway.mutation("scores:update")).rejects.toThrow(
      "Convex is not configured. Missing VITE_CONVEX_URL.",
    );
  });

  it("detects common network errors from message text", () => {
    const gateway = new ConvexGateway("https://example.convex.cloud");

    expect(gateway.isNetworkError(new Error("Failed to fetch"))).toBe(true);
    expect(gateway.isNetworkError(new Error("Network timeout"))).toBe(true);
    expect(gateway.isNetworkError(new Error("Validation error"))).toBe(false);
    expect(gateway.isNetworkError("offline")).toBe(false);
  });
});
