import type { ChallengeClient } from "@api/challenges";
import type { ScoreClient } from "@api/score";
import type { WordDictionaryClient } from "@api/words";

export type ApiContextType = {
  scoreClient: ScoreClient;
  wordDictionaryClient: WordDictionaryClient;
  challengeClient: ChallengeClient;
  convexEnabled: boolean;
};
