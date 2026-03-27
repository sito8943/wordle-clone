import type { EndOfGameScoreSummary } from "@views/Play/hooks/usePlayController/types";

export type VictoryDialogProps = {
  visible: boolean;
  answer: string;
  currentStreak: number;
  scoreSummary: EndOfGameScoreSummary;
  showSettingsHint?: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
};
