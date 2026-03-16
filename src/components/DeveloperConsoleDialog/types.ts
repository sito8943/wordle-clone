import type {
  Player,
  PlayerDifficulty,
  PlayerKeyboardPreference,
} from "../../providers/types";

export type DeveloperConsoleFormValues = {
  name: string;
  score: number;
  streak: number;
  difficulty: PlayerDifficulty;
  keyboardPreference: PlayerKeyboardPreference;
};

export type DeveloperConsoleDialogProps = {
  player: Player;
  onClose: () => void;
  onSubmit: (values: DeveloperConsoleFormValues) => void;
};
