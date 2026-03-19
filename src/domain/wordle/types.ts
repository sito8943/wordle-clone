import type { TileStatus } from "@utils/types";

export type GuessResult = {
  word: string;
  statuses: TileStatus[];
};

export type PersistedGameRef = {
  sessionId: string;
  gameId: string;
  seed: number;
  guesses: GuessResult[];
  current: string;
  gameOver: boolean;
};

export type PersistedGameState = PersistedGameRef & {
  answer: string;
};

export type GameReference = Pick<PersistedGameRef, "gameId" | "seed">;

export type GuessValidationResult =
  | {
      ok: true;
      guess: GuessResult;
    }
  | {
      ok: false;
      message: string;
    };

export type VictorySyncEvent = {
  id: string;
  playerId: string;
  score: number;
  streak: number;
  wonAt: number;
  version: 1;
};
