import type { TileStatus } from "../../utils/checker";

export type GuessResult = {
  word: string;
  statuses: TileStatus[];
};

export type PersistedGameState = {
  sessionId: string;
  answer: string;
  guesses: GuessResult[];
  current: string;
  gameOver: boolean;
};

export type GuessValidationResult =
  | {
      ok: true;
      guess: GuessResult;
    }
  | {
      ok: false;
      message: string;
    };
