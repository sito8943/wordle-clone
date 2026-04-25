export type DailyMeaningDialogProps = {
  visible: boolean;
  meaning: string | null;
  loading: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onRetry: () => void;
};
