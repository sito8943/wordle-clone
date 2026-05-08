import { ApiNotFoundError, type HttpGateway } from "@api/http";
import type { IdentityProvider } from "@api/identity";
import type {
  GetMeParams,
  NickAvailabilityResult,
  RegisterPlayerInput,
  RemotePlayerProfile,
  RenameNickInput,
  TutorialModeId,
  UpdatePreferencesInput,
} from "./types";

class PlayersManager {
  private static readonly BASE_PATH = "/api/v2/players";

  private readonly gateway: HttpGateway;
  private readonly identity: IdentityProvider;

  constructor(gateway: HttpGateway, identity: IdentityProvider) {
    this.gateway = gateway;
    this.identity = identity;
  }

  async register(input: RegisterPlayerInput): Promise<RemotePlayerProfile> {
    const { clientId, clientRecordId } = this.identity.getIdentity();
    const profile = await this.gateway.post<RemotePlayerProfile>(
      PlayersManager.BASE_PATH,
      { clientId, clientRecordId, ...input },
    );
    this.identity.setClientRecordId(profile.clientRecordId);
    return profile;
  }

  getMe(params: GetMeParams = {}): Promise<RemotePlayerProfile | null> {
    const { clientId, clientRecordId } = this.identity.getIdentity();
    return this.gateway.get<RemotePlayerProfile | null>(
      `${PlayersManager.BASE_PATH}/me`,
      { clientId, clientRecordId, language: params.language },
    );
  }

  async renameNick(input: RenameNickInput): Promise<RemotePlayerProfile> {
    const { clientId, clientRecordId } = this.identity.requireIdentity();
    return this.gateway.patch<RemotePlayerProfile>(
      `${PlayersManager.BASE_PATH}/me/nick`,
      { clientId, clientRecordId, ...input },
    );
  }

  updatePreferences(
    input: UpdatePreferencesInput,
  ): Promise<RemotePlayerProfile> {
    const { clientId, clientRecordId } = this.identity.requireIdentity();
    return this.gateway.patch<RemotePlayerProfile>(
      `${PlayersManager.BASE_PATH}/me/preferences`,
      { clientId, clientRecordId, ...input },
    );
  }

  markTutorialSeen(modeId: TutorialModeId): Promise<RemotePlayerProfile> {
    const { clientId, clientRecordId } = this.identity.requireIdentity();
    return this.gateway.put<RemotePlayerProfile>(
      `${PlayersManager.BASE_PATH}/me/tutorial-prompts/${modeId}`,
      { clientId, clientRecordId },
    );
  }

  resetTutorialPrompts(): Promise<RemotePlayerProfile> {
    const { clientId, clientRecordId } = this.identity.requireIdentity();
    return this.gateway.delete<RemotePlayerProfile>(
      `${PlayersManager.BASE_PATH}/me/tutorial-prompts`,
      { clientId, clientRecordId },
    );
  }

  getNickAvailability(nick: string): Promise<NickAvailabilityResult> {
    const { clientId, clientRecordId } = this.identity.getIdentity();
    return this.gateway.get<NickAvailabilityResult>(
      `${PlayersManager.BASE_PATH}/nick-availability`,
      { nick, clientId, clientRecordId },
    );
  }

  async getByCode(code: string): Promise<RemotePlayerProfile | null> {
    try {
      return await this.gateway.get<RemotePlayerProfile>(
        `${PlayersManager.BASE_PATH}/${encodeURIComponent(code)}`,
      );
    } catch (error) {
      if (error instanceof ApiNotFoundError) return null;
      throw error;
    }
  }

  backfillCodes(): Promise<{ updated: number }> {
    return this.gateway.post<{ updated: number }>(
      `${PlayersManager.BASE_PATH}/backfill-codes`,
      {},
    );
  }
}

export { PlayersManager };
