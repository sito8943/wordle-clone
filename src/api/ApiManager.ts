import { HttpGateway } from "./http";
import { WordsManager } from "./words";

type ApiManagerOptions = {
  baseUrl?: string;
};

class ApiManager {
  readonly words: WordsManager;
  private readonly gateway: HttpGateway;

  constructor(options: ApiManagerOptions = {}) {
    this.gateway = new HttpGateway({ baseUrl: options.baseUrl });
    this.words = new WordsManager(this.gateway);
  }

  get isConfigured(): boolean {
    return this.gateway.isConfigured;
  }
}

export { ApiManager };
export type { ApiManagerOptions };
