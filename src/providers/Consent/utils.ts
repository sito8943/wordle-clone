import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "./constants";
import type { StoredConsent } from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** The stored choice, or null when there is none, it is malformed or from an older version. */
export const readStoredConsent = (
  storageKey: string = CONSENT_STORAGE_KEY,
): StoredConsent | null => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    const stored: unknown = JSON.parse(raw);
    if (!isRecord(stored)) {
      return null;
    }
    const { analytics, version, decidedAt } = stored;
    if (
      typeof analytics !== "boolean" ||
      version !== CONSENT_VERSION ||
      typeof decidedAt !== "string"
    ) {
      return null;
    }
    return { analytics, version, decidedAt };
  } catch {
    return null;
  }
};

export const persistConsent = (
  analytics: boolean,
  now: Date = new Date(),
  storageKey: string = CONSENT_STORAGE_KEY,
): StoredConsent => {
  const consent: StoredConsent = {
    analytics,
    version: CONSENT_VERSION,
    decidedAt: now.toISOString(),
  };
  try {
    localStorage.setItem(storageKey, JSON.stringify(consent));
  } catch {
    // Blocked storage: the choice lasts until reload.
  }
  return consent;
};
