import type { ViewVersionHistoryEntry } from "../../types";

export type VersionUpdateDialogProps = {
  visible: boolean;
  onClose: () => void;
  currentVersion: string;
  previousVersion: string | null;
  changelogEntries: ViewVersionHistoryEntry[];
  versionHistory: ViewVersionHistoryEntry[];
};
