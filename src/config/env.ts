type RuntimeEnv = {
  mode: string;
  baseUrl: string;
  convexUrl?: string;
  scoreLimit: number;
  wordleGameStorageKey: string;
};

const SCORE_LIMIT_DEFAULT = 10;
const SCORE_LIMIT_MIN = 1;
const SCORE_LIMIT_MAX = 50;
const WORDLE_GAME_STORAGE_KEY_DEFAULT = "wordle:game";

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

const readInt = (
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
};

const env: RuntimeEnv = {
  mode: import.meta.env.MODE,
  baseUrl: readString(import.meta.env.BASE_URL, "/"),
  convexUrl: readOptionalString(import.meta.env.VITE_CONVEX_URL),
  scoreLimit: readInt(
    import.meta.env.VITE_SCORE_LIMIT,
    SCORE_LIMIT_DEFAULT,
    SCORE_LIMIT_MIN,
    SCORE_LIMIT_MAX,
  ),
  wordleGameStorageKey: readString(
    import.meta.env.VITE_WORDLE_GAME_STORAGE_KEY,
    WORDLE_GAME_STORAGE_KEY_DEFAULT,
  ),
};

export { env };
