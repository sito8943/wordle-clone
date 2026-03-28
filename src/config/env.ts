import { SCORE_LIMIT, WORDLE_GAME_STORAGE_KEY } from "./constants";
import type { RuntimeEnv } from "./types";
import { readBoolean, readOptionalString, readString } from "./utils";

const env: RuntimeEnv = {
  mode: import.meta.env.MODE,
  baseUrl: readString(import.meta.env.BASE_URL, "/"),
  convexUrl: readOptionalString(import.meta.env.VITE_CONVEX_URL),
  wordReportPhoneNumber: readOptionalString(
    import.meta.env.VITE_WORD_REPORT_PHONE_NUMBER,
  ),
  wordListButtonEnabled: readBoolean(
    import.meta.env.VITE_WORD_LIST_BUTTON_ENABLED,
    true,
  ),
  scoreLimit: SCORE_LIMIT,
  wordleGameStorageKey: WORDLE_GAME_STORAGE_KEY,
};

export { env };
