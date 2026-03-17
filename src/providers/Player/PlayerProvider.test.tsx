import { renderHook, act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ApiContext } from "@providers/Api/ApiContext";
import { PlayerProvider } from "./index";
import { usePlayer } from "./usePlayer";
import { DEFAULT_PLAYER } from "./constants";
import {
  createTestApiContextValue,
  createMockScoreClient,
} from "../../test/utils";

beforeEach(() => localStorage.clear());
afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

const makeWrapper =
  (recordScore = vi.fn().mockResolvedValue(undefined)) =>
  ({ children }: { children: ReactNode }) => {
    const apiValue = createTestApiContextValue({
      scoreClient: createMockScoreClient(
        vi.fn().mockResolvedValue({
          scores: [],
          source: "local",
          currentClientRank: null,
          currentClientEntry: null,
        }),
      ) as never,
    });
    // Patch recordScore on the scoreClient mock
    (apiValue.scoreClient as unknown as Record<string, unknown>).recordScore =
      recordScore;

    return (
      <ApiContext.Provider value={apiValue}>
        <PlayerProvider>{children}</PlayerProvider>
      </ApiContext.Provider>
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
      }),
    );

    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.player.name).toBe("Ana");
    expect(result.current.player.score).toBe(10);
    expect(result.current.player.streak).toBe(3);
    expect(result.current.player.difficulty).toBe("hard");
  });

  it("updatePlayer changes the player name", () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.updatePlayer("Carlos");
    });

    expect(result.current.player.name).toBe("Carlos");
  });

  it("updatePlayer trims and normalizes the name", () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.updatePlayer("  Ana  ");
    });

    expect(result.current.player.name).toBe("Ana");
  });

  it("replacePlayer merges partial player data", () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.replacePlayer({ score: 50, streak: 5 });
    });

    expect(result.current.player.score).toBe(50);
    expect(result.current.player.streak).toBe(5);
    expect(result.current.player.name).toBe(DEFAULT_PLAYER.name);
  });

  it("increaseScore adds points to current score", () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.increaseScore(5);
    });
    act(() => {
      result.current.increaseScore(3);
    });

    expect(result.current.player.score).toBe(8);
  });

  it("increaseScore ignores zero and negative values", () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.increaseScore(0);
    });
    act(() => {
      result.current.increaseScore(-5);
    });

    expect(result.current.player.score).toBe(0);
  });

  it("increaseWinStreak increments streak", () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.increaseWinStreak();
    });
    act(() => {
      result.current.increaseWinStreak();
    });

    expect(result.current.player.streak).toBe(2);
  });

  it("resetWinStreak sets streak to 0", () => {
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.increaseWinStreak();
      result.current.increaseWinStreak();
    });
    act(() => {
      result.current.resetWinStreak();
    });

    expect(result.current.player.streak).toBe(0);
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

  it("calls scoreClient.recordScore when score changes", async () => {
    const recordScore = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(recordScore),
    });

    act(() => {
      result.current.increaseScore(10);
    });

    await waitFor(() => {
      expect(recordScore).toHaveBeenCalledWith(
        expect.objectContaining({ score: 10 }),
      );
    });
  });

  it("calls scoreClient.recordScore with overwriteExisting when name changes", async () => {
    const recordScore = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => usePlayer(), {
      wrapper: makeWrapper(recordScore),
    });

    act(() => {
      result.current.updatePlayer("NewName");
    });

    await waitFor(() => {
      expect(recordScore).toHaveBeenCalledWith(
        expect.objectContaining({ nick: "NewName", overwriteExisting: true }),
        expect.any(String),
      );
    });
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
