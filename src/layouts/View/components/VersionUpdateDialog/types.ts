import type { ViewVersionHistoryEntry } from "../../types";

export type VersionUpdateDialogProps = {
  visible: boolean;
  onClose: () => void;
  currentVersion: string;
  changelogEntries: ViewVersionHistoryEntry[];
  versionHistory: ViewVersionHistoryEntry[];
};
