import { describe, expect, it } from "vitest";
import { CLASSIC_ROUND_CONFIG } from "./roundConfig";
import {
  resolveRoundConfigForMode,
  resolveWordleModeId,
  WORDLE_MODE_IDS,
} from "./modeConfig";

describe("modeConfig", () => {
  it("falls back to classic mode when value is missing or unknown", () => {
    expect(resolveWordleModeId()).toBe(WORDLE_MODE_IDS.CLASSIC);
    expect(resolveWordleModeId(null)).toBe(WORDLE_MODE_IDS.CLASSIC);
    expect(resolveWordleModeId("unsupported")).toBe(WORDLE_MODE_IDS.CLASSIC);
  });

  it("keeps supported mode ids", () => {
    expect(resolveWordleModeId(WORDLE_MODE_IDS.CLASSIC)).toBe(
      WORDLE_MODE_IDS.CLASSIC,
    );
    expect(resolveWordleModeId(WORDLE_MODE_IDS.ZEN)).toBe(WORDLE_MODE_IDS.ZEN);
    expect(resolveWordleModeId(WORDLE_MODE_IDS.LIGHTNING)).toBe(
      WORDLE_MODE_IDS.LIGHTNING,
    );
    expect(resolveWordleModeId(WORDLE_MODE_IDS.DAILY)).toBe(
      WORDLE_MODE_IDS.DAILY,
    );
  });

  it("resolves current mode configs to classic defaults", () => {
    expect(resolveRoundConfigForMode(WORDLE_MODE_IDS.CLASSIC)).toEqual(
      CLASSIC_ROUND_CONFIG,
    );
    expect(resolveRoundConfigForMode(WORDLE_MODE_IDS.ZEN)).toEqual(
      CLASSIC_ROUND_CONFIG,
    );
    expect(resolveRoundConfigForMode(WORDLE_MODE_IDS.LIGHTNING)).toEqual(
      CLASSIC_ROUND_CONFIG,
    );
    expect(resolveRoundConfigForMode(WORDLE_MODE_IDS.DAILY)).toEqual(
      CLASSIC_ROUND_CONFIG,
    );
  });

  it("allows overriding dimensions on top of mode defaults", () => {
    expect(
      resolveRoundConfigForMode(WORDLE_MODE_IDS.CLASSIC, {
        lettersPerRow: 7,
        maxGuesses: 8,
      }),
    ).toEqual({
      lettersPerRow: 7,
      maxGuesses: 8,
    });
  });
});
