import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DailyChallengesDialog from "./DailyChallengesDialog";

const dailyChallenges = {
  date: "2026-04-11",
  simple: {
    id: "simple-1",
    name: "First Guess",
    description: "Make at least 1 guess in a round",
    type: "simple" as const,
    conditionKey: "first_guess" as const,
  },
  complex: {
    id: "complex-1",
    name: "Genius",
    description: "Guess the word in 2 attempts or fewer",
    type: "complex" as const,
    conditionKey: "genius" as const,
  },
};

afterEach(cleanup);

describe("DailyChallengesDialog", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders both daily challenges and countdown", () => {
    render(
      <DailyChallengesDialog
        visible
        challenges={dailyChallenges}
        progress={[]}
        millisUntilEndOfDay={65 * 60 * 1000}
        onClose={() => undefined}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Daily Challenges" }),
    ).toBeTruthy();
    expect(screen.getByText("First Guess")).toBeTruthy();
    expect(screen.getByText("Genius")).toBeTruthy();
    expect(screen.getByText("+5 pts")).toBeTruthy();
    expect(screen.getByText("+15 pts")).toBeTruthy();
    expect(screen.getByText("01h 05m")).toBeTruthy();
  });

  it("marks completed challenge rows with strike-through styling", () => {
    render(
      <DailyChallengesDialog
        visible
        challenges={dailyChallenges}
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

    expect(screen.getByText("First Guess").className).toContain("line-through");
    expect(screen.getByText("Genius").className).not.toContain("line-through");
  });

  it("does not render when visible is false", () => {
    render(
      <DailyChallengesDialog
        visible={false}
        challenges={dailyChallenges}
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
      <DailyChallengesDialog
        visible
        challenges={dailyChallenges}
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
