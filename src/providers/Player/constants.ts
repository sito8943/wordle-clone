import type {
  Player,
  PlayerDifficulty,
  PlayerKeyboardPreference,
} from "@domain/wordle";

export const DEFAULT_PLAYER_DIFFICULTY: PlayerDifficulty = "normal";
export const DEFAULT_PLAYER_KEYBOARD_PREFERENCE: PlayerKeyboardPreference =
  "onscreen";

export const DEFAULT_PLAYER: Player = {
  name: "Player",
  score: 0,
  streak: 0,
  difficulty: DEFAULT_PLAYER_DIFFICULTY,
  keyboardPreference: DEFAULT_PLAYER_KEYBOARD_PREFERENCE,
};
