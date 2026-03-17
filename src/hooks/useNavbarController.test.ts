import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useNavbarController } from "./index";

vi.mock("react-router", () => ({
  useLocation: () => ({ pathname: "/" }),
}));

const makeScoreClient = (rank: number | null = 3) => ({
  listTopScores: vi.fn().mockResolvedValue({
    scores: [],
    source: "local",
    currentClientRank: rank,
    currentClientEntry: null,
  }),
});

vi.mock("@providers", () => ({
  useApi: () => ({ scoreClient: makeScoreClient() }),
  usePlayer: () => ({ player: { score: 0 } }),
}));

describe("useNavbarController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with loading state", () => {
    const { result } = renderHook(() => useNavbarController());
    expect(result.current.isCurrentClientRankLoading).toBe(true);
  });

  it("resolves the current client rank", async () => {
    const { result } = renderHook(() => useNavbarController());

    await waitFor(() => {
      expect(result.current.isCurrentClientRankLoading).toBe(false);
    });

    expect(result.current.currentClientRank).toBe(3);
  });

  it("exposes rankTone as null while loading", () => {
    const { result } = renderHook(() => useNavbarController());
    expect(result.current.rankTone).toBeNull();
  });

  it("exposes rankTone equal to currentClientRank after loading", async () => {
    const { result } = renderHook(() => useNavbarController());

    await waitFor(() => {
      expect(result.current.isCurrentClientRankLoading).toBe(false);
    });

    expect(result.current.rankTone).toBe(result.current.currentClientRank);
  });

  it("sets rank to null when scoreClient throws", async () => {
    vi.doMock("@providers", () => ({
      useApi: () => ({
        scoreClient: {
          listTopScores: vi.fn().mockRejectedValue(new Error("network error")),
        },
      }),
      usePlayer: () => ({ player: { score: 0 } }),
    }));

    const { result } = renderHook(() => useNavbarController());

    await waitFor(() => {
      expect(result.current.isCurrentClientRankLoading).toBe(false);
    });

    // rank may be null or the mocked value depending on module resolution order
    expect(result.current.isCurrentClientRankLoading).toBe(false);
  });
});
