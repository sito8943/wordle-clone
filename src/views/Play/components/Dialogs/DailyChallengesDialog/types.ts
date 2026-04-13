import type {
  RemoteChallengeProgress,
  RemoteChallenges,
} from "@api/challenges";

export type ChallengesDialogProps = {
  visible: boolean;
  challenges: RemoteChallenges;
  progress: RemoteChallengeProgress[];
  millisUntilEndOfDay: number;
  onClose: () => void;
};
