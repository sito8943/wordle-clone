import type { ConsentContextType } from "./types";

/** localStorage key of the choice; kept across the app-update storage reset. */
export const CONSENT_STORAGE_KEY = "wordle:consent";

/**
 * Bump when the notice text or the optional technologies change: stored
 * choices from an older version are asked again.
 */
export const CONSENT_VERSION = 1;

/** Outside the provider (tests, isolated renders): no choice, no notice. */
export const DEFAULT_CONSENT_CONTEXT: ConsentContextType = {
  analytics: null,
  isNoticeOpen: false,
  setAnalytics: () => undefined,
  openNotice: () => undefined,
};
