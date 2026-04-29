import type {
  Player,
  PlayerDifficulty,
  PlayerKeyboardPreference,
  PlayerLanguage,
  RoundSyncWinProof,
  ScoreboardModeId,
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
  updatePlayerManualTileSelection: (enabled: boolean) => void;
  commitVictory: (
    points: number,
    wonAt?: number,
    roundStartedAt?: number,
    modeId?: ScoreboardModeId,
    roundSyncProof?: RoundSyncWinProof,
  ) => Promise<void>;
  commitLoss: (modeId?: ScoreboardModeId) => Promise<void>;
};
