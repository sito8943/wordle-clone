import type {
  Player,
  PlayerDifficulty,
  PlayerKeyboardPreference,
  PlayerLanguage,
} from "@domain/wordle";

export const DEFAULT_PLAYER_DIFFICULTY: PlayerDifficulty = "normal";
export const DEFAULT_PLAYER_KEYBOARD_PREFERENCE: PlayerKeyboardPreference =
  "onscreen";
export const DEFAULT_PLAYER_LANGUAGE: PlayerLanguage = "en";

export const DEFAULT_PLAYER: Player = {
  name: "Player",
  code: "",
  score: 0,
  streak: 0,
  language: DEFAULT_PLAYER_LANGUAGE,
  difficulty: DEFAULT_PLAYER_DIFFICULTY,
  keyboardPreference: DEFAULT_PLAYER_KEYBOARD_PREFERENCE,
  showEndOfGameDialogs: true,
  manualTileSelection: false,
  hackingBan: null,
};
