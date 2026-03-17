import type {
  PlayerDifficulty,
  PlayerKeyboardPreference,
} from "@domain/wordle";
import type { ThemePreference } from "@hooks/useThemePreference";

export type SettingsSectionProps = {
  startAnimationsEnabled: boolean;
  onToggleStartAnimations: () => void;
  themePreference: ThemePreference;
  onChangeThemePreference: (nextPreference: ThemePreference) => void;
  keyboardPreference: PlayerKeyboardPreference;
  onChangeKeyboardPreference: (
    nextPreference: PlayerKeyboardPreference,
  ) => void;
  difficulty: PlayerDifficulty;
  onChangeDifficulty: (nextDifficulty: PlayerDifficulty) => void;
};
