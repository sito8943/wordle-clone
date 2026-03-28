import type { TileStatus } from "@utils/types";

export type GuessResult = {
  word: string;
  statuses: TileStatus[];
};

export type GuessComboTone = Extract<TileStatus, "correct" | "present">;

export type GuessCombo = {
  count: number;
  tone: GuessComboTone;
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

export type RoundSyncEvent =
  | {
      id: string;
      kind: "win";
      pointsDelta: number;
      happenedAt: number;
      version: 2;
    }
  | {
      id: string;
      kind: "loss";
      happenedAt: number;
      version: 2;
    };
