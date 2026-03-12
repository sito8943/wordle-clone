export type ScoreSource = "convex" | "local";

export type ScoreEntry = {
  id: string;
  nick: string;
  score: number;
  createdAt: number;
  source: ScoreSource;
};

export type RecordScoreInput = {
  nick: string;
  score: number;
  createdAt?: number;
};

export type TopScoresResult = {
  scores: ScoreEntry[];
  source: ScoreSource;
};
