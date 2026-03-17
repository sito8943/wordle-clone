import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const mockListTopScores = vi.fn();

vi.mock("react-router", () => ({
  useLocation: () => ({ pathname: "/" }),
}));

vi.mock("@providers", () => ({
  useApi: () => ({ scoreClient: { listTopScores: mockListTopScores } }),
  usePlayer: () => ({ player: { score: 0 } }),
}));

// Import after mocks are registered
const { default: useNavbarController } = await import("./useNavbarController");

describe("useNavbarController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListTopScores.mockResolvedValue({
      scores: [],
      source: "local",
      currentClientRank: 3,
      currentClientEntry: null,
    });
  });

  it("starts with loading state", () => {
    const { result } = renderHook(() => useNavbarController());
    expect(result.current.isCurrentClientRankLoading).toBe(true);
  });

  it("resolves the current client rank after loading", async () => {
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

    expect(result.current.rankTone).toBe(3);
  });

  it("sets rank to null when scoreClient throws", async () => {
    mockListTopScores.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useNavbarController());

    await waitFor(() => {
      expect(result.current.isCurrentClientRankLoading).toBe(false);
    });

    expect(result.current.currentClientRank).toBeNull();
    expect(result.current.rankTone).toBeNull();
  });
});
