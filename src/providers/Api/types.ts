import type { ChallengeClient } from "@api/challenges";
import type { DailyWordClient } from "@api/dailyWord";
import type { ScoreClient } from "@api/score";
import type { WordDictionaryClient } from "@api/words";

export type ApiContextType = {
  scoreClient: ScoreClient;
  wordDictionaryClient: WordDictionaryClient;
  dailyWordClient: DailyWordClient;
  challengeClient: ChallengeClient;
  convexEnabled: boolean;
};
