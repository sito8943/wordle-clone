import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearHardModeTimerSnapshot,
  setHardModeTimerSnapshot,
} from "./utils";
import { useHardModeTimer } from "./useHardModeTimer";

describe("useHardModeTimer", () => {
  beforeEach(() => {
    clearHardModeTimerSnapshot();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    clearHardModeTimerSnapshot();
    vi.useRealTimers();
  });

  it("starts once the player begins typing and counts down", () => {
    const forceLoss = vi.fn();
    const { result, rerender } = renderHook(
      ({
        guessesLength,
        currentLength,
      }: {
        guessesLength: number;
        currentLength: number;
      }) =>
        useHardModeTimer({
          sessionId: "session-1",
          hardModeEnabled: true,
          hasInProgressGameAtMount: false,
          boardVersion: 1,
          showResumeDialog: false,
          gameOver: false,
          guessesLength,
          currentLength,
          forceLoss,
        }),
      {
        initialProps: {
          guessesLength: 0,
          currentLength: 0,
        },
      },
    );

    expect(result.current.hardModeTimerStarted).toBe(false);

    rerender({
      guessesLength: 0,
      currentLength: 1,
    });

    expect(result.current.hardModeTimerStarted).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.hardModeSecondsLeft).toBe(59);
    expect(result.current.hardModeTickPulse).toBe(1);
    expect(forceLoss).not.toHaveBeenCalled();
  });

  it("forces a loss when the timer reaches zero", () => {
    const forceLoss = vi.fn();

    renderHook(() =>
      useHardModeTimer({
        sessionId: "session-1",
        hardModeEnabled: true,
        hasInProgressGameAtMount: true,
        boardVersion: 1,
        showResumeDialog: false,
        gameOver: false,
        guessesLength: 1,
        currentLength: 0,
        forceLoss,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(forceLoss).toHaveBeenCalledTimes(1);
  });

  it("restores a persisted in-memory snapshot for the same session", () => {
    setHardModeTimerSnapshot({
      sessionId: "session-1",
      secondsLeft: 12,
      timerStarted: true,
    });

    const { result } = renderHook(() =>
      useHardModeTimer({
        sessionId: "session-1",
        hardModeEnabled: true,
        hasInProgressGameAtMount: true,
        boardVersion: 1,
        showResumeDialog: false,
        gameOver: false,
        guessesLength: 1,
        currentLength: 0,
        forceLoss: vi.fn(),
      }),
    );

    expect(result.current.hardModeSecondsLeft).toBe(12);
    expect(result.current.hardModeTimerStarted).toBe(true);
    expect(result.current.showHardModeFinalStretchBar).toBe(true);
  });

  it("resets the timer when the board version changes", () => {
    const { result, rerender } = renderHook(
      ({ boardVersion }: { boardVersion: number }) =>
        useHardModeTimer({
          sessionId: "session-1",
          hardModeEnabled: true,
          hasInProgressGameAtMount: false,
          boardVersion,
          showResumeDialog: false,
          gameOver: false,
          guessesLength: 1,
          currentLength: 0,
          forceLoss: vi.fn(),
        }),
      {
        initialProps: { boardVersion: 1 },
      },
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.hardModeSecondsLeft).toBe(57);

    rerender({ boardVersion: 2 });

    expect(result.current.hardModeSecondsLeft).toBe(60);
    expect(result.current.hardModeTimerStarted).toBe(true);
  });
});
