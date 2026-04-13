import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChallengesDialog from "./ChallengesDialog";

const challenges = {
  date: "2026-04-11",
  simple: {
    id: "simple-1",
    name: "Steady Player",
    description: "Win a round",
    type: "simple" as const,
    conditionKey: "steady_player" as const,
  },
  complex: {
    id: "complex-1",
    name: "Speedster",
    description: "Win in less than 60 seconds",
    type: "complex" as const,
    conditionKey: "speedster" as const,
  },
};

afterEach(cleanup);

describe("ChallengesDialog", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders both daily challenges and countdown", () => {
    render(
      <ChallengesDialog
        visible
        challenges={challenges}
        progress={[]}
        millisUntilEndOfDay={65 * 60 * 1000}
        onClose={() => undefined}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Challenges" })).toBeTruthy();
    expect(screen.getByText("Steady Player")).toBeTruthy();
    expect(screen.getByText("Speedster")).toBeTruthy();
    expect(screen.getByText("+5 pts")).toBeTruthy();
    expect(screen.getByText("+15 pts")).toBeTruthy();
    expect(screen.getByText("Daily reset in 01h 05m")).toBeTruthy();
  });

  it("marks completed challenge rows with strike-through styling", () => {
    render(
      <ChallengesDialog
        visible
        challenges={challenges}
        progress={[
          {
            _id: "progress-1",
            profileId: "profile-1",
            challengeId: "simple-1",
            date: "2026-04-11",
            completed: true,
            pointsAwarded: 5,
          },
        ]}
        millisUntilEndOfDay={10_000}
        onClose={() => undefined}
      />,
    );

    expect(screen.getByText("Steady Player").className).toContain(
      "line-through",
    );
    expect(screen.getByText("Speedster").className).not.toContain(
      "line-through",
    );
  });

  it("does not render when visible is false", () => {
    render(
      <ChallengesDialog
        visible={false}
        challenges={challenges}
        progress={[]}
        millisUntilEndOfDay={10_000}
        onClose={() => undefined}
      />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("calls onClose after clicking the close action", () => {
    const onClose = vi.fn();

    render(
      <ChallengesDialog
        visible
        challenges={challenges}
        progress={[]}
        millisUntilEndOfDay={10_000}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    act(() => {
      vi.runAllTimers();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
