import { afterEach, describe, expect, it } from "vitest";
import {
  APP_VERSION_STORAGE_KEY,
  PREVIOUS_APP_VERSION_STORAGE_KEY,
  VIEW_VERSION_HISTORY,
} from "./constants";
import {
  clearPendingPreviousAppVersion,
  compareAppVersions,
  getPendingPreviousAppVersion,
  getStoredAppVersion,
  getVersionHistoryEntriesForUpdate,
  isVersionNewer,
  resetBrowserStorageOnAppUpdate,
  storeAppVersion,
} from "./utils";

describe("View version helpers", () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("compares semantic versions including prerelease tags", () => {
    expect(compareAppVersions("0.0.16", "0.0.15")).toBeGreaterThan(0);
    expect(compareAppVersions("0.0.16", "0.0.16-beta")).toBeGreaterThan(0);
    expect(compareAppVersions("0.0.16-beta", "0.0.16")).toBeLessThan(0);
    expect(
      compareAppVersions("0.0.16-beta.2", "0.0.16-beta.1"),
    ).toBeGreaterThan(0);
  });

  it("detects when the current app version is newer", () => {
    expect(isVersionNewer("0.0.16-beta", "0.0.15")).toBe(true);
    expect(isVersionNewer("0.0.15", "0.0.16-beta")).toBe(false);
  });

  it("stores and reads app version in localStorage", () => {
    storeAppVersion("0.0.16-beta");

    expect(localStorage.getItem(APP_VERSION_STORAGE_KEY)).toBe("0.0.16-beta");
    expect(getStoredAppVersion()).toBe("0.0.16-beta");
  });

  it("resets localStorage and sessionStorage when a newer app version is detected", () => {
    localStorage.setItem(APP_VERSION_STORAGE_KEY, "0.0.15");
    localStorage.setItem("wordle:test-local", "value");
    sessionStorage.setItem("wordle:test-session", "value");

    resetBrowserStorageOnAppUpdate("0.0.16-beta");

    expect(localStorage.getItem("wordle:test-local")).toBeNull();
    expect(sessionStorage.getItem("wordle:test-session")).toBeNull();
    expect(localStorage.getItem(APP_VERSION_STORAGE_KEY)).toBe("0.0.16-beta");
    expect(localStorage.getItem(PREVIOUS_APP_VERSION_STORAGE_KEY)).toBe(
      "0.0.15",
    );
  });

  it("does not reset storage when app version has not changed", () => {
    localStorage.setItem(APP_VERSION_STORAGE_KEY, "0.0.16-beta");
    localStorage.setItem("wordle:test-local", "value");
    sessionStorage.setItem("wordle:test-session", "value");

    resetBrowserStorageOnAppUpdate("0.0.16-beta");

    expect(localStorage.getItem("wordle:test-local")).toBe("value");
    expect(sessionStorage.getItem("wordle:test-session")).toBe("value");
    expect(localStorage.getItem(PREVIOUS_APP_VERSION_STORAGE_KEY)).toBeNull();
  });

  it("reads and clears pending previous app version", () => {
    localStorage.setItem(PREVIOUS_APP_VERSION_STORAGE_KEY, "0.0.15");

    expect(getPendingPreviousAppVersion()).toBe("0.0.15");

    clearPendingPreviousAppVersion();
    expect(getPendingPreviousAppVersion()).toBeNull();
  });

  it("returns changelog entries between previous and current versions", () => {
    const entries = getVersionHistoryEntriesForUpdate(
      VIEW_VERSION_HISTORY,
      "0.0.15",
      "0.0.16-beta",
    );

    expect(entries.map((entry) => entry.version)).toEqual([
      "0.0.16-beta",
      "0.0.16",
    ]);
  });
});
