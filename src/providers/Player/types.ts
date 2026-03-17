import type {
  Player,
  PlayerDifficulty,
  PlayerKeyboardPreference,
} from "@domain/wordle";

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
