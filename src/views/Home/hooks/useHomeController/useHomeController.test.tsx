import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTotalPointsForWin } from "@domain/wordle";
import useHomeController from "./useHomeController";
import { END_OF_GAME_DIALOG_SEEN_SESSION_STORAGE_KEY } from "./constants";

const mockUseApi = vi.fn();
const mockUsePlayer = vi.fn();
const mockUseWordle = vi.fn();
const mockUseHintController = vi.fn();
const mockUseHardModeTimer = vi.fn();

vi.mock("@providers", () => ({
  useApi: () => mockUseApi(),
  usePlayer: () => mockUsePlayer(),
}));

vi.mock("@hooks", () => ({
  useWordle: () => mockUseWordle(),
}));

vi.mock("../useHintController", () => ({
  useHintController: () => mockUseHintController(),
}));

vi.mock("./useHardModeTimer", () => ({
  useHardModeTimer: () => mockUseHardModeTimer(),
}));

describe("useHomeController", () => {
  let wordleState: Record<string, unknown>;

  beforeEach(() => {
    vi.useFakeTimers();
    window.sessionStorage.clear();
    wordleState = {
      sessionId: "session-1",
      gameId: "game-1",
      answer: "APPLE",
      won: false,
      guesses: [],
      current: "",
      gameOver: false,
      refresh: vi.fn(),
      forceLoss: vi.fn(),
      showResumeDialog: false,
      boardVersion: 1,
      startNewBoard: vi.fn(),
      revealHint: vi.fn().mockReturnValue(true),
    };

    mockUseApi.mockReturnValue({
      scoreClient: {
        recordScore: vi.fn().mockResolvedValue(undefined),
      },
      wordDictionaryClient: {
        refreshRemoteChecksum: vi
          .fn()
          .mockResolvedValue({ checksum: 42, updatedAt: 1 }),
      },
    });
    mockUsePlayer.mockReturnValue({
      player: {
        name: "Player",
        code: "AB12",
        score: 20,
        streak: 2,
        difficulty: "normal",
        keyboardPreference: "onscreen",
        showEndOfGameDialogs: true,
      },
      replacePlayer: vi.fn(),
      commitVictory: vi.fn().mockResolvedValue(undefined),
      commitLoss: vi.fn().mockResolvedValue(undefined),
    });
    mockUseWordle.mockImplementation(() => wordleState);
    mockUseHintController.mockReturnValue({
      hintsRemaining: 1,
      hintsEnabledForDifficulty: true,
      hintButtonDisabled: false,
      useHint: vi.fn(),
      resetHints: vi.fn(),
    });
    mockUseHardModeTimer.mockReturnValue({
      showHardModeTimer: false,
      showHardModeFinalStretchBar: false,
      hardModeSecondsLeft: 60,
      hardModeTimerStarted: false,
      hardModeTickPulse: 0,
      hardModeClockBoostScale: 0.1,
      hardModeFinalStretchProgressPercent: 100,
      boardShakePulse: 0,
      resetHardModeTimer: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    window.sessionStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("awards points and streak exactly once when a round changes to won", () => {
    const commitVictory = vi.fn().mockResolvedValue(undefined);
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      player: {
        name: "Player",
        code: "AB12",
        score: 20,
        streak: 2,
        difficulty: "normal",
        keyboardPreference: "onscreen",
        showEndOfGameDialogs: true,
      },
      commitVictory,
    });

    const { rerender } = renderHook(() => useHomeController());

    wordleState = {
      ...wordleState,
      guesses: ["SLATE", "CRANE", "APPLE"],
      won: true,
      gameOver: true,
    };

    rerender();
    rerender();

    expect(commitVictory).toHaveBeenCalledTimes(1);
    expect(commitVictory).toHaveBeenCalledWith(getTotalPointsForWin(3, 2, 2));
  });

  it("adds insane time bonus to the committed victory score", () => {
    const commitVictory = vi.fn().mockResolvedValue(undefined);
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      player: {
        name: "Player",
        code: "AB12",
        score: 20,
        streak: 2,
        difficulty: "insane",
        keyboardPreference: "onscreen",
        showEndOfGameDialogs: true,
      },
      commitVictory,
    });
    mockUseHardModeTimer.mockReturnValue({
      ...mockUseHardModeTimer(),
      hardModeSecondsLeft: 11,
    });

    const { rerender, result } = renderHook(() => useHomeController());

    wordleState = {
      ...wordleState,
      guesses: ["SLATE", "CRANE", "APPLE"],
      won: true,
      gameOver: true,
    };

    rerender();

    expect(commitVictory).toHaveBeenCalledWith(
      getTotalPointsForWin(3, 4, 2, 5),
    );
    expect(result.current.victoryScoreSummary?.total).toBe(30);
    expect(result.current.showVictoryDialog).toBe(true);
  });

  it("restores the legacy end-of-game feedback after closing the dialog manually", () => {
    const { rerender, result } = renderHook(() => useHomeController());

    wordleState = {
      ...wordleState,
      guesses: ["SLATE", "CRANE", "APPLE"],
      won: true,
      gameOver: true,
    };

    rerender();

    expect(result.current.showVictoryDialog).toBe(true);
    expect(result.current.showLegacyEndOfGameMessage).toBe(false);
    expect(result.current.showRefreshAttention).toBe(true);

    act(() => {
      result.current.closeEndOfGameDialog();
    });

    expect(result.current.showVictoryDialog).toBe(false);
    expect(result.current.showLegacyEndOfGameMessage).toBe(true);
    expect(result.current.showRefreshAttention).toBe(true);
  });

  it("shows the end-of-game settings hint only once per tab session", () => {
    const { rerender, result } = renderHook(() => useHomeController());

    wordleState = {
      ...wordleState,
      guesses: ["SLATE", "CRANE", "APPLE"],
      won: true,
      gameOver: true,
    };

    rerender();

    expect(result.current.showEndOfGameSettingsHint).toBe(true);
    expect(
      window.sessionStorage.getItem(
        END_OF_GAME_DIALOG_SEEN_SESSION_STORAGE_KEY,
      ),
    ).toBe("seen");

    wordleState = {
      ...wordleState,
      current: "",
      gameOver: false,
      guesses: [],
    };
    rerender();

    wordleState = {
      ...wordleState,
      answer: "BRICK",
      won: false,
      gameOver: true,
      guesses: ["SLATE", "CRANE", "BRICK"],
    };
    rerender();

    expect(result.current.showDefeatDialog).toBe(true);
    expect(result.current.showEndOfGameSettingsHint).toBe(false);
  });

  it("activates refresh attention immediately when end-of-game dialogs are disabled", () => {
    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      player: {
        name: "Player",
        code: "AB12",
        score: 20,
        streak: 2,
        difficulty: "normal",
        keyboardPreference: "onscreen",
        showEndOfGameDialogs: false,
      },
    });

    const { rerender, result } = renderHook(() => useHomeController());

    wordleState = {
      ...wordleState,
      guesses: ["SLATE", "CRANE", "APPLE"],
      won: true,
      gameOver: true,
    };

    rerender();

    expect(result.current.showLegacyEndOfGameMessage).toBe(true);
    expect(result.current.showRefreshAttention).toBe(true);
    expect(result.current.refreshAttentionPulse).toBeGreaterThan(0);
  });

  it("opens a confirmation dialog before refreshing an active game", () => {
    const resetHints = vi.fn();
    const resetHardModeTimer = vi.fn();
    const refresh = vi.fn();
    wordleState = {
      ...wordleState,
      current: "AP",
      refresh,
    };
    mockUseHintController.mockReturnValue({
      ...mockUseHintController(),
      hintsRemaining: 1,
      hintsEnabledForDifficulty: true,
      hintButtonDisabled: false,
      useHint: vi.fn(),
      resetHints,
    });
    mockUseHardModeTimer.mockReturnValue({
      ...mockUseHardModeTimer(),
      resetHardModeTimer,
    });

    const { result } = renderHook(() => useHomeController());

    act(() => {
      result.current.refreshBoard();
    });

    expect(result.current.showRefreshDialog).toBe(true);
    expect(refresh).not.toHaveBeenCalled();

    act(() => {
      result.current.confirmRefreshBoard();
    });

    expect(result.current.showRefreshDialog).toBe(false);
    expect(resetHints).toHaveBeenCalledTimes(1);
    expect(resetHardModeTimer).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("keeps the word list dialog disabled outside easy mode", () => {
    const { result, rerender } = renderHook(() => useHomeController());

    act(() => {
      result.current.openWordsDialog();
    });

    expect(result.current.showWordsDialog).toBe(false);

    mockUsePlayer.mockReturnValue({
      ...mockUsePlayer(),
      player: {
        name: "Player",
        code: "AB12",
        score: 20,
        streak: 2,
        difficulty: "easy",
        keyboardPreference: "onscreen",
        showEndOfGameDialogs: true,
      },
    });

    rerender();

    act(() => {
      result.current.openWordsDialog();
    });

    expect(result.current.showWordsDialog).toBe(true);
  });

  it("refreshes the remote dictionary checksum and exposes a success message", async () => {
    const refreshRemoteChecksum = vi
      .fn()
      .mockResolvedValue({ checksum: 42, updatedAt: 1 });
    mockUseApi.mockReturnValue({
      scoreClient: {
        recordScore: vi.fn().mockResolvedValue(undefined),
      },
      wordDictionaryClient: {
        refreshRemoteChecksum,
      },
    });

    const { result } = renderHook(() => useHomeController());

    await act(async () => {
      await result.current.refreshRemoteDictionaryChecksum();
    });

    expect(refreshRemoteChecksum).toHaveBeenCalledTimes(1);
    expect(result.current.dictionaryChecksumMessage).toBe(
      "Remote checksum updated to 42.",
    );
    expect(result.current.dictionaryChecksumMessageKind).toBe("success");
  });
});
