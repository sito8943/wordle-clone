import { SCORE_LIMIT, WORDLE_GAME_STORAGE_KEY } from "./constants";
import type { RuntimeEnv } from "./types";
import { readBoolean, readOptionalString, readString } from "./utils";

const runtimeMode = import.meta.env.MODE;
const rawEnv = import.meta.env as Record<string, string | undefined>;
const defaultDevConsoleEnabled =
  runtimeMode === "development" || runtimeMode === "develpment";
const DEFAULT_DAILY_WORD_API_PATH = "/api/daily";

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:\/\//i;

const normalizeBaseUrl = (value?: string): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  return trimmed.replace(/\/+$/, "");
};

const resolveDailyWordApiUrl = (
  dailyWordApiUrl: string,
  backendUrl?: string,
): string => {
  const normalizedPath = dailyWordApiUrl.trim();

  if (
    ABSOLUTE_URL_PATTERN.test(normalizedPath) ||
    normalizedPath.startsWith("//")
  ) {
    return normalizedPath;
  }

  const normalizedBaseUrl = normalizeBaseUrl(backendUrl);
  if (!normalizedBaseUrl) {
    return normalizedPath.startsWith("/")
      ? normalizedPath
      : `/${normalizedPath}`;
  }

  const normalizedRelativePath = normalizedPath.startsWith("/")
    ? normalizedPath
    : `/${normalizedPath}`;

  return `${normalizedBaseUrl}${normalizedRelativePath}`;
};

const backendUrl = readOptionalString(import.meta.env.VITE_BACKEND_URL);
const convexUrl = readOptionalString(import.meta.env.VITE_CONVEX_URL);
const configuredDailyWordApiUrl = readString(
  import.meta.env.VITE_DAILY_WORD_API_URL,
  DEFAULT_DAILY_WORD_API_PATH,
);

const env: RuntimeEnv = {
  appVersion: readString(import.meta.env.VITE_APP_VERSION, "0.0.0"),
  mode: runtimeMode,
  baseUrl: readString(import.meta.env.BASE_URL, "/"),
  backendUrl,
  convexUrl,
  dailyWordApiUrl: resolveDailyWordApiUrl(
    configuredDailyWordApiUrl,
    backendUrl,
  ),
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
  soundEnabled: readBoolean(
    import.meta.env.VITE_SOUND_ENABLED ?? rawEnv.SOUND_ENABLED,
    true,
  ),
  hintsEnabled: readBoolean(
    import.meta.env.VITE_HINTS_ENABLED ?? rawEnv.HINTS_ENABLED,
    true,
  ),
  helpButtonEnabled: readBoolean(
    import.meta.env.VITE_HELP_BUTTON_ENABLED ?? rawEnv.HELP_BUTTON_ENABLED,
    true,
  ),
  challengesEnabled: readBoolean(
    import.meta.env.VITE_CHALLENGES_ENABLED ?? rawEnv.CHALLENGES_ENABLED,
    true,
  ),
  settingsDrawerEnabled: readBoolean(
    import.meta.env.VITE_SETTINGS_DRAWER_ENABLED ??
      rawEnv.SETTINGS_DRAWER_ENABLED,
    true,
  ),
  playOfflineStateEnabled: readBoolean(
    import.meta.env.VITE_PLAY_OFFLINE_STATE_ENABLED ??
      rawEnv.PLAY_OFFLINE_STATE_ENABLED,
    false,
  ),
  lightningModeEnabled: readBoolean(
    import.meta.env.VITE_LIGHTNING_MODE_ENABLED ??
      rawEnv.LIGHTNING_MODE_ENABLED,
    true,
  ),
  timerAutoPauseEnabled: readBoolean(
    import.meta.env.VITE_TIMER_AUTO_PAUSE_ENABLED ??
      rawEnv.TIMER_AUTO_PAUSE_ENABLED,
    false,
  ),
  difficultyEasyEnabled: readBoolean(
    import.meta.env.VITE_DIFFICULTY_EASY_ENABLED ??
      rawEnv.DIFFICULTY_EASY_ENABLED,
    true,
  ),
  difficultyNormalEnabled: readBoolean(
    import.meta.env.VITE_DIFFICULTY_NORMAL_ENABLED ??
      rawEnv.DIFFICULTY_NORMAL_ENABLED,
    true,
  ),
  difficultyHardEnabled: readBoolean(
    import.meta.env.VITE_DIFFICULTY_HARD_ENABLED ??
      rawEnv.DIFFICULTY_HARD_ENABLED,
    true,
  ),
  difficultyInsaneEnabled: readBoolean(
    import.meta.env.VITE_DIFFICULTY_INSANE_ENABLED ??
      rawEnv.DIFFICULTY_INSANE_ENABLED,
    true,
  ),
  scoreLimit: SCORE_LIMIT,
  wordleGameStorageKey: WORDLE_GAME_STORAGE_KEY,
  paypalDonationButtonUrl: readOptionalString(
    import.meta.env.VITE_PAYPAL_DONATION_BUTTON_URL,
  ),
};

export { env };
