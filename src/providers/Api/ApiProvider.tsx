import { useMemo } from "react";
import { ChallengeClient } from "@api/challenges";
import { ConvexGateway } from "@api/convex/ConvexGateway";
import { DailyWordClient } from "@api/dailyWord";
import { ScoreClient } from "@api/score";
import { WordDictionaryClient } from "@api/words";
import { env } from "@config";
import { ApiContext } from "./ApiContext";
import type { ProviderProps } from "../types";

const ApiProvider = ({ children }: ProviderProps) => {
  const convexUrl = env.mode === "test" ? undefined : env.convexUrl;

  const gateway = useMemo(() => new ConvexGateway(convexUrl), [convexUrl]);
  const scoreClient = useMemo(() => new ScoreClient(gateway), [gateway]);
  const wordDictionaryClient = useMemo(
    () => new WordDictionaryClient(gateway),
    [gateway],
  );
  const dailyWordClient = useMemo(() => new DailyWordClient(), []);
  const challengeClient = useMemo(
    () => new ChallengeClient(gateway),
    [gateway],
  );

  const contextValue = useMemo(
    () => ({
      scoreClient,
      wordDictionaryClient,
      dailyWordClient,
      challengeClient,
      convexEnabled: gateway.isConfigured,
    }),
    [
      scoreClient,
      wordDictionaryClient,
      dailyWordClient,
      challengeClient,
      gateway,
    ],
  );

  return (
    <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>
  );
};

export { ApiProvider };
