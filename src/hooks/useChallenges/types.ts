import type {
  RemoteChallenges,
  RemoteChallengeProgress,
} from "@api/challenges";

export type UseChallengesResult = {
  challenges: RemoteChallenges | null;
  progress: RemoteChallengeProgress[];
  weeklyProgress: RemoteChallengeProgress[];
  loading: boolean;
  showDialog: boolean;
  millisUntilEndOfDay: number;
  millisUntilEndOfWeek: number;
  openDialog: () => void;
  closeDialog: () => void;
  refreshProgress: () => Promise<void>;
};
