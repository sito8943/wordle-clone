import type { ScoreClient } from "@api/score";
import type { WordDictionaryClient } from "@api/words";

export type ApiContextType = {
  scoreClient: ScoreClient;
  wordDictionaryClient: WordDictionaryClient;
  convexEnabled: boolean;
};
