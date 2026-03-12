import type { ScoreClient } from "../api/score/ScoreClient";

export type Player = {
  name: string;
  score: number;
};

export type PlayerContextType = {
  player: Player;
  updatePlayer: (name: string) => void;
  increaseScore: (points: number) => void;
};

export type ApiContextType = {
  scoreClient: ScoreClient;
  convexEnabled: boolean;
};
