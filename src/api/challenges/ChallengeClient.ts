import type { ApiManager } from "@api";
import type {
  CompleteChallengeResult,
  RemoteChallengeProgress,
  RemoteChallenges,
  RemoteChallenge,
  ResetPlayerChallengeProgressResult,
} from "./types";

class ChallengeClient {
  private readonly apiManager: ApiManager;

  constructor(apiManager: ApiManager) {
    this.apiManager = apiManager;
  }

  get isConfigured(): boolean {
    return this.apiManager.isConfigured;
  }

  getTodayChallenges(date: string): Promise<RemoteChallenges | null> {
    return this.apiManager.challenges.getToday(date);
  }

  listAllChallenges(): Promise<RemoteChallenge[]> {
    return this.apiManager.challenges.list();
  }

  generateDailyChallenges(date: string): Promise<RemoteChallenges> {
    return this.apiManager.challenges.generateDaily(date);
  }

  regenerateDailyChallenges(date: string): Promise<RemoteChallenges> {
    return this.apiManager.challenges.regenerateDaily(date);
  }

  getPlayerChallengeProgress(
    date: string,
  ): Promise<RemoteChallengeProgress[]> {
    return this.apiManager.challenges.getProgress(date);
  }

  completeChallenge(
    challengeId: string,
    date: string,
  ): Promise<CompleteChallengeResult> {
    return this.apiManager.challenges.complete(challengeId, date);
  }

  seedChallenges(): Promise<{
    inserted: number;
    total: number;
    alreadySeeded: boolean;
  }> {
    return this.apiManager.challenges.seed();
  }

  resetPlayerChallengeProgressForDate(
    date: string,
  ): Promise<ResetPlayerChallengeProgressResult> {
    return this.apiManager.challenges.resetProgress(date);
  }
}

export { ChallengeClient };
