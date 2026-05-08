import type { HttpGateway } from "@api/http";
import type { DictionaryLanguage } from "./types";
import { normalizeDictionaryLanguage, normalizeWords } from "./utils";

type RemoteChecksum = { checksum: number; updatedAt: number };

type SeedWordsInput = {
  language: DictionaryLanguage;
  words?: string[];
};

class WordsManager {
  private static readonly BASE_PATH = "/api/v2/words";

  private readonly gateway: HttpGateway;

  constructor(gateway: HttpGateway) {
    this.gateway = gateway;
  }

  async list(language: DictionaryLanguage): Promise<string[]> {
    const normalized = normalizeDictionaryLanguage(language);
    const payload = await this.gateway.get<unknown>(WordsManager.BASE_PATH, {
      language: normalized,
    });
    return normalizeWords(payload);
  }

  async getChecksum(
    language: DictionaryLanguage,
  ): Promise<RemoteChecksum | null> {
    const normalized = normalizeDictionaryLanguage(language);
    return this.gateway.get<RemoteChecksum | null>(
      `${WordsManager.BASE_PATH}/checksum`,
      { language: normalized },
    );
  }

  async seed(input: SeedWordsInput): Promise<void> {
    await this.gateway.post(`${WordsManager.BASE_PATH}/seed`, {
      language: normalizeDictionaryLanguage(input.language),
      words: input.words,
    });
  }

  async ensureSeeded(language: DictionaryLanguage): Promise<void> {
    await this.gateway.post(`${WordsManager.BASE_PATH}/ensure-seeded`, {
      language: normalizeDictionaryLanguage(language),
    });
  }

  async refreshChecksum(language: DictionaryLanguage): Promise<RemoteChecksum> {
    return this.gateway.post<RemoteChecksum>(
      `${WordsManager.BASE_PATH}/checksum/refresh`,
      { language: normalizeDictionaryLanguage(language) },
    );
  }
}

export { WordsManager };
export type { RemoteChecksum, SeedWordsInput };
