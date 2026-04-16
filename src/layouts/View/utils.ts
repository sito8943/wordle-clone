import type { Player } from "@domain/wordle";
import { APP_VERSION_STORAGE_KEY, PLAYER_STORAGE_KEY } from "./constants";
import { DEFAULT_PLAYER } from "@providers/Player/constants";
import type { ViewVersionHistoryEntry } from "./types";

export const shouldAskForInitialPlayerName = (): boolean => {
  try {
    const userData = JSON.parse(
      localStorage.getItem(PLAYER_STORAGE_KEY) ?? "",
    ) as unknown as Player;

    return (
      localStorage.getItem(PLAYER_STORAGE_KEY) === null ||
      userData.name === DEFAULT_PLAYER.name
    );
  } catch {
    return false;
  }
};

export const getStoredAppVersion = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem(APP_VERSION_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const storeAppVersion = (version: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(APP_VERSION_STORAGE_KEY, version);
  } catch {
    // Ignore localStorage errors.
  }
};

const toNumericSegments = (version: string): number[] =>
  version
    .split(".")
    .map((segment) => Number.parseInt(segment, 10))
    .map((value) => (Number.isFinite(value) ? value : 0));

const comparePrereleaseTokens = (
  leftPrerelease: string,
  rightPrerelease: string,
): number => {
  const leftTokens = leftPrerelease.split(".");
  const rightTokens = rightPrerelease.split(".");
  const maxLength = Math.max(leftTokens.length, rightTokens.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftToken = leftTokens[index];
    const rightToken = rightTokens[index];

    if (leftToken === rightToken) {
      continue;
    }

    if (leftToken === undefined) {
      return -1;
    }

    if (rightToken === undefined) {
      return 1;
    }

    const leftNumeric = /^\d+$/.test(leftToken);
    const rightNumeric = /^\d+$/.test(rightToken);

    if (leftNumeric && rightNumeric) {
      return Number(leftToken) - Number(rightToken);
    }

    if (leftNumeric && !rightNumeric) {
      return -1;
    }

    if (!leftNumeric && rightNumeric) {
      return 1;
    }

    return leftToken.localeCompare(rightToken);
  }

  return 0;
};

export const compareAppVersions = (
  leftVersion: string,
  rightVersion: string,
): number => {
  const [leftCore, leftPrerelease] = leftVersion.split("-", 2);
  const [rightCore, rightPrerelease] = rightVersion.split("-", 2);
  const leftSegments = toNumericSegments(leftCore);
  const rightSegments = toNumericSegments(rightCore);
  const maxLength = Math.max(leftSegments.length, rightSegments.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftSegment = leftSegments[index] ?? 0;
    const rightSegment = rightSegments[index] ?? 0;

    if (leftSegment !== rightSegment) {
      return leftSegment - rightSegment;
    }
  }

  if (!leftPrerelease && !rightPrerelease) {
    return 0;
  }

  if (!leftPrerelease) {
    return 1;
  }

  if (!rightPrerelease) {
    return -1;
  }

  return comparePrereleaseTokens(leftPrerelease, rightPrerelease);
};

export const isVersionNewer = (
  currentVersion: string,
  previousVersion: string,
): boolean => compareAppVersions(currentVersion, previousVersion) > 0;

export const getVersionHistoryEntriesForUpdate = (
  history: ViewVersionHistoryEntry[],
  previousVersion: string,
  currentVersion: string,
): ViewVersionHistoryEntry[] =>
  [...history]
    .sort((left, right) => compareAppVersions(right.version, left.version))
    .filter(
      (entry) =>
        compareAppVersions(entry.version, currentVersion) <= 0 &&
        compareAppVersions(entry.version, previousVersion) > 0,
    );
