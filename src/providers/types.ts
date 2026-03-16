import type { ReactNode } from "react";
import type { ScoreClient } from "../api/score";
import type { WordDictionaryClient } from "../api/words";

export type Player = {
  name: string;
  score: number;
  streak: number;
  difficulty: PlayerDifficulty;
  keyboardPreference: PlayerKeyboardPreference;
};

export type PlayerDifficulty = "easy" | "normal" | "hard" | "insane";
export type PlayerKeyboardPreference = "onscreen" | "native";

export type PlayerContextType = {
  player: Player;
  updatePlayer: (name: string) => void;
  replacePlayer: (nextPlayer: Partial<Player>) => void;
  updatePlayerDifficulty: (difficulty: PlayerDifficulty) => void;
  updatePlayerKeyboardPreference: (
    preference: PlayerKeyboardPreference,
  ) => void;
  increaseScore: (points: number) => void;
  increaseWinStreak: () => void;
  resetWinStreak: () => void;
};

export type ApiContextType = {
  scoreClient: ScoreClient;
  wordDictionaryClient: WordDictionaryClient;
  convexEnabled: boolean;
};

export type ProviderProps = {
  children: ReactNode;
};
