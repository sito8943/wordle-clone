import type {
  Player,
  PlayerDifficulty,
  PlayerKeyboardPreference,
} from "@domain/wordle";

export type PlayerContextType = {
  player: Player;
  updatePlayer: (name: string) => Promise<void>;
  recoverPlayer: (code: string) => Promise<void>;
  replacePlayer: (nextPlayer: Partial<Player>) => void;
  updatePlayerDifficulty: (difficulty: PlayerDifficulty) => void;
  updatePlayerKeyboardPreference: (
    preference: PlayerKeyboardPreference,
  ) => void;
  commitVictory: (points: number, wonAt?: number) => Promise<void>;
  commitLoss: () => Promise<void>;
};
