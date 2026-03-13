import { SCORE_LIMIT, WORDLE_GAME_STORAGE_KEY } from "./constants";
import type { RuntimeEnv } from "./types";

const readString = (value: string | undefined, fallback: string): string => {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const readOptionalString = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const readBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
};

const env: RuntimeEnv = {
  mode: import.meta.env.MODE,
  baseUrl: readString(import.meta.env.BASE_URL, "/"),
  convexUrl: readOptionalString(import.meta.env.VITE_CONVEX_URL),
  wordListButtonEnabled: readBoolean(
    import.meta.env.VITE_WORD_LIST_BUTTON_ENABLED,
    true,
  ),
  scoreLimit: SCORE_LIMIT,
  wordleGameStorageKey: WORDLE_GAME_STORAGE_KEY,
};

export { env };
