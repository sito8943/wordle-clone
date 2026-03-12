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

export type ScoreClientGatewayOverrides = {
  isConfigured?: boolean;
  query?: (...args: unknown[]) => Promise<unknown>;
  mutation?: (...args: unknown[]) => Promise<unknown>;
  isNetworkError?: (error: unknown) => boolean;
};
