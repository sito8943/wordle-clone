import type { TileStatus } from "@utils/types";
import type { PlayerDifficulty } from "./player";

export type BoardRoundConfig = {
  lettersPerRow: number;
  maxGuesses: number;
};

export type WordleModeId = "classic" | "lightning" | "zen" | "daily";
export type ScoreboardModeId = Extract<
  WordleModeId,
  "classic" | "lightning" | "zen" | "daily"
>;

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
  startedAt: number;
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
      modeId: ScoreboardModeId;
      happenedAt: number;
      version: 2;
    }
  | {
      id: string;
      kind: "win";
      pointsDelta: number;
      modeId: ScoreboardModeId;
      happenedAt: number;
      version: 3;
      proof: RoundSyncWinProof;
    }
  | {
      id: string;
      kind: "loss";
      modeId: ScoreboardModeId;
      happenedAt: number;
      version: 2;
    };

export type RoundSyncWinProof = {
  roundStartedAt: number;
  guessesUsed: number;
  difficulty: PlayerDifficulty;
  hardModeEnabled: boolean;
  hardModeSecondsLeft: number;
  guessWords: string[];
};

export type ResolveDailyAnswerInput = {
  words: string[];
  date?: string | null;
  remoteDailyWord?: string | null;
};

export type DailyModeOutcome = "won" | "lost";

export type StoredDailyModeStatus = {
  date: string;
  outcome: DailyModeOutcome;
};

export type StoredDailyShieldUsage = {
  date: string;
  used: boolean;
};
