import type {
  RemoteChallengeProgress,
  RemoteDailyChallenges,
} from "@api/challenges";

export type DailyChallengesDialogProps = {
  visible: boolean;
  challenges: RemoteDailyChallenges;
  progress: RemoteChallengeProgress[];
  millisUntilEndOfDay: number;
  onClose: () => void;
};
