export type DefeatDialogProps = {
  visible: boolean;
  answer: string;
  bestStreak: number;
  showSettingsHint?: boolean;
  showPlayAgainAction?: boolean;
  showChangeDifficultyAction?: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  onChangeDifficulty: () => void;
};
