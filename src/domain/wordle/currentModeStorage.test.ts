import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WORDLE_MODE_IDS } from "./modeConfig";
import {
  CURRENT_WORDLE_MODE_STORAGE_KEY,
  persistCurrentWordleModeId,
  readCurrentWordleModeId,
} from "./currentModeStorage";

describe("currentModeStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("defaults to classic when nothing is stored", () => {
    expect(readCurrentWordleModeId()).toBe(WORDLE_MODE_IDS.CLASSIC);
  });

  it("stores and reads back a valid mode id", () => {
    persistCurrentWordleModeId(WORDLE_MODE_IDS.LIGHTNING);

    expect(localStorage.getItem(CURRENT_WORDLE_MODE_STORAGE_KEY)).toBe(
      WORDLE_MODE_IDS.LIGHTNING,
    );
    expect(readCurrentWordleModeId()).toBe(WORDLE_MODE_IDS.LIGHTNING);
  });

  it("falls back to classic when stored value is invalid", () => {
    localStorage.setItem(CURRENT_WORDLE_MODE_STORAGE_KEY, "unsupported-mode");

    expect(readCurrentWordleModeId()).toBe(WORDLE_MODE_IDS.CLASSIC);
  });

  it("does not throw when localStorage write fails", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() =>
      persistCurrentWordleModeId(WORDLE_MODE_IDS.CLASSIC),
    ).not.toThrow();
  });
});
