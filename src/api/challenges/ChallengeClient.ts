import { ConvexGateway } from "../convex/ConvexGateway";
import {
  COMPLETE_CHALLENGE_MUTATION,
  GENERATE_DAILY_CHALLENGES_MUTATION,
  GET_PLAYER_CHALLENGE_PROGRESS_QUERY,
  GET_TODAY_CHALLENGES_QUERY,
  SEED_CHALLENGES_MUTATION,
} from "./constants";
import type {
  CompleteChallengeResult,
  RemoteChallengeProgress,
  RemoteDailyChallenges,
} from "./types";

class ChallengeClient {
  private readonly gateway: ConvexGateway;

  constructor(gateway: ConvexGateway) {
    this.gateway = gateway;
  }

  get isConfigured(): boolean {
    return this.gateway.isConfigured;
  }

  async getTodayChallenges(
    date: string,
  ): Promise<RemoteDailyChallenges | null> {
    return this.gateway.query<RemoteDailyChallenges | null>(
      GET_TODAY_CHALLENGES_QUERY,
      { date },
    );
  }

  async generateDailyChallenges(
    date: string,
  ): Promise<RemoteDailyChallenges> {
    return this.gateway.mutation<RemoteDailyChallenges>(
      GENERATE_DAILY_CHALLENGES_MUTATION,
      { date },
    );
  }

  async getPlayerChallengeProgress(
    profileId: string,
    date: string,
  ): Promise<RemoteChallengeProgress[]> {
    return this.gateway.query<RemoteChallengeProgress[]>(
      GET_PLAYER_CHALLENGE_PROGRESS_QUERY,
      { profileId, date },
    );
  }

  async completeChallenge(
    profileId: string,
    challengeId: string,
    date: string,
  ): Promise<CompleteChallengeResult> {
    return this.gateway.mutation<CompleteChallengeResult>(
      COMPLETE_CHALLENGE_MUTATION,
      { profileId, challengeId, date },
    );
  }

  async seedChallenges(): Promise<{
    inserted: number;
    total: number;
    alreadySeeded: boolean;
  }> {
    return this.gateway.mutation(SEED_CHALLENGES_MUTATION, {});
  }
}

export { ChallengeClient };
