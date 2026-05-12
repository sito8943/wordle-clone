export type VersionUpdateDialogProps = {
  visible: boolean;
  onClose: () => void;
  onOpenCurrentChangelog: () => void;
  currentVersion: string;
  previousVersion: string | null;
  featuredChange: string | null;
  featuredImageSrc: string;
};
