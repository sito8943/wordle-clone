import type { ChallengeConditionKey, ChallengeType } from "@domain/challenges";

export type RemoteChallenge = {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  conditionKey: ChallengeConditionKey;
};

export type RemoteChallenges = {
  date: string;
  simple: RemoteChallenge;
  complex: RemoteChallenge;
};

export type RemoteChallengeProgress = {
  _id: string;
  profileId: string;
  challengeId: string;
  date: string;
  completed: boolean;
  completedAt?: number;
  pointsAwarded: number;
};

export type CompleteChallengeResult = {
  pointsAwarded: number;
  alreadyCompleted: boolean;
};

export type ResetPlayerChallengeProgressResult = {
  resetCount: number;
  pointsReverted: number;
};
