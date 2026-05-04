import type { ViewVersionHistoryEntry } from "../../types";

export type VersionUpdateDialogProps = {
  visible: boolean;
  onClose: () => void;
  onOpenCurrentChangelog: () => void;
  onOpenVersionChangelog: (version: string) => void;
  currentVersion: string;
  previousVersion: string | null;
  versionHistory: ViewVersionHistoryEntry[];
};
