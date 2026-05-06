import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { env } from "@config";
import { getHelpRoute, getModeRoute, ROUTES } from "@config/routes";
import {
  CURRENT_WORDLE_MODE_STORAGE_KEY,
  writeDailyModeOutcomeForDate,
  WORDLE_MODE_IDS,
} from "@domain/wordle";

const mockListTopScores = vi.fn();
const mockPlayer = { score: 0, code: "", name: "Player", language: "en" };
const mockLocation: { pathname: string; search: string } = {
  pathname: ROUTES.HOME,
  search: "",
};
const defaultLightningModeEnabled = env.lightningModeEnabled;

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
    localStorage.clear();
    sessionStorage.clear();
    env.lightningModeEnabled = defaultLightningModeEnabled;
    mockLocation.pathname = ROUTES.HOME;
    mockLocation.search = "";
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

  it("exposes activeModeId for game mode routes", () => {
    mockLocation.pathname = ROUTES.DAILY;
    const { result } = renderHook(() => useNavbarController());

    expect(result.current.activeModeId).toBe(WORDLE_MODE_IDS.DAILY);
  });

  it("exposes activeModeId from help route query mode", () => {
    mockLocation.pathname = ROUTES.HELP;
    mockLocation.search = "?mode=lightning";
    const { result } = renderHook(() => useNavbarController());

    expect(result.current.activeModeId).toBe(WORDLE_MODE_IDS.LIGHTNING);
  });

  it("uses game modes route as title route on active mode pages", () => {
    mockLocation.pathname = ROUTES.ZEN;
    const { result } = renderHook(() => useNavbarController());

    expect(result.current.titleRoute).toBe(ROUTES.PLAY);
  });

  it("uses game modes route as title route on help pages with mode query", () => {
    mockLocation.pathname = ROUTES.HELP;
    mockLocation.search = "?mode=lightning";
    const { result } = renderHook(() => useNavbarController());

    expect(result.current.titleRoute).toBe(ROUTES.PLAY);
  });

  it("returns null activeModeId on routes without game mode context", () => {
    mockLocation.pathname = ROUTES.SCOREBOARD;
    mockLocation.search = "";
    const { result } = renderHook(() => useNavbarController());

    expect(result.current.activeModeId).toBeNull();
  });

  it("builds Play route from stored current mode", () => {
    localStorage.setItem(
      CURRENT_WORDLE_MODE_STORAGE_KEY,
      WORDLE_MODE_IDS.LIGHTNING,
    );
    const { result } = renderHook(() => useNavbarController());

    expect(result.current.playRoute).toBe(getModeRoute("lightning"));
  });

  it("keeps Daily as Play route when daily is not resolved yet", () => {
    localStorage.setItem(
      CURRENT_WORDLE_MODE_STORAGE_KEY,
      WORDLE_MODE_IDS.DAILY,
    );
    const { result } = renderHook(() => useNavbarController());

    expect(result.current.playRoute).toBe(getModeRoute("daily"));
  });

  it("uses game modes route when stored mode is daily and today is already resolved for the current player", () => {
    mockPlayer.code = "AB12";
    localStorage.setItem(
      CURRENT_WORDLE_MODE_STORAGE_KEY,
      WORDLE_MODE_IDS.DAILY,
    );
    writeDailyModeOutcomeForDate({
      outcome: "won",
      playerCode: mockPlayer.code,
    });

    const { result } = renderHook(() => useNavbarController());

    expect(result.current.playRoute).toBe(ROUTES.PLAY);
  });

  it("uses game modes route when stored mode is daily and today is resolved in legacy daily status", () => {
    mockPlayer.code = "AB12";
    localStorage.setItem(
      CURRENT_WORDLE_MODE_STORAGE_KEY,
      WORDLE_MODE_IDS.DAILY,
    );
    writeDailyModeOutcomeForDate({
      outcome: "lost",
    });

    const { result } = renderHook(() => useNavbarController());

    expect(result.current.playRoute).toBe(ROUTES.PLAY);
  });

  it("prioritizes active mode route over stale stored mode", () => {
    localStorage.setItem(
      CURRENT_WORDLE_MODE_STORAGE_KEY,
      WORDLE_MODE_IDS.CLASSIC,
    );
    mockLocation.pathname = ROUTES.LIGHTING;
    const { result } = renderHook(() => useNavbarController());

    expect(result.current.playRoute).toBe(getModeRoute("lightning"));
  });

  it("falls back Play route to classic when current mode is missing", () => {
    const { result } = renderHook(() => useNavbarController());

    expect(result.current.playRoute).toBe(getModeRoute("classic"));
  });

  it("falls back Play route to classic when lightning flag is disabled", () => {
    localStorage.setItem(
      CURRENT_WORDLE_MODE_STORAGE_KEY,
      WORDLE_MODE_IDS.LIGHTNING,
    );
    env.lightningModeEnabled = false;
    const { result } = renderHook(() => useNavbarController());

    expect(result.current.playRoute).toBe(getModeRoute("classic"));
  });

  it("uses game modes route for title when already on home", () => {
    mockLocation.pathname = ROUTES.HOME;
    const { result } = renderHook(() => useNavbarController());

    expect(result.current.titleRoute).toBe(ROUTES.PLAY);
  });

  it("uses game modes route for title on non-home routes", () => {
    mockLocation.pathname = ROUTES.SCOREBOARD;
    const { result } = renderHook(() => useNavbarController());

    expect(result.current.titleRoute).toBe(ROUTES.PLAY);
  });
});
