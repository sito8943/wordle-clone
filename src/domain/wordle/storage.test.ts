import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearPersistedGameState,
  persistGameState,
  readPersistedGameState,
} from "./storage";
import type { PersistedGameState } from "./types";

const makeState = (
  overrides: Partial<PersistedGameState> = {},
): PersistedGameState => ({
  ...({
    sessionId: "session-1",
    gameId: "game-1",
    seed: 123,
    answer: "CRANE",
    guesses: [],
    current: "",
    gameOver: false,
  } satisfies PersistedGameState),
  ...overrides,
});

describe("readPersistedGameState", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("returns null when nothing is stored", () => {
    expect(readPersistedGameState()).toBeNull();
  });

  it("returns the parsed value when valid JSON is stored", () => {
    const state = makeState({ current: "AB" });
    localStorage.setItem(
      import.meta.env.VITE_WORDLE_GAME_STORAGE_KEY ?? "wordle:game",
      JSON.stringify(state),
    );
    const result = readPersistedGameState();
    expect(result).toMatchObject({ current: "AB" });
  });

  it("returns null when stored value is invalid JSON", () => {
    const key = import.meta.env.VITE_WORDLE_GAME_STORAGE_KEY ?? "wordle:game";
    localStorage.setItem(key, "not-valid-json{{{");
    expect(readPersistedGameState()).toBeNull();
  });
});

describe("persistGameState", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("writes state to localStorage when game is in progress", () => {
    const state = makeState({ current: "CR" });
    persistGameState(state);
    const key = import.meta.env.VITE_WORDLE_GAME_STORAGE_KEY ?? "wordle:game";
    expect(JSON.parse(localStorage.getItem(key)!)).toEqual({
      sessionId: "session-1",
      gameId: "game-1",
      seed: 123,
      guesses: [],
      current: "CR",
      gameOver: false,
    });
  });

  it("removes state from localStorage when game has no progress", () => {
    const key = import.meta.env.VITE_WORDLE_GAME_STORAGE_KEY ?? "wordle:game";
    localStorage.setItem(key, JSON.stringify(makeState({ current: "CR" })));

    persistGameState(makeState()); // empty state — no progress
    expect(localStorage.getItem(key)).toBeNull();
  });

  it("does not throw when localStorage.setItem throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => persistGameState(makeState({ current: "CR" }))).not.toThrow();
    vi.restoreAllMocks();
  });
});

describe("clearPersistedGameState", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("removes the stored game state", () => {
    const key = import.meta.env.VITE_WORDLE_GAME_STORAGE_KEY ?? "wordle:game";
    localStorage.setItem(key, JSON.stringify(makeState({ current: "CR" })));

    clearPersistedGameState();

    expect(localStorage.getItem(key)).toBeNull();
  });

  it("does not throw when nothing is stored", () => {
    expect(() => clearPersistedGameState()).not.toThrow();
  });

  it("does not throw when localStorage.removeItem throws", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementationOnce(() => {
      throw new Error("StorageError");
    });
    expect(() => clearPersistedGameState()).not.toThrow();
    vi.restoreAllMocks();
  });
});
