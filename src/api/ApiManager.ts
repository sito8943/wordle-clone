import { AdminManager } from "./admin";
import { ChallengesManager } from "./challenges";
import { HttpGateway } from "./http";
import { IdentityProvider } from "./identity";
import { PlayersManager } from "./players";
import { ScoresManager } from "./score";
import { WordsManager } from "./words";

type ApiManagerOptions = {
  baseUrl?: string;
  storage?: Storage;
};

class ApiManager {
  readonly scores: ScoresManager;
  readonly players: PlayersManager;
  readonly challenges: ChallengesManager;
  readonly words: WordsManager;
  readonly admin: AdminManager;
  readonly identity: IdentityProvider;
  private readonly gateway: HttpGateway;

  constructor(options: ApiManagerOptions = {}) {
    this.gateway = new HttpGateway({ baseUrl: options.baseUrl });
    this.identity = new IdentityProvider(options.storage);
    this.scores = new ScoresManager(this.gateway, this.identity);
    this.players = new PlayersManager(this.gateway, this.identity);
    this.challenges = new ChallengesManager(this.gateway, this.identity);
    this.words = new WordsManager(this.gateway);
    this.admin = new AdminManager(this.gateway);
  }

  get isConfigured(): boolean {
    return this.gateway.isConfigured;
  }
}

export { ApiManager };
export type { ApiManagerOptions };
