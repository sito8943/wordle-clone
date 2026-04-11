import { ConvexGateway } from "../convex/ConvexGateway";
import {
  COMPLETE_CHALLENGE_MUTATION,
  GENERATE_DAILY_CHALLENGES_MUTATION,
  GET_PLAYER_CHALLENGE_PROGRESS_QUERY,
  GET_TODAY_CHALLENGES_QUERY,
  REGENERATE_DAILY_CHALLENGES_MUTATION,
  RESET_PLAYER_CHALLENGE_PROGRESS_MUTATION,
  SEED_CHALLENGES_MUTATION,
} from "./constants";
import type {
  CompleteChallengeResult,
  RemoteChallengeProgress,
  RemoteDailyChallenges,
  ResetPlayerChallengeProgressResult,
} from "./types";

const CLIENT_ID_KEY = "wordle:scoreboard:client-id";

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

  async generateDailyChallenges(date: string): Promise<RemoteDailyChallenges> {
    return this.gateway.mutation<RemoteDailyChallenges>(
      GENERATE_DAILY_CHALLENGES_MUTATION,
      { date },
    );
  }

  async regenerateDailyChallenges(
    date: string,
  ): Promise<RemoteDailyChallenges> {
    return this.gateway.mutation<RemoteDailyChallenges>(
      REGENERATE_DAILY_CHALLENGES_MUTATION,
      { date },
    );
  }

  async getPlayerChallengeProgress(
    date: string,
  ): Promise<RemoteChallengeProgress[]> {
    const clientId = this.getClientId();
    if (!clientId) return [];

    return this.gateway.query<RemoteChallengeProgress[]>(
      GET_PLAYER_CHALLENGE_PROGRESS_QUERY,
      { clientId, date },
    );
  }

  async completeChallenge(
    challengeId: string,
    date: string,
  ): Promise<CompleteChallengeResult> {
    const clientId = this.getClientId();
    if (!clientId) {
      return { pointsAwarded: 0, alreadyCompleted: false };
    }

    return this.gateway.mutation<CompleteChallengeResult>(
      COMPLETE_CHALLENGE_MUTATION,
      { clientId, challengeId, date },
    );
  }

  async seedChallenges(): Promise<{
    inserted: number;
    total: number;
    alreadySeeded: boolean;
  }> {
    return this.gateway.mutation(SEED_CHALLENGES_MUTATION, {});
  }

  async resetPlayerChallengeProgressForDate(
    date: string,
  ): Promise<ResetPlayerChallengeProgressResult> {
    const clientId = this.getClientId();
    if (!clientId) {
      return { resetCount: 0, pointsReverted: 0 };
    }

    return this.gateway.mutation<ResetPlayerChallengeProgressResult>(
      RESET_PLAYER_CHALLENGE_PROGRESS_MUTATION,
      { clientId, date },
    );
  }

  private getClientId(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(CLIENT_ID_KEY);
    } catch {
      return null;
    }
  }
}

export { ChallengeClient };
