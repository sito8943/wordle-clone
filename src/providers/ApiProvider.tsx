/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from "react";
import { ConvexGateway } from "../api/convex/ConvexGateway";
import { ScoreClient } from "../api/score";
import { WordDictionaryClient } from "../api/words";
import { env } from "../config";
import type { ApiContextType, ProviderProps } from "./types";

const ApiContext = createContext<ApiContextType | undefined>(undefined);

const ApiProvider = ({ children }: ProviderProps) => {
  const convexUrl = env.mode === "test" ? undefined : env.convexUrl;

  const gateway = useMemo(() => new ConvexGateway(convexUrl), [convexUrl]);
  const scoreClient = useMemo(() => new ScoreClient(gateway), [gateway]);
  const wordDictionaryClient = useMemo(
    () => new WordDictionaryClient(gateway),
    [gateway],
  );

  const contextValue = useMemo(
    () => ({
      scoreClient,
      wordDictionaryClient,
      convexEnabled: gateway.isConfigured,
    }),
    [scoreClient, wordDictionaryClient, gateway],
  );

  return (
    <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>
  );
};

const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined)
    throw new Error("useApi must be used within an ApiProvider");
  return context;
};

export { ApiProvider, useApi };
