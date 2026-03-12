import type { ScoreEntry } from "../api/score";

export type { GuessResult } from "../domain/wordle";

export type ViewScoreEntry = ScoreEntry & { formattedDate: string };

export type ScoreboardRowEntry = ViewScoreEntry & {
  displayRank: number;
  realRank: number | null;
  isPinnedCurrentClient: boolean;
};
