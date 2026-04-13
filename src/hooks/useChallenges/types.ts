import type {
  RemoteChallenges,
  RemoteChallengeProgress,
} from "@api/challenges";

export type UseChallengesResult = {
  challenges: RemoteChallenges | null;
  progress: RemoteChallengeProgress[];
  loading: boolean;
  showDialog: boolean;
  millisUntilEndOfDay: number;
  openDialog: () => void;
  closeDialog: () => void;
  refreshProgress: () => Promise<void>;
};
