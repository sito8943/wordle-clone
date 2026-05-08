import { useMemo } from "react";
import { ApiManager } from "@api";
import { ChallengeClient } from "@api/challenges";
import { DailyWordClient } from "@api/dailyWord";
import { ScoreClient } from "@api/score";
import { WordDictionaryClient } from "@api/words";
import { env } from "@config";
import { ApiContext } from "./ApiContext";
import type { ProviderProps } from "../types";

const ApiProvider = ({ children }: ProviderProps) => {
  const backendUrl = env.mode === "test" ? undefined : env.backendUrl;

  const apiManager = useMemo(
    () => new ApiManager({ baseUrl: backendUrl }),
    [backendUrl],
  );
  const scoreClient = useMemo(() => new ScoreClient(), []);
  const wordDictionaryClient = useMemo(
    () => new WordDictionaryClient(apiManager),
    [apiManager],
  );
  const dailyWordClient = useMemo(() => new DailyWordClient(), []);
  const challengeClient = useMemo(
    () => new ChallengeClient(apiManager),
    [apiManager],
  );

  const contextValue = useMemo(
    () => ({
      apiManager,
      scoreClient,
      wordDictionaryClient,
      dailyWordClient,
      challengeClient,
      convexEnabled: apiManager.isConfigured,
    }),
    [
      apiManager,
      scoreClient,
      wordDictionaryClient,
      dailyWordClient,
      challengeClient,
    ],
  );

  return (
    <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>
  );
};

export { ApiProvider };
