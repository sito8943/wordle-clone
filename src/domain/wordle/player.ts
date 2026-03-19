export type Player = {
  name: string;
  code: string;
  score: number;
  streak: number;
  difficulty: PlayerDifficulty;
  keyboardPreference: PlayerKeyboardPreference;
  showEndOfGameDialogs: boolean;
};

export type PlayerDifficulty = "easy" | "normal" | "hard" | "insane";
export type PlayerKeyboardPreference = "onscreen" | "native";
