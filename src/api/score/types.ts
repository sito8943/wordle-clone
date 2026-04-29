import type {
  PlayerDifficulty,
  PlayerKeyboardPreference,
  PlayerLanguage,
  PlayerTutorialPromptSeenModes,
  ScoreboardModeId,
  RoundSyncEvent,
} from "@domain/wordle";

export type ScoreSource = "convex" | "local";

export type ScoreEntry = {
  id: string;
  nick: string;
  language: PlayerLanguage;
  modeId: ScoreboardModeId;
  score: number;
  streak: number;
  hasWonDailyToday?: boolean;
  hasDailyShieldAvailableToday?: boolean;
  createdAt: number;
  source: ScoreSource;
  isCurrentClient: boolean;
};

export type RecordScoreInput = {
  nick: string;
  language?: PlayerLanguage;
  modeId?: ScoreboardModeId;
  score: number;
  streak?: number;
  createdAt?: number;
  overwriteExisting?: boolean;
};

export type UpsertPlayerProfileInput = {
  nick: string;
  language: PlayerLanguage;
  score?: number;
  streak?: number;
  difficulty: PlayerDifficulty;
  keyboardPreference: PlayerKeyboardPreference;
  tutorialPromptSeenModes?: PlayerTutorialPromptSeenModes;
};

export type TopScoresResult = {
  scores: ScoreEntry[];
  source: ScoreSource;
  currentClientRank: number | null;
  currentClientEntry: ScoreEntry | null;
};

export type SyncPendingScoresResult = {
  flushed: boolean;
};

export type StoredScore = {
  localId: string;
  clientId?: string;
  nick: string;
  language: PlayerLanguage;
  modeId: ScoreboardModeId;
  score: number;
  streak: number;
  createdAt: number;
  mutation?: string;
};

export type RemoteScore = {
  id: string;
  nick: string;
  language?: PlayerLanguage;
  modeId?: ScoreboardModeId;
  score: number;
  streak?: number;
  hasWonDailyToday?: boolean;
  hasDailyShieldAvailableToday?: boolean;
  createdAt: number;
  isCurrentClient?: boolean;
};

export type RemoteScoresResponse = {
  scores: RemoteScore[];
  currentClientRank?: number | null;
  currentClientEntry?: RemoteScore | null;
};

export type RemoteModeProgress = {
  score: number;
  streak: number;
  updatedAt: number;
};

export type RemoteProgressByMode = Partial<
  Record<ScoreboardModeId, RemoteModeProgress>
>;

export type RemotePlayerProfile = {
  id: string;
  clientId: string | null;
  clientRecordId: string;
  nick: string;
  playerCode: string;
  language: PlayerLanguage;
  score: number;
  streak: number;
  hasWonDailyToday?: boolean;
  hasDailyShieldAvailableToday?: boolean;
  difficulty: PlayerDifficulty;
  keyboardPreference: PlayerKeyboardPreference;
  createdAt: number;
  progressByMode?: RemoteProgressByMode;
  tutorialPromptSeenModes?: PlayerTutorialPromptSeenModes;
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

export type SyncRoundEventsInput = {
  nick: string;
  language: PlayerLanguage;
  difficulty: PlayerDifficulty;
  keyboardPreference: PlayerKeyboardPreference;
};

export type ConsumeDailyShieldInput = {
  nick: string;
  language: PlayerLanguage;
  difficulty: PlayerDifficulty;
  keyboardPreference: PlayerKeyboardPreference;
  playerCode?: string | null;
  happenedAt?: number;
};

export type StoredRoundSyncEvent = RoundSyncEvent;
