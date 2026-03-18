import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

    expect(listTopScores).toHaveBeenCalledWith(env.scoreLimit);
  });

  it("uses the provided limit and exposes returned data", async () => {
    const listTopScores = vi.fn().mockResolvedValue({
      scores: [
        {
          id: "1",
          nick: "Ana",
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
      expect(result.current.isSuccess).toBe(true);
    });

    expect(listTopScores).toHaveBeenCalledWith(3);
    expect(result.current.data?.scores).toHaveLength(1);
    expect(result.current.data?.currentClientRank).toBe(7);
  });
});
