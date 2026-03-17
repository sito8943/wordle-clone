import type { ScoreEntry } from "@api/score";

export type { GuessResult } from "@domain/wordle";

export type ViewScoreEntry = ScoreEntry & { formattedDate: string };

export type ScoreboardRowEntry = ViewScoreEntry & {
  displayRank: number;
  realRank: number | null;
  isPinnedCurrentClient: boolean;
};

export type DialogCloseAction = () => void;

export type UseDialogCloseTransitionResult = {
  isClosing: boolean;
  closeWithAction: (action: DialogCloseAction) => void;
};
