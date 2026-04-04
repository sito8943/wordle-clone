import { SCORE_LIMIT, WORDLE_GAME_STORAGE_KEY } from "./constants";
import type { RuntimeEnv } from "./types";
import { readBoolean, readOptionalString, readString } from "./utils";

const runtimeMode = import.meta.env.MODE;
const rawEnv = import.meta.env as Record<string, string | undefined>;
const defaultDevConsoleEnabled =
  runtimeMode === "development" || runtimeMode === "develpment";

const env: RuntimeEnv = {
  mode: runtimeMode,
  baseUrl: readString(import.meta.env.BASE_URL, "/"),
  convexUrl: readOptionalString(import.meta.env.VITE_CONVEX_URL),
  wordReportPhoneNumber: readOptionalString(
    import.meta.env.VITE_WORD_REPORT_PHONE_NUMBER,
  ),
  wordListButtonEnabled: readBoolean(
    import.meta.env.VITE_WORD_LIST_BUTTON_ENABLED,
    true,
  ),
  wordReportButtonEnabled: readBoolean(
    import.meta.env.VITE_WORD_REPORT_BUTTON_ENABLED,
    true,
  ),
  paypalDonationButtonEnabled: readBoolean(
    import.meta.env.VITE_PAYPAL_DONATION_BUTTON_ENABLED,
    true,
  ),
  shareButtonEnabled: readBoolean(
    import.meta.env.VITE_SHARE_BUTTON_ENABLED,
    true,
  ),
  devConsoleEnabled: readBoolean(
    import.meta.env.VITE_DEV_CONSOLE_ENABLED,
    defaultDevConsoleEnabled,
  ),
  hintsEnabled: readBoolean(
    import.meta.env.VITE_HINTS_ENABLED ?? rawEnv.HINTS_ENABLED,
    true,
  ),
  helpButtonEnabled: readBoolean(
    import.meta.env.VITE_HELP_BUTTON_ENABLED ?? rawEnv.HELP_BUTTON_ENABLED,
    true,
  ),
  scoreLimit: SCORE_LIMIT,
  wordleGameStorageKey: WORDLE_GAME_STORAGE_KEY,
  paypalDonationButtonUrl: readOptionalString(
    import.meta.env.VITE_PAYPAL_DONATION_BUTTON_URL,
  ),
};

export { env };
