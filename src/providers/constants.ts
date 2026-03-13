import type { Player, PlayerDifficulty } from "./types";

export const DEFAULT_PLAYER_DIFFICULTY: PlayerDifficulty = "normal";

export const DEFAULT_PLAYER: Player = {
  name: "Player",
  score: 0,
  streak: 0,
  difficulty: DEFAULT_PLAYER_DIFFICULTY,
};
