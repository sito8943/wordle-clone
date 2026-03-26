export type Player = {
  name: string;
  code: string;
  score: number;
  streak: number;
  language: PlayerLanguage;
  difficulty: PlayerDifficulty;
  keyboardPreference: PlayerKeyboardPreference;
  showEndOfGameDialogs: boolean;
};

export type PlayerDifficulty = "easy" | "normal" | "hard" | "insane";
export type PlayerKeyboardPreference = "onscreen" | "native";
export type PlayerLanguage = "en" | "es";
