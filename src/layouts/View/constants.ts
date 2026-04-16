import type { ViewVersionHistoryEntry } from "./types";

export const PLAYER_STORAGE_KEY = "player";
export const APP_VERSION_STORAGE_KEY = "wordle:app-version";

export const VIEW_VERSION_HISTORY: ViewVersionHistoryEntry[] = [
  {
    version: "0.0.16-beta",
    releasedAt: "2026-04-16",
    changeKeys: [
      "home.versionUpdateDialog.changes.v0016beta.0",
      "home.versionUpdateDialog.changes.v0016beta.1",
      "home.versionUpdateDialog.changes.v0016beta.2",
    ],
  },
  {
    version: "0.0.16",
    releasedAt: "2026-04-13",
    changeKeys: [
      "home.versionUpdateDialog.changes.v0016.0",
      "home.versionUpdateDialog.changes.v0016.1",
    ],
  },
  {
    version: "0.0.15",
    releasedAt: "2026-04-08",
    changeKeys: [
      "home.versionUpdateDialog.changes.v0015.0",
      "home.versionUpdateDialog.changes.v0015.1",
    ],
  },
  {
    version: "0.0.14",
    releasedAt: "2026-04-02",
    changeKeys: [
      "home.versionUpdateDialog.changes.v0014.0",
      "home.versionUpdateDialog.changes.v0014.1",
      "home.versionUpdateDialog.changes.v0014.2",
    ],
  },
];
