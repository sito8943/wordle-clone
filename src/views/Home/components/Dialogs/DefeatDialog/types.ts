export type DefeatDialogProps = {
  visible: boolean;
  answer: string;
  bestStreak: number;
  showSettingsHint?: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  onChangeDifficulty: () => void;
};
