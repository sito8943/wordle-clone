import {
  SCORE_LIMIT,
  WORDLE_GAME_STORAGE_KEY,
} from "./constant";
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

const env: RuntimeEnv = {
  mode: import.meta.env.MODE,
  baseUrl: readString(import.meta.env.BASE_URL, "/"),
  convexUrl: readOptionalString(import.meta.env.VITE_CONVEX_URL),
  scoreLimit: SCORE_LIMIT,
  wordleGameStorageKey: WORDLE_GAME_STORAGE_KEY,
};

export { env };
