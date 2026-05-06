import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ScoreboardExtraLabel from "./ScoreboardExtraLabel";

describe("ScoreboardExtraLabel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("alternates rank and crown every 5 seconds", () => {
    render(
      <ScoreboardExtraLabel
        currentClientRank={8}
        isCurrentClientRankLoading={false}
      />,
    );

    const rankNode = screen.getByTestId("scoreboard-mobile-rank-label");
    const crownNode = screen.getByTestId("scoreboard-mobile-crown-label");

    expect(rankNode.className).toContain("opacity-100");
    expect(crownNode.className).toContain("opacity-0");

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(rankNode.className).toContain("opacity-0");
    expect(crownNode.className).toContain("opacity-100");

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(rankNode.className).toContain("opacity-100");
    expect(crownNode.className).toContain("opacity-0");
  });

  it("keeps rank visible while loading", () => {
    render(
      <ScoreboardExtraLabel
        currentClientRank={null}
        isCurrentClientRankLoading
      />,
    );

    const rankNode = screen.getByTestId("scoreboard-mobile-rank-label");
    const crownNode = screen.getByTestId("scoreboard-mobile-crown-label");

    expect(
      screen.getAllByTestId("scoreboard-rank-spinner").length,
    ).toBeGreaterThan(0);
    expect(rankNode.className).toContain("opacity-100");
    expect(crownNode.className).toContain("opacity-0");

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(rankNode.className).toContain("opacity-100");
    expect(crownNode.className).toContain("opacity-0");
  });
});
