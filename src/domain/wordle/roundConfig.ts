import { MAX_GUESSES, WORD_LENGTH } from "./constants";
import type { BoardRoundConfig } from "./types";

export const CLASSIC_ROUND_CONFIG: BoardRoundConfig = {
  lettersPerRow: WORD_LENGTH,
  maxGuesses: MAX_GUESSES,
};

const coercePositiveInteger = (value: number | undefined, fallback: number) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return Math.floor(value);
};

export const resolveBoardRoundConfig = (
  config?: Partial<BoardRoundConfig>,
): BoardRoundConfig => ({
  lettersPerRow: coercePositiveInteger(
    config?.lettersPerRow,
    CLASSIC_ROUND_CONFIG.lettersPerRow,
  ),
  maxGuesses: coercePositiveInteger(
    config?.maxGuesses,
    CLASSIC_ROUND_CONFIG.maxGuesses,
  ),
});
