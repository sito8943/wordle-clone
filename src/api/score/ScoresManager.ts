import type { HttpGateway } from "@api/http";
import type { IdentityProvider } from "@api/identity";
import type {
  PlayerDifficulty,
  PlayerKeyboardPreference,
  PlayerLanguage,
  RoundSyncEvent,
  ScoreboardModeId,
} from "@domain/wordle";
import type { RemotePlayerProfile, RemoteScoresResponse } from "./types";

type GetTopScoresParams = {
  limit?: number;
  language?: PlayerLanguage;
  modeId?: ScoreboardModeId;
};

type RecordScoreInput = {
  nick: string;
  language: PlayerLanguage;
  modeId: ScoreboardModeId;
  score: number;
  streak?: number;
  createdAt?: number;
};

type UpdateScoreInput = RecordScoreInput;

type SyncRoundEventsBody = {
  nick: string;
  language: PlayerLanguage;
  difficulty: PlayerDifficulty;
  keyboardPreference: PlayerKeyboardPreference;
  events: RoundSyncEvent[];
};

type ConsumeDailyShieldBody = {
  nick: string;
  language: PlayerLanguage;
  difficulty: PlayerDifficulty;
  keyboardPreference: PlayerKeyboardPreference;
  playerCode?: string | null;
  happenedAt?: number;
};

type RecordScoreResult = { ok: true; id: string };

class ScoresManager {
  private static readonly BASE_PATH = "/api/v2/scores";

  private readonly gateway: HttpGateway;
  private readonly identity: IdentityProvider;

  constructor(gateway: HttpGateway, identity: IdentityProvider) {
    this.gateway = gateway;
    this.identity = identity;
  }

  getTop(params: GetTopScoresParams = {}): Promise<RemoteScoresResponse> {
    const { clientId, clientRecordId } = this.identity.getIdentity();
    return this.gateway.get<RemoteScoresResponse>(
      `${ScoresManager.BASE_PATH}/top`,
      {
        clientId,
        clientRecordId,
        limit: params.limit,
        language: params.language,
        modeId: params.modeId,
      },
    );
  }

  record(input: RecordScoreInput): Promise<RecordScoreResult> {
    const { clientId, clientRecordId } = this.identity.getIdentity();
    return this.gateway.post<RecordScoreResult>(ScoresManager.BASE_PATH, {
      clientId,
      clientRecordId,
      ...input,
    });
  }

  update(input: UpdateScoreInput): Promise<RecordScoreResult> {
    const { clientId, clientRecordId } = this.identity.getIdentity();
    return this.gateway.patch<RecordScoreResult>(ScoresManager.BASE_PATH, {
      clientId,
      clientRecordId,
      ...input,
    });
  }

  syncRoundEvents(
    input: SyncRoundEventsBody,
  ): Promise<RemotePlayerProfile | null> {
    const { clientId, clientRecordId } = this.identity.getIdentity();
    return this.gateway.post<RemotePlayerProfile | null>(
      `${ScoresManager.BASE_PATH}/round-events`,
      { clientId, clientRecordId, ...input },
    );
  }

  consumeDailyShield(
    input: ConsumeDailyShieldBody,
  ): Promise<RemotePlayerProfile | null> {
    const { clientId, clientRecordId } = this.identity.getIdentity();
    return this.gateway.post<RemotePlayerProfile | null>(
      `${ScoresManager.BASE_PATH}/shield-consumptions`,
      { clientId, clientRecordId, ...input },
    );
  }
}

export { ScoresManager };
export type {
  GetTopScoresParams,
  RecordScoreInput,
  UpdateScoreInput,
  SyncRoundEventsBody,
  ConsumeDailyShieldBody,
  RecordScoreResult,
};
