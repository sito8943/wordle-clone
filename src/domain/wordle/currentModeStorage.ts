import { WORDLE_MODE_IDS, resolveWordleModeId } from "./modeConfig";
import type { WordleModeId } from "./types";

export const CURRENT_WORDLE_MODE_STORAGE_KEY = "wordle:current-mode";

export const readCurrentWordleModeId = (): WordleModeId => {
  if (typeof window === "undefined") {
    return WORDLE_MODE_IDS.CLASSIC;
  }

  try {
    const rawModeId = window.localStorage.getItem(
      CURRENT_WORDLE_MODE_STORAGE_KEY,
    );
    return resolveWordleModeId(rawModeId);
  } catch {
    return WORDLE_MODE_IDS.CLASSIC;
  }
};

export const persistCurrentWordleModeId = (modeId: WordleModeId): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CURRENT_WORDLE_MODE_STORAGE_KEY, modeId);
  } catch {
    // Ignore localStorage write errors.
  }
};
