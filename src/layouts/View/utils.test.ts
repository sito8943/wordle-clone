import { afterEach, describe, expect, it } from "vitest";
import {
  APP_VERSION_STORAGE_KEY,
  VIEW_VERSION_HISTORY,
} from "./constants";
import {
  compareAppVersions,
  getStoredAppVersion,
  getVersionHistoryEntriesForUpdate,
  isVersionNewer,
  storeAppVersion,
} from "./utils";

describe("View version helpers", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("compares semantic versions including prerelease tags", () => {
    expect(compareAppVersions("0.0.16", "0.0.15")).toBeGreaterThan(0);
    expect(compareAppVersions("0.0.16", "0.0.16-beta")).toBeGreaterThan(0);
    expect(compareAppVersions("0.0.16-beta", "0.0.16")).toBeLessThan(0);
    expect(compareAppVersions("0.0.16-beta.2", "0.0.16-beta.1")).toBeGreaterThan(
      0,
    );
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
