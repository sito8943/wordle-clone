import type {
  PlayerDifficulty,
  PlayerKeyboardPreference,
} from "@domain/wordle";

export type DifficultySectionProps = {
  keyboardPreference: PlayerKeyboardPreference;
  onChangeKeyboardPreference: (
    nextPreference: PlayerKeyboardPreference,
  ) => void;
  difficulty: PlayerDifficulty;
  onChangeDifficulty: (nextDifficulty: PlayerDifficulty) => void;
};
