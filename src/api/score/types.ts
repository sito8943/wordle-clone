import type {
  PlayerDifficulty,
  PlayerKeyboardPreference,
  VictorySyncEvent,
} from "@domain/wordle";

export type ScoreSource = "convex" | "local";

export type ScoreEntry = {
  id: string;
  nick: string;
  score: number;
  streak: number;
  createdAt: number;
  source: ScoreSource;
  isCurrentClient: boolean;
};

export type RecordScoreInput = {
  nick: string;
  score: number;
  streak?: number;
  createdAt?: number;
  overwriteExisting?: boolean;
};

export type UpsertPlayerProfileInput = {
  nick: string;
  score: number;
  streak?: number;
  difficulty: PlayerDifficulty;
  keyboardPreference: PlayerKeyboardPreference;
};

export type TopScoresResult = {
  scores: ScoreEntry[];
  source: ScoreSource;
  currentClientRank: number | null;
  currentClientEntry: ScoreEntry | null;
};

export type StoredScore = {
  localId: string;
  clientId?: string;
  nick: string;
  score: number;
  streak: number;
  createdAt: number;
  mutation?: string;
};

export type RemoteScore = {
  id: string;
  nick: string;
  score: number;
  streak?: number;
  createdAt: number;
  isCurrentClient?: boolean;
};

export type RemoteScoresResponse = {
  scores: RemoteScore[];
  currentClientRank?: number | null;
  currentClientEntry?: RemoteScore | null;
};

export type RemotePlayerProfile = {
  id: string;
  clientId: string | null;
  clientRecordId: string;
  nick: string;
  playerCode: string;
  score: number;
  streak: number;
  difficulty: PlayerDifficulty;
  keyboardPreference: PlayerKeyboardPreference;
  createdAt: number;
};

export type StoredScoreIdentity = {
  clientRecordId: string;
};

export type ScoreClientGatewayOverrides = {
  isConfigured?: boolean;
  query?: (...args: unknown[]) => Promise<unknown>;
  mutation?: (...args: unknown[]) => Promise<unknown>;
  isNetworkError?: (error: unknown) => boolean;
};

export type SyncVictoryEventsInput = {
  nick: string;
  difficulty: PlayerDifficulty;
  keyboardPreference: PlayerKeyboardPreference;
};

export type StoredVictorySyncEvent = VictorySyncEvent;
