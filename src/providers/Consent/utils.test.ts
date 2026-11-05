import { beforeEach, describe, expect, it } from "vitest";
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "./constants";
import { persistConsent, readStoredConsent } from "./utils";

describe("consent storage", () => {
  beforeEach(() => localStorage.clear());

  it("has no choice until the player makes one", () => {
    expect(readStoredConsent()).toBeNull();
  });

  it("stores the choice with its version and date", () => {
    const now = new Date("2026-11-05T10:00:00Z");
    expect(persistConsent(true, now)).toEqual({
      analytics: true,
      version: CONSENT_VERSION,
      decidedAt: "2026-11-05T10:00:00.000Z",
    });
    expect(readStoredConsent()?.analytics).toBe(true);
    persistConsent(false, now);
    expect(readStoredConsent()?.analytics).toBe(false);
  });

  it("asks again for an older version or a malformed value", () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        analytics: true,
        version: CONSENT_VERSION - 1,
        decidedAt: "x",
      }),
    );
    expect(readStoredConsent()).toBeNull();
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        analytics: "yes",
        version: CONSENT_VERSION,
        decidedAt: "x",
      }),
    );
    expect(readStoredConsent()).toBeNull();
    localStorage.setItem(CONSENT_STORAGE_KEY, "{not json");
    expect(readStoredConsent()).toBeNull();
  });
});
