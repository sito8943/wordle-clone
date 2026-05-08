import type { HttpGateway } from "@api/http";
import type { IdentityProvider } from "@api/identity";
import type {
  CompleteChallengeResult,
  RemoteChallenge,
  RemoteChallengeProgress,
  RemoteChallenges,
  ResetPlayerChallengeProgressResult,
} from "./types";

type SeedChallengesResult = {
  inserted: number;
  total: number;
  alreadySeeded: boolean;
};

class ChallengesManager {
  private static readonly BASE_PATH = "/api/v2/challenges";

  private readonly gateway: HttpGateway;
  private readonly identity: IdentityProvider;

  constructor(gateway: HttpGateway, identity: IdentityProvider) {
    this.gateway = gateway;
    this.identity = identity;
  }

  list(): Promise<RemoteChallenge[]> {
    return this.gateway.get<RemoteChallenge[]>(ChallengesManager.BASE_PATH);
  }

  getToday(date: string): Promise<RemoteChallenges | null> {
    return this.gateway.get<RemoteChallenges | null>(
      `${ChallengesManager.BASE_PATH}/today`,
      { date },
    );
  }

  getProgress(date: string): Promise<RemoteChallengeProgress[]> {
    const { clientId } = this.identity.getIdentity();
    return this.gateway.get<RemoteChallengeProgress[]>(
      `${ChallengesManager.BASE_PATH}/progress`,
      { clientId, date },
    );
  }

  resetProgress(date: string): Promise<ResetPlayerChallengeProgressResult> {
    const { clientId } = this.identity.getIdentity();
    return this.gateway.delete<ResetPlayerChallengeProgressResult>(
      `${ChallengesManager.BASE_PATH}/progress`,
      { clientId, date },
    );
  }

  generateDaily(date: string): Promise<RemoteChallenges> {
    return this.gateway.post<RemoteChallenges>(
      `${ChallengesManager.BASE_PATH}/daily`,
      { date },
    );
  }

  regenerateDaily(date: string): Promise<RemoteChallenges> {
    return this.gateway.put<RemoteChallenges>(
      `${ChallengesManager.BASE_PATH}/daily`,
      { date },
    );
  }

  complete(
    challengeId: string,
    date: string,
  ): Promise<CompleteChallengeResult> {
    const { clientId } = this.identity.getIdentity();
    return this.gateway.post<CompleteChallengeResult>(
      `${ChallengesManager.BASE_PATH}/completions`,
      { clientId, challengeId, date },
    );
  }

  seed(): Promise<SeedChallengesResult> {
    return this.gateway.post<SeedChallengesResult>(
      `${ChallengesManager.BASE_PATH}/seed`,
      {},
    );
  }
}

export { ChallengesManager };
export type { SeedChallengesResult };
