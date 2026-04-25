import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WORDS_DEFAULT_LANGUAGE } from "@api/words";
import { env } from "@config";
import useTopScoresQuery from "./useTopScoresQuery";
import {
  createHookWrapper,
  createMockScoreClient,
  createTestApiContextValue,
  createTestQueryClient,
} from "../../../test/utils";

describe("useTopScoresQuery", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("uses the default score limit from env", async () => {
    const listTopScores = vi.fn().mockResolvedValue({
      scores: [],
      source: "local",
      currentClientRank: null,
      currentClientEntry: null,
    });
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        scoreClient: createMockScoreClient(listTopScores),
      }),
    );

    const { result } = renderHook(() => useTopScoresQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(listTopScores).toHaveBeenCalledWith(
      env.scoreLimit,
      WORDS_DEFAULT_LANGUAGE,
      "classic",
    );
  });

  it("uses the provided limit and exposes returned data", async () => {
    const listTopScores = vi.fn().mockResolvedValue({
      scores: [
        {
          id: "1",
          nick: "Ana",
          modeId: "classic",
          score: 55,
          streak: 2,
          createdAt: Date.UTC(2026, 2, 18),
          source: "local",
          isCurrentClient: false,
        },
      ],
      source: "local",
      currentClientRank: 7,
      currentClientEntry: null,
    });
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        scoreClient: createMockScoreClient(listTopScores),
      }),
    );

    const { result } = renderHook(() => useTopScoresQuery(3), { wrapper });

    await waitFor(() => {
      expect(result.current.data?.currentClientRank).toBe(7);
    });

    expect(listTopScores).toHaveBeenCalledWith(
      3,
      WORDS_DEFAULT_LANGUAGE,
      "classic",
    );
    expect(result.current.data?.scores).toHaveLength(1);
    expect(result.current.data?.currentClientRank).toBe(7);
  });

  it("shows cached scores immediately while pending sync runs in background", async () => {
    let resolveRemote!: (value: {
      scores: [];
      source: "convex";
      currentClientRank: null;
      currentClientEntry: null;
    }) => void;
    const listTopScores = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveRemote = resolve;
      }),
    );
    const syncPendingScores = vi.fn().mockResolvedValue({ flushed: false });
    const getCachedTopScores = vi.fn().mockReturnValue({
      scores: [
        {
          id: "local-1",
          nick: "Ana",
          modeId: "classic",
          score: 42,
          streak: 1,
          createdAt: Date.UTC(2026, 2, 18),
          source: "local",
          isCurrentClient: true,
        },
      ],
      source: "local",
      currentClientRank: 1,
      currentClientEntry: null,
    });
    const queryClient = createTestQueryClient();
    const wrapper = createHookWrapper(
      queryClient,
      createTestApiContextValue({
        scoreClient: createMockScoreClient(listTopScores, {
          getCachedTopScores,
          syncPendingScores,
        }),
      }),
    );

    const { result } = renderHook(() => useTopScoresQuery(5), { wrapper });

    expect(result.current.data?.scores).toHaveLength(1);
    expect(result.current.data?.source).toBe("local");

    await waitFor(() => {
      expect(syncPendingScores).toHaveBeenCalledTimes(1);
    });

    act(() => {
      resolveRemote({
        scores: [],
        source: "convex",
        currentClientRank: null,
        currentClientEntry: null,
      });
    });
  });
});
