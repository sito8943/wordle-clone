export type DefeatDialogProps = {
  visible: boolean;
  answer: string;
  bestStreak: number;
  onClose: () => void;
  onPlayAgain: () => void;
  onChangeDifficulty: () => void;
};
