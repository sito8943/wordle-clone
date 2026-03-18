import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HINT_USAGE_STORAGE_KEY } from "./constants";
import { useHintController } from "./useHintController";

describe("useHintController", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("restores persisted hints for the same answer on mount", () => {
    localStorage.setItem(
      HINT_USAGE_STORAGE_KEY,
      JSON.stringify({ answer: "APPLE", hintsUsed: 1 }),
    );

    const { result } = renderHook(() =>
      useHintController({
        answer: "APPLE",
        difficulty: "normal",
        hasInProgressGameAtMount: true,
        showResumeDialog: false,
        gameOver: false,
        currentLength: 0,
        revealHint: vi.fn().mockReturnValue(true),
      }),
    );

    expect(result.current.hintsRemaining).toBe(0);
    expect(result.current.hintButtonDisabled).toBe(true);
  });

  it("uses a hint, updates remaining count and persists usage", () => {
    const revealHint = vi.fn().mockReturnValue(true);
    const { result } = renderHook(() =>
      useHintController({
        answer: "APPLE",
        difficulty: "easy",
        hasInProgressGameAtMount: false,
        showResumeDialog: false,
        gameOver: false,
        currentLength: 0,
        revealHint,
      }),
    );

    act(() => {
      result.current.useHint();
    });

    expect(revealHint).toHaveBeenCalledWith("correct");
    expect(result.current.hintsRemaining).toBe(1);
    expect(JSON.parse(localStorage.getItem(HINT_USAGE_STORAGE_KEY)!)).toEqual({
      answer: "APPLE",
      hintsUsed: 1,
    });
  });

  it("syncs hint state after a storage event from another tab", () => {
    const { result } = renderHook(() =>
      useHintController({
        answer: "APPLE",
        difficulty: "easy",
        hasInProgressGameAtMount: false,
        showResumeDialog: false,
        gameOver: false,
        currentLength: 0,
        revealHint: vi.fn().mockReturnValue(true),
      }),
    );

    act(() => {
      localStorage.setItem(
        HINT_USAGE_STORAGE_KEY,
        JSON.stringify({ answer: "APPLE", hintsUsed: 2 }),
      );
      window.dispatchEvent(
        new StorageEvent("storage", { key: HINT_USAGE_STORAGE_KEY }),
      );
    });

    expect(result.current.hintsRemaining).toBe(0);
    expect(result.current.hintButtonDisabled).toBe(true);
  });

  it("clears persisted hint usage when resetHints is called", () => {
    localStorage.setItem(
      HINT_USAGE_STORAGE_KEY,
      JSON.stringify({ answer: "APPLE", hintsUsed: 1 }),
    );

    const { result } = renderHook(() =>
      useHintController({
        answer: "APPLE",
        difficulty: "easy",
        hasInProgressGameAtMount: true,
        showResumeDialog: false,
        gameOver: false,
        currentLength: 0,
        revealHint: vi.fn().mockReturnValue(true),
      }),
    );

    act(() => {
      result.current.resetHints();
    });

    expect(result.current.hintsRemaining).toBe(2);
    expect(localStorage.getItem(HINT_USAGE_STORAGE_KEY)).toBeNull();
  });
});
