import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import useScoreboardController from "./useScoreboardController";
import { queryKeys } from "./queryKeys";
import {
  createHookWrapper,
  createMockScoreClient,
  createTestApiContextValue,
  createTestQueryClient,
} from "../test/utils";

describe("useScoreboardController", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("exposes loading while top scores are pending", () => {
    const listTopScores = vi.fn().mockReturnValue(new Promise(() => undefined));
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        scoreClient: createMockScoreClient(listTopScores),
      }),
    );

    const { result } = renderHook(() => useScoreboardController(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe("");
    expect(result.current.scores).toEqual([]);
  });

  it("maps query success data to scoreboard rows", async () => {
    const listTopScores = vi.fn().mockResolvedValue({
      scores: [
        {
          id: "1",
          nick: "Ana",
          score: 120,
          streak: 4,
          createdAt: Date.UTC(2026, 2, 1),
          source: "local",
          isCurrentClient: false,
        },
      ],
      source: "convex",
      currentClientRank: 12,
      currentClientEntry: {
        id: "me",
        nick: "Player",
        score: 98,
        streak: 3,
        createdAt: Date.UTC(2026, 2, 2),
        source: "convex",
        isCurrentClient: true,
      },
    });
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        scoreClient: createMockScoreClient(listTopScores),
      }),
    );

    const { result } = renderHook(() => useScoreboardController(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.source).toBe("convex");
    expect(result.current.error).toBe("");
    expect(result.current.currentClientRank).toBe(12);
    expect(result.current.currentClientOutsideTop).toBe(true);
    expect(result.current.scores).toHaveLength(2);
    expect(result.current.scores[0].displayRank).toBe(1);
    expect(result.current.scores[1].isPinnedCurrentClient).toBe(true);
  });

  it("surfaces query error messages", async () => {
    const listTopScores = vi
      .fn()
      .mockRejectedValue(new Error("Failed to load scoreboard."));
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        scoreClient: createMockScoreClient(listTopScores),
      }),
    );

    const { result } = renderHook(() => useScoreboardController(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load scoreboard.");
    expect(result.current.scores).toEqual([]);
  });

  it("refresh invalidates and refetches top scores", async () => {
    const listTopScores = vi.fn().mockResolvedValue({
      scores: [],
      source: "local",
      currentClientRank: null,
      currentClientEntry: null,
    });
    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined);
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        scoreClient: createMockScoreClient(listTopScores),
      }),
    );

    const { result } = renderHook(() => useScoreboardController(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.topScores,
    });
    expect(listTopScores).toHaveBeenCalledTimes(2);
  });
});
