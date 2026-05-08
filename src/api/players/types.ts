import type {
  PlayerDifficulty,
  PlayerKeyboardPreference,
  PlayerLanguage,
} from "@domain/wordle";
import type { RemotePlayerProfile } from "@api/score";

export type RegisterPlayerInput = {
  nick: string;
  language: PlayerLanguage;
  difficulty: PlayerDifficulty;
  keyboardPreference: PlayerKeyboardPreference;
};

export type RenameNickInput = {
  nick: string;
  language: PlayerLanguage;
};

export type UpdatePreferencesInput = {
  language?: PlayerLanguage;
  difficulty?: PlayerDifficulty;
  keyboardPreference?: PlayerKeyboardPreference;
};

export type GetMeParams = {
  language?: PlayerLanguage;
};

export type NickAvailabilityResult = { available: boolean };

export type TutorialModeId = "classic" | "lightning" | "zen" | "daily";

export type { RemotePlayerProfile };
