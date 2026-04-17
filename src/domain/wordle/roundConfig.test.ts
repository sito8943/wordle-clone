import { describe, expect, it } from "vitest";
import { MAX_GUESSES, WORD_LENGTH } from "./constants";
import { CLASSIC_ROUND_CONFIG, resolveBoardRoundConfig } from "./roundConfig";

describe("roundConfig", () => {
  it("exposes classic defaults aligned with constants", () => {
    expect(CLASSIC_ROUND_CONFIG).toEqual({
      lettersPerRow: WORD_LENGTH,
      maxGuesses: MAX_GUESSES,
    });
  });

  it("uses provided round settings when valid", () => {
    expect(
      resolveBoardRoundConfig({
        lettersPerRow: 7,
        maxGuesses: 9,
      }),
    ).toEqual({
      lettersPerRow: 7,
      maxGuesses: 9,
    });
  });

  it("falls back to classic defaults when values are invalid", () => {
    expect(
      resolveBoardRoundConfig({
        lettersPerRow: 0,
        maxGuesses: -1,
      }),
    ).toEqual(CLASSIC_ROUND_CONFIG);
  });
});
