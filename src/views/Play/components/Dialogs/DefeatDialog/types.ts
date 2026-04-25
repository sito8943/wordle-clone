export type DefeatDialogProps = {
  visible: boolean;
  answer: string;
  bestStreak: number;
  showShieldActions?: boolean;
  showSettingsHint?: boolean;
  showPlayAgainAction?: boolean;
  showChangeDifficultyAction?: boolean;
  onClose: () => void;
  onUseShield?: () => void;
  onSkipShield?: () => void;
  onPlayAgain: () => void;
  onChangeDifficulty: () => void;
};
