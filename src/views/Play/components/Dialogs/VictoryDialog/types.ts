import type { EndOfGameScoreSummary } from "@views/Play/hooks/usePlayController/types";

export type VictoryDialogProps = {
  visible: boolean;
  answer: string;
  currentStreak: number;
  scoreSummary: EndOfGameScoreSummary;
  challengeBonusPoints?: number;
  showSettingsHint?: boolean;
  shareEnabled?: boolean;
  isSharing?: boolean;
  shareErrorMessage?: string | null;
  onClose: () => void;
  onPlayAgain: () => void;
  onShare?: () => void;
};
