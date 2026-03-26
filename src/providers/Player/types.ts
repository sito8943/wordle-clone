import type {
  Player,
  PlayerDifficulty,
  PlayerKeyboardPreference,
  PlayerLanguage,
} from "@domain/wordle";

export type PlayerContextType = {
  player: Player;
  updatePlayer: (name: string) => Promise<void>;
  recoverPlayer: (code: string) => Promise<void>;
  refreshCurrentPlayerProfile: () => Promise<void>;
  replacePlayer: (nextPlayer: Partial<Player>) => void;
  updatePlayerDifficulty: (difficulty: PlayerDifficulty) => void;
  updatePlayerKeyboardPreference: (
    preference: PlayerKeyboardPreference,
  ) => void;
  updatePlayerLanguage: (language: PlayerLanguage) => void;
  updatePlayerShowEndOfGameDialogs: (showDialogs: boolean) => void;
  commitVictory: (points: number, wonAt?: number) => Promise<void>;
  commitLoss: () => Promise<void>;
};
