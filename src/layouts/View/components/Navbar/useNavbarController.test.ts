import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { getHelpRoute, ROUTES } from "@config/routes";

const mockListTopScores = vi.fn();
const mockPlayer = { score: 0, code: "", name: "Player", language: "en" };
const mockLocation = { pathname: ROUTES.HOME };

vi.mock("react-router", () => ({
  useLocation: () => mockLocation,
}));

vi.mock("@providers", () => ({
  useApi: () => ({ scoreClient: { listTopScores: mockListTopScores } }),
  usePlayer: () => ({ player: mockPlayer }),
}));

// Import after mocks are registered
const { default: useNavbarController } = await import("./useNavbarController");

describe("useNavbarController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.pathname = ROUTES.HOME;
    mockPlayer.score = 0;
    mockPlayer.code = "";
    mockPlayer.name = "Player";
    mockPlayer.language = "en";
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

  it("reloads the current client rank when the player identity changes", async () => {
    const { rerender } = renderHook(() => useNavbarController());

    await waitFor(() => {
      expect(mockListTopScores).toHaveBeenCalled();
    });
    const initialCallCount = mockListTopScores.mock.calls.length;

    mockPlayer.code = "AB12";
    mockPlayer.name = "Recovered";
    rerender();

    await waitFor(() => {
      expect(mockListTopScores.mock.calls.length).toBeGreaterThan(
        initialCallCount,
      );
    });
  });

  it("builds a help route with the active classic mode", () => {
    mockLocation.pathname = ROUTES.CLASSIC;
    const { result } = renderHook(() => useNavbarController());

    expect(result.current.helpRoute).toBe(getHelpRoute("classic"));
  });

  it("builds a help route with the active lightning mode", () => {
    mockLocation.pathname = ROUTES.LIGHTING;
    const { result } = renderHook(() => useNavbarController());

    expect(result.current.helpRoute).toBe(getHelpRoute("lightning"));
  });
});
