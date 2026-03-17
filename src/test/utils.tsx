import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { TopScoresResult } from "@api/score";
import type { ReactElement, ReactNode } from "react";
import { ApiContext } from "@providers/Api/ApiContext";
import type { ApiContextType } from "@providers/Api/types";

const DEFAULT_TOP_SCORES_RESULT: TopScoresResult = {
  scores: [],
  source: "local",
  currentClientRank: null,
  currentClientEntry: null,
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

const renderWithQueryClient = (
  ui: ReactElement,
  queryClient: QueryClient = createTestQueryClient(),
) =>
  render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);

const createTestApiContextValue = (
  overrides: Partial<ApiContextType> = {},
): ApiContextType => ({
  scoreClient: createMockScoreClient(async () => DEFAULT_TOP_SCORES_RESULT),
  wordDictionaryClient: createMockWordDictionaryClient(async () => []),
  convexEnabled: true,
  ...overrides,
});

const createMockScoreClient = (
  listTopScores: ApiContextType["scoreClient"]["listTopScores"],
) => ({ listTopScores }) as unknown as ApiContextType["scoreClient"];

const createMockWordDictionaryClient = (
  loadWords: ApiContextType["wordDictionaryClient"]["loadWords"],
) => ({ loadWords }) as unknown as ApiContextType["wordDictionaryClient"];

const createHookWrapper = (
  queryClient: QueryClient,
  apiValue: ApiContextType,
) => {
  const HookWrapper = ({ children }: { children: ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <ApiContext.Provider value={apiValue}>{children}</ApiContext.Provider>
      </QueryClientProvider>
    );
  };

  return HookWrapper;
};

export {
  createHookWrapper,
  createMockScoreClient,
  createMockWordDictionaryClient,
  createTestApiContextValue,
  createTestQueryClient,
  renderWithQueryClient,
};
