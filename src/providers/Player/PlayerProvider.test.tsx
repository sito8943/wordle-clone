import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { queryKeys } from "@hooks";
import {
  MIN_ROUND_DURATION_FOR_SCORE_COMMIT_MS,
  hasDailyShieldAvailableForDate,
  readDailyModeOutcomeForDate,
} from "@domain/wordle";
import { ApiContext } from "@providers/Api/ApiContext";
import type { ApiContextType } from "@providers/Api/types";
import { PlayerProvider } from "./index";
import { usePlayer } from "./usePlayer";
import { DEFAULT_PLAYER } from "./constants";
import {
  createTestQueryClient,
  createTestApiContextValue,
  createMockScoreClient,
} from "../../test/utils";

beforeEach(() => localStorage.clear());
afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

const makeWrapper =
  ({
    upsertPlayerProfile = vi.fn().mockImplementation(async (input) => ({
      id: "remote-player",
      clientId: "test-client",
      clientRecordId: "test-record",
      nick: input.nick,
      language: input.language,
      playerCode: "AB12",
      score: input.score ?? 0,
      streak: input.streak ?? 0,
      difficulty: input.difficulty,
      keyboardPreference: input.keyboardPreference,
      createdAt: 1000,
    })),
    recoverPlayerByCode = vi.fn().mockResolvedValue({
      id: "remote-player",
      clientId: "test-client",
      clientRecordId: "recovered-record",
      nick: "Recovered",
      language: "en",
      playerCode: "RCV1",
      score: 27,
      streak: 4,
      difficulty: "hard",
      keyboardPreference: "native",
      createdAt: 1000,
    }),
    getCurrentPlayerProfile = vi.fn().mockResolvedValue(null),
    queueRoundEvent = vi.fn(),
    syncRoundEvents = vi.fn().mockResolvedValue(null),
    getCurrentClientScoreSnapshot = vi.fn().mockReturnValue({
      score: 0,
      streak: 0,
    }),
  }: {
    upsertPlayerProfile?: ApiContextType["scoreClient"]["upsertPlayerProfile"];
    recoverPlayerByCode?: ApiContextType["scoreClient"]["recoverPlayerByCode"];
    getCurrentPlayerProfile?: ApiContextType["scoreClient"]["getCurrentPlayerProfile"];
    queueRoundEvent?: ApiContextType["scoreClient"]["queueRoundEvent"];
    syncRoundEvents?: ApiContextType["scoreClient"]["syncRoundEvents"];
    getCurrentClientScoreSnapshot?: ApiContextType["scoreClient"]["getCurrentClientScoreSnapshot"];
  } = {}) =>
  ({ children }: { children: ReactNode }) => {
    const apiValue = createTestApiContextValue({
      scoreClient: createMockScoreClient(
        vi.fn().mockResolvedValue({
          scores: [],
          source: "local",
          currentClientRank: null,
          currentClientEntry: null,
        }),
        {
          upsertPlayerProfile,
          recoverPlayerByCode,
          getCurrentPlayerProfile,
          queueRoundEvent,
          syncRoundEvents,
          getCurrentClientScoreSnapshot,
        },
      ) as never,
    });
    const queryClient = createTestQueryClient();

    return (
      <QueryClientProvider client={queryClient}>
        <ApiContext.Provider value={apiValue}>
          <PlayerProvider>{children}</PlayerProvider>
        </ApiContext.Provider>
      </QueryClientProvider>
    );
  };

describe("PlayerProvider", () => {
  it("provides the default player when no localStorage data exists", () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.player.name).toBe(DEFAULT_PLAYER.name);
    expect(result.current.player.score).toBe(0);
    expect(result.current.player.streak).toBe(0);
    expect(result.current.player.difficulty).toBe(DEFAULT_PLAYER.difficulty);
    expect(result.current.player.declinedTutorial).toBeUndefined();
    expect(result.current.player.showEndOfGameDialogs).toBe(true);
    expect(result.current.player.manualTileSelection).toBe(false);
    expect(result.current.player.hackingBan).toBeNull();
  });

  it("uses the device language on first initialization", () => {
    vi.spyOn(window.navigator, "language", "get").mockReturnValue("es-ES");

    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.player.language).toBe("es");
  });

  it("reads stored player from localStorage", () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Ana",
        score: 10,
        streak: 3,
        difficulty: "hard",
        keyboardPreference: "onscreen",
        declinedTutorial: true,
      }),
    );

    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.player.name).toBe("Ana");
    expect(result.current.player.score).toBe(10);
    expect(result.current.player.streak).toBe(3);
    expect(result.current.player.difficulty).toBe("hard");
    expect(result.current.player.declinedTutorial).toBe(true);
    expect(result.current.player.showEndOfGameDialogs).toBe(true);
    expect(result.current.player.manualTileSelection).toBe(false);
  });

  it("does not rewrite normalized player state on mount", () => {
    localStorage.setItem("player", JSON.stringify(DEFAULT_PLAYER));
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    expect(
      setItemSpy.mock.calls.filter(([key]) => key === "player"),
    ).toHaveLength(0);
  });

  it("updatePlayer changes the player name and stores a recovery code", async () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.updatePlayer("Carlos");
    });

    expect(result.current.player.name).toBe("Carlos");
    expect(result.current.player.code).toBe("AB12");
  });

  it("updatePlayer restores the daily lock from backend profile data", async () => {
    const upsertPlayerProfile = vi.fn().mockImplementation(async (input) => ({
      id: "remote-player",
      clientId: "test-client",
      clientRecordId: "test-record",
      nick: input.nick,
      language: input.language,
      playerCode: "AB12",
      score: input.score ?? 0,
      streak: input.streak ?? 0,
      hasWonDailyToday: true,
      difficulty: input.difficulty,
      keyboardPreference: input.keyboardPreference,
      createdAt: 1000,
    }));
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper({ upsertPlayerProfile }),
    });

    await act(async () => {
      await result.current.updatePlayer("Carlos");
    });

    expect(readDailyModeOutcomeForDate("AB12")).toBe("won");
  });

  it("updatePlayer applies backend shield availability for today", async () => {
    const upsertPlayerProfile = vi.fn().mockImplementation(async (input) => ({
      id: "remote-player",
      clientId: "test-client",
      clientRecordId: "test-record",
      nick: input.nick,
      language: input.language,
      playerCode: "AB12",
      score: input.score ?? 0,
      streak: input.streak ?? 0,
      hasWonDailyToday: true,
      hasDailyShieldAvailableToday: false,
      difficulty: input.difficulty,
      keyboardPreference: input.keyboardPreference,
      createdAt: 1000,
    }));
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper({ upsertPlayerProfile }),
    });

    await act(async () => {
      await result.current.updatePlayer("Carlos");
    });

    expect(readDailyModeOutcomeForDate("AB12")).toBe("won");
    expect(hasDailyShieldAvailableForDate("AB12")).toBe(false);
  });

  it("updatePlayer trims and normalizes the name", async () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.updatePlayer("  Ana  ");
    });

    expect(result.current.player.name).toBe("Ana");
  });

  it("replacePlayer merges partial player data", () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.replacePlayer({
        score: 50,
        streak: 5,
        declinedTutorial: true,
      });
    });

    expect(result.current.player.score).toBe(50);
    expect(result.current.player.streak).toBe(5);
    expect(result.current.player.declinedTutorial).toBe(true);
    expect(result.current.player.name).toBe(DEFAULT_PLAYER.name);
  });

  it("commitVictory adds points, increments streak and enqueues an event", async () => {
    const queueRoundEvent = vi.fn();
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper({ queueRoundEvent }),
    });

    await act(async () => {
      await result.current.commitVictory(5, 1234);
    });

    expect(result.current.player.score).toBe(5);
    expect(result.current.player.streak).toBe(1);
    expect(queueRoundEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "win",
        pointsDelta: 5,
        modeId: "classic",
        happenedAt: 1234,
        version: 2,
      }),
    );
  });

  it("commitVictory enqueues a v3 event when round proof is provided", async () => {
    const queueRoundEvent = vi.fn();
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper({ queueRoundEvent }),
    });

    await act(async () => {
      await result.current.commitVictory(
        5,
        1234,
        1000,
        "classic",
        {
          roundStartedAt: 1000,
          guessesUsed: 3,
          difficulty: "normal",
          hardModeEnabled: false,
          hardModeSecondsLeft: 60,
          guessWords: ["SLATE", "CRANE", "APPLE"],
        },
      );
    });

    expect(queueRoundEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "win",
        pointsDelta: 5,
        modeId: "classic",
        happenedAt: 1234,
        version: 3,
        proof: {
          roundStartedAt: 1000,
          guessesUsed: 3,
          difficulty: "normal",
          hardModeEnabled: false,
          hardModeSecondsLeft: 60,
          guessWords: ["SLATE", "CRANE", "APPLE"],
        },
      }),
    );
  });

  it("commitVictory tags events with the provided scoreboard mode", async () => {
    const queueRoundEvent = vi.fn();
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper({ queueRoundEvent }),
    });

    act(() => {
      result.current.replacePlayer({ streak: 4 });
    });

    await act(async () => {
      await result.current.commitVictory(7, 1234, undefined, "lightning");
    });

    expect(result.current.player.streak).toBe(4);
    expect(queueRoundEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "win",
        pointsDelta: 7,
        modeId: "lightning",
      }),
    );
  });

  it("commitVictory ignores zero and negative values", async () => {
    const queueRoundEvent = vi.fn();
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper({ queueRoundEvent }),
    });

    await act(async () => {
      await result.current.commitVictory(0);
      await result.current.commitVictory(-5);
    });

    expect(result.current.player.score).toBe(0);
    expect(queueRoundEvent).not.toHaveBeenCalled();
  });

  it("commitVictory bans the player when score submission is too fast", async () => {
    const queueRoundEvent = vi.fn();
    const wonAt = 10_000;
    const detectedRoundDurationMs = Math.max(
      0,
      MIN_ROUND_DURATION_FOR_SCORE_COMMIT_MS - 1,
    );
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper({ queueRoundEvent }),
    });

    await act(async () => {
      await result.current.commitVictory(
        25,
        wonAt,
        wonAt - detectedRoundDurationMs,
      );
    });

    expect(result.current.player.score).toBe(0);
    expect(result.current.player.streak).toBe(0);
    expect(result.current.player.hackingBan).toEqual({
      reason: "score-submission-too-fast",
      bannedAt: wonAt,
      thresholdMs: MIN_ROUND_DURATION_FOR_SCORE_COMMIT_MS,
      detectedRoundDurationMs,
    });
    expect(queueRoundEvent).not.toHaveBeenCalled();
  });

  it("commitLoss resets streak to 0", async () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.replacePlayer({ streak: 2 });
    });

    await act(async () => {
      await result.current.commitLoss();
    });

    expect(result.current.player.streak).toBe(0);
  });

  it("commitLoss queues a loss event for registered players", async () => {
    const queueRoundEvent = vi.fn();
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper({ queueRoundEvent }),
    });

    act(() => {
      result.current.replacePlayer({
        name: "Ana",
        code: "AB12",
        score: 42,
        streak: 3,
      });
    });

    await act(async () => {
      await result.current.commitLoss();
    });

    expect(queueRoundEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "loss",
        modeId: "classic",
        version: 2,
      }),
    );
  });

  it("commitLoss in lightning keeps the classic streak unchanged", async () => {
    const queueRoundEvent = vi.fn();
    const getCurrentClientScoreSnapshot = vi
      .fn()
      .mockImplementation((_language: string, modeId?: string) => ({
        score: modeId === "lightning" ? 40 : 42,
        streak: modeId === "lightning" ? 2 : 3,
      }));
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper({ queueRoundEvent, getCurrentClientScoreSnapshot }),
    });

    act(() => {
      result.current.replacePlayer({
        name: "Ana",
        code: "AB12",
        score: 42,
        streak: 3,
      });
    });

    await act(async () => {
      await result.current.commitLoss("lightning");
    });

    expect(result.current.player.streak).toBe(3);
    expect(queueRoundEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "loss",
        modeId: "lightning",
        version: 2,
      }),
    );
  });

  it("updatePlayerDifficulty changes the difficulty", () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.updatePlayerDifficulty("hard");
    });

    expect(result.current.player.difficulty).toBe("hard");
  });

  it("updatePlayerKeyboardPreference changes the keyboard preference", () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.updatePlayerKeyboardPreference("native");
    });

    expect(result.current.player.keyboardPreference).toBe("native");
  });

  it("syncs preference changes without sending cached score or streak snapshots", async () => {
    const upsertPlayerProfile = vi.fn().mockImplementation(async (input) => ({
      id: "remote-player",
      clientId: "test-client",
      clientRecordId: "test-record",
      nick: input.nick,
      language: input.language,
      playerCode: "AB12",
      score: 99,
      streak: 7,
      difficulty: input.difficulty,
      keyboardPreference: input.keyboardPreference,
      createdAt: 1000,
    }));
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper({ upsertPlayerProfile }),
    });

    act(() => {
      result.current.replacePlayer({
        name: "Ana",
        code: "AB12",
        score: 12,
        streak: 3,
      });
    });

    upsertPlayerProfile.mockClear();

    act(() => {
      result.current.updatePlayerDifficulty("hard");
    });

    await waitFor(() => {
      expect(upsertPlayerProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          nick: "Ana",
          difficulty: "hard",
          keyboardPreference: "onscreen",
        }),
      );
    });

    expect(upsertPlayerProfile.mock.calls[0]?.[0]).not.toHaveProperty("score");
    expect(upsertPlayerProfile.mock.calls[0]?.[0]).not.toHaveProperty("streak");
  });

  it("updates the end-of-game dialogs preference", () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.updatePlayerShowEndOfGameDialogs(false);
    });

    expect(result.current.player.showEndOfGameDialogs).toBe(false);
  });

  it("updates the manual tile selection preference", () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.updatePlayerManualTileSelection(true);
    });

    expect(result.current.player.manualTileSelection).toBe(true);
  });

  it("syncs victory events after a named player wins", async () => {
    const syncRoundEvents = vi.fn().mockResolvedValue({
      id: "remote-player",
      clientId: "test-client",
      clientRecordId: "test-record",
      nick: "Ana",
      language: "en",
      playerCode: "ZX90",
      score: 10,
      streak: 1,
      difficulty: "normal",
      keyboardPreference: "onscreen",
      createdAt: 1000,
    });
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper({ syncRoundEvents }),
    });

    await act(async () => {
      await result.current.updatePlayer("Ana");
    });

    await act(async () => {
      await result.current.commitVictory(10, 1000);
    });

    await waitFor(() => {
      expect(syncRoundEvents).toHaveBeenCalledWith(
        expect.objectContaining({ nick: "Ana" }),
      );
    });
    expect(result.current.player.score).toBe(10);
    expect(result.current.player.code).toBe("ZX90");
  });

  it("keeps local score and streak when sync returns stale profile snapshots", async () => {
    const syncRoundEvents = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValue({
        id: "remote-player",
        clientId: "test-client",
        clientRecordId: "test-record",
        nick: "Ana",
        language: "en",
        playerCode: "ZX90",
        score: 10,
        streak: 1,
        difficulty: "normal",
        keyboardPreference: "onscreen",
        createdAt: 1000,
      });

    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper({ syncRoundEvents }),
    });

    await act(async () => {
      await result.current.updatePlayer("Ana");
    });

    await act(async () => {
      await result.current.commitVictory(10, 1000);
    });

    await act(async () => {
      await result.current.commitVictory(10, 2000);
    });

    expect(result.current.player.score).toBe(20);
    expect(result.current.player.streak).toBe(2);
    expect(result.current.player.code).toBe("ZX90");
  });

  it("calls scoreClient.upsertPlayerProfile when name changes", async () => {
    const upsertPlayerProfile = vi.fn().mockImplementation(async (input) => ({
      id: "remote-player",
      clientId: "test-client",
      clientRecordId: "test-record",
      nick: input.nick,
      language: input.language,
      playerCode: "ZX90",
      score: input.score ?? 0,
      streak: input.streak ?? 0,
      difficulty: input.difficulty,
      keyboardPreference: input.keyboardPreference,
      createdAt: 1000,
    }));
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper({ upsertPlayerProfile }),
    });

    await act(async () => {
      await result.current.updatePlayer("NewName");
    });

    await waitFor(() => {
      expect(upsertPlayerProfile).toHaveBeenCalledWith(
        expect.objectContaining({ nick: "NewName" }),
      );
    });
    expect(result.current.player.code).toBe("ZX90");
  });

  it("recoverPlayer updates the player identity", async () => {
    const recoverPlayerByCode = vi.fn().mockResolvedValue({
      id: "remote-player",
      clientId: "test-client",
      clientRecordId: "recovered-record",
      nick: "Recovered",
      language: "en",
      playerCode: "RCV1",
      score: 27,
      streak: 4,
      difficulty: "hard",
      keyboardPreference: "native",
      createdAt: 1000,
    });
    const recoveredHook = renderHook(() => usePlayer(), {
      wrapper: makeWrapper({ recoverPlayerByCode }),
    });

    await act(async () => {
      await recoveredHook.result.current.recoverPlayer("rcv1");
    });

    expect(recoverPlayerByCode).toHaveBeenCalledWith("rcv1");
    expect(recoveredHook.result.current.player.name).toBe("Recovered");
    expect(recoveredHook.result.current.player.score).toBe(27);
    expect(recoveredHook.result.current.player.difficulty).toBe("hard");
  });

  it("recoverPlayer restores the daily lock from backend profile data", async () => {
    const recoverPlayerByCode = vi.fn().mockResolvedValue({
      id: "remote-player",
      clientId: "test-client",
      clientRecordId: "recovered-record",
      nick: "Recovered",
      language: "en",
      playerCode: "RCV1",
      score: 27,
      streak: 4,
      hasWonDailyToday: true,
      difficulty: "hard",
      keyboardPreference: "native",
      createdAt: 1000,
    });
    const recoveredHook = renderHook(() => usePlayer(), {
      wrapper: makeWrapper({ recoverPlayerByCode }),
    });

    await act(async () => {
      await recoveredHook.result.current.recoverPlayer("rcv1");
    });

    expect(readDailyModeOutcomeForDate("RCV1")).toBe("won");
  });

  it("invalidates top scores after recovering a player", async () => {
    const recoverPlayerByCode = vi.fn().mockResolvedValue({
      id: "remote-player",
      clientId: "test-client",
      clientRecordId: "recovered-record",
      nick: "Recovered",
      language: "en",
      playerCode: "RCV1",
      score: 27,
      streak: 4,
      difficulty: "hard",
      keyboardPreference: "native",
      createdAt: 1000,
    });
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined);
    const apiValue = createTestApiContextValue({
      scoreClient: createMockScoreClient(
        vi.fn().mockResolvedValue({
          scores: [],
          source: "local",
          currentClientRank: null,
          currentClientEntry: null,
        }),
        {
          recoverPlayerByCode,
          getCurrentPlayerProfile: vi.fn().mockResolvedValue(null),
        },
      ) as never,
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ApiContext.Provider value={apiValue}>
          <PlayerProvider>{children}</PlayerProvider>
        </ApiContext.Provider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => usePlayer(), { wrapper });

    await act(async () => {
      await result.current.recoverPlayer("rcv1");
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.topScores,
    });
  });

  it("refreshes the current player profile from remote data", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Ana",
        code: "",
        score: 3,
        streak: 1,
        language: "es",
        difficulty: "normal",
        keyboardPreference: "onscreen",
      }),
    );

    const getCurrentPlayerProfile = vi.fn().mockResolvedValue({
      id: "remote-player",
      clientId: "test-client",
      clientRecordId: "test-record",
      nick: "Ana",
      language: "en",
      playerCode: "ZX90",
      score: 12,
      streak: 4,
      difficulty: "normal",
      keyboardPreference: "onscreen",
      createdAt: 1000,
    });
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper({ getCurrentPlayerProfile }),
    });

    getCurrentPlayerProfile.mockClear();

    await act(async () => {
      await result.current.refreshCurrentPlayerProfile();
    });

    expect(getCurrentPlayerProfile).toHaveBeenCalledWith("es");
    expect(result.current.player.code).toBe("ZX90");
    expect(result.current.player.score).toBe(12);
    expect(result.current.player.difficulty).toBe("normal");
    expect(result.current.player.language).toBe("es");
  });

  it("keeps local language preferences after background remote hydration", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Ana",
        code: "ZX90",
        score: 3,
        streak: 1,
        language: "es",
        difficulty: "hard",
        keyboardPreference: "native",
      }),
    );

    const getCurrentPlayerProfile = vi.fn().mockResolvedValue({
      id: "remote-player",
      clientId: "test-client",
      clientRecordId: "test-record",
      nick: "Ana",
      language: "en",
      playerCode: "ZX90",
      score: 12,
      streak: 4,
      difficulty: "normal",
      keyboardPreference: "onscreen",
      createdAt: 1000,
    });

    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper({ getCurrentPlayerProfile }),
    });

    await waitFor(() => {
      expect(getCurrentPlayerProfile).toHaveBeenCalledWith("es");
    });

    expect(result.current.player.language).toBe("es");
    expect(result.current.player.difficulty).toBe("hard");
    expect(result.current.player.keyboardPreference).toBe("native");
    expect(result.current.player.score).toBe(12);
    expect(result.current.player.streak).toBe(4);
  });

  it("skips duplicate current-profile fetch when queued victories already hydrate remote state", async () => {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name: "Ana",
        code: "ZX90",
        score: 3,
        streak: 1,
        difficulty: "normal",
        keyboardPreference: "onscreen",
      }),
    );
    const syncRoundEvents = vi.fn().mockResolvedValue({
      id: "remote-player",
      clientId: "test-client",
      clientRecordId: "test-record",
      nick: "Ana",
      language: "en",
      playerCode: "ZX90",
      score: 12,
      streak: 4,
      difficulty: "normal",
      keyboardPreference: "onscreen",
      createdAt: 1000,
    });
    const getCurrentPlayerProfile = vi.fn().mockResolvedValue(null);

    renderHook(() => usePlayer(), {
      wrapper: makeWrapper({ syncRoundEvents, getCurrentPlayerProfile }),
    });

    await waitFor(() => {
      expect(syncRoundEvents).toHaveBeenCalled();
    });

    expect(getCurrentPlayerProfile).not.toHaveBeenCalled();
  });
});

describe("usePlayer", () => {
  it("throws when used outside PlayerProvider", () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => renderHook(() => usePlayer())).toThrow(
      "usePlayer must be used within a PlayerProvider",
    );

    consoleSpy.mockRestore();
  });
});
