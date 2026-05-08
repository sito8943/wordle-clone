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
      JSON.stringify({ gameId: "game-1", hintsUsed: 1 }),
    );

    const { result } = renderHook(() =>
      useHintController({
        answer: "APPLE",
        gameId: "game-1",
        difficulty: "normal",
        hasInProgressGameAtMount: true,
        showResumeDialog: false,
        gameOver: false,
        current: "",
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
        gameId: "game-1",
        difficulty: "easy",
        hasInProgressGameAtMount: false,
        showResumeDialog: false,
        gameOver: false,
        current: "",
        revealHint,
      }),
    );

    let hintUsed = false;
    act(() => {
      hintUsed = result.current.useHint();
    });

    expect(hintUsed).toBe(true);
    expect(revealHint).toHaveBeenCalledWith("correct");
    expect(result.current.hintsRemaining).toBe(1);
    expect(
      JSON.parse(localStorage.getItem(HINT_USAGE_STORAGE_KEY)!),
    ).toMatchObject({
      gameId: "game-1",
      hintsUsed: 1,
    });
  });

  it("returns false when the hint cannot be used", () => {
    const revealHint = vi.fn().mockReturnValue(true);
    const { result } = renderHook(() =>
      useHintController({
        answer: "APPLE",
        gameId: "game-1",
        difficulty: "easy",
        hasInProgressGameAtMount: false,
        showResumeDialog: true,
        gameOver: false,
        current: "",
        revealHint,
      }),
    );

    let hintUsed = true;
    act(() => {
      hintUsed = result.current.useHint();
    });

    expect(hintUsed).toBe(false);
    expect(revealHint).not.toHaveBeenCalled();
  });

  it("syncs hint state after a storage event from another tab", () => {
    const { result } = renderHook(() =>
      useHintController({
        answer: "APPLE",
        gameId: "game-1",
        difficulty: "easy",
        hasInProgressGameAtMount: false,
        showResumeDialog: false,
        gameOver: false,
        current: "",
        revealHint: vi.fn().mockReturnValue(true),
      }),
    );

    act(() => {
      localStorage.setItem(
        HINT_USAGE_STORAGE_KEY,
        JSON.stringify({ gameId: "game-1", hintsUsed: 2 }),
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
      JSON.stringify({ gameId: "game-1", hintsUsed: 1 }),
    );

    const { result } = renderHook(() =>
      useHintController({
        answer: "APPLE",
        gameId: "game-1",
        difficulty: "easy",
        hasInProgressGameAtMount: true,
        showResumeDialog: false,
        gameOver: false,
        current: "",
        revealHint: vi.fn().mockReturnValue(true),
      }),
    );

    act(() => {
      result.current.resetHints();
    });

    expect(result.current.hintsRemaining).toBe(2);
    expect(localStorage.getItem(HINT_USAGE_STORAGE_KEY)).toBeNull();
  });

  it("keeps hint enabled when there are empty slots represented as spaces", () => {
    const revealHint = vi.fn().mockReturnValue(true);
    const { result } = renderHook(() =>
      useHintController({
        answer: "APPLE",
        gameId: "game-1",
        difficulty: "easy",
        hasInProgressGameAtMount: false,
        showResumeDialog: false,
        gameOver: false,
        current: "A C E",
        revealHint,
      }),
    );

    expect(result.current.hintButtonDisabled).toBe(false);

    let hintUsed = false;
    act(() => {
      hintUsed = result.current.useHint();
    });

    expect(hintUsed).toBe(true);
    expect(revealHint).toHaveBeenCalledWith("correct");
  });

  it("disables hints when the configured row length is reached", () => {
    const { result } = renderHook(() =>
      useHintController({
        answer: "APPLE",
        gameId: "game-1",
        difficulty: "easy",
        roundConfig: { lettersPerRow: 3, maxGuesses: 6 },
        hasInProgressGameAtMount: false,
        showResumeDialog: false,
        gameOver: false,
        current: "ABC",
        revealHint: vi.fn().mockReturnValue(true),
      }),
    );

    expect(result.current.hintButtonDisabled).toBe(true);
  });

  it("supports daily hint overrides regardless of difficulty", () => {
    const revealHint = vi.fn().mockReturnValue(true);
    const { result } = renderHook(() =>
      useHintController({
        answer: "LECTURA",
        gameId: "game-1",
        difficulty: "hard",
        hintsLimitOverride: 2,
        hintStatusOverride: "present",
        hasInProgressGameAtMount: false,
        showResumeDialog: false,
        gameOver: false,
        current: "",
        revealHint,
      }),
    );

    let hintUsed = false;
    act(() => {
      hintUsed = result.current.useHint();
    });

    expect(hintUsed).toBe(true);
    expect(revealHint).toHaveBeenCalledWith("present");
    expect(result.current.hintsRemaining).toBe(1);
  });

  it("supports unlimited green hints without persisting usage", () => {
    const revealHint = vi.fn().mockReturnValue(true);
    const { result } = renderHook(() =>
      useHintController({
        answer: "LECTURA",
        gameId: "game-zen",
        difficulty: "hard",
        unlimitedHints: true,
        hintStatusOverride: "correct",
        hasInProgressGameAtMount: false,
        showResumeDialog: false,
        gameOver: false,
        current: "",
        revealHint,
      }),
    );

    let firstHintUsed = false;
    let secondHintUsed = false;
    act(() => {
      firstHintUsed = result.current.useHint();
      secondHintUsed = result.current.useHint();
    });

    expect(firstHintUsed).toBe(true);
    expect(secondHintUsed).toBe(true);
    expect(revealHint).toHaveBeenCalledTimes(2);
    expect(revealHint).toHaveBeenNthCalledWith(1, "correct");
    expect(revealHint).toHaveBeenNthCalledWith(2, "correct");
    expect(result.current.hintsEnabledForDifficulty).toBe(true);
    expect(result.current.hintButtonDisabled).toBe(false);
    expect(result.current.hintsRemaining).toBe(Number.POSITIVE_INFINITY);
    expect(localStorage.getItem(HINT_USAGE_STORAGE_KEY)).toBeNull();
  });
});
