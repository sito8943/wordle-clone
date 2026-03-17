import type { ScoreEntry } from "@api/score";

export type ViewScoreEntry = ScoreEntry & { formattedDate: string };

export type ScoreboardRowEntry = ViewScoreEntry & {
  displayRank: number;
  realRank: number | null;
  isPinnedCurrentClient: boolean;
};
