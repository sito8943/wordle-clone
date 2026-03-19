import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { vi } from "vitest";
import type { RemotePlayerProfile, TopScoresResult } from "@api/score";
import type { ReactElement, ReactNode } from "react";
import { i18n } from "@i18n";
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
) => {
  void i18n.changeLanguage("en");

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

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
  overrides: Partial<ApiContextType["scoreClient"]> = {},
) =>
  ({
    listTopScores,
    recordScore: vi.fn().mockResolvedValue(undefined),
    isNickAvailable: vi.fn().mockResolvedValue(true),
    upsertPlayerProfile: vi.fn().mockImplementation(
      async (input) =>
        ({
          id: "remote-player",
          clientId: "test-client",
          clientRecordId: "test-record",
          nick: input.nick,
          playerCode: "AB12",
          score: input.score,
          streak: input.streak ?? 0,
          difficulty: input.difficulty,
          keyboardPreference: input.keyboardPreference,
          createdAt: 1000,
        }) as RemotePlayerProfile,
    ),
    recoverPlayerByCode: vi.fn().mockResolvedValue({
      id: "remote-player",
      clientId: "test-client",
      clientRecordId: "test-record",
      nick: "Recovered",
      playerCode: "AB12",
      score: 0,
      streak: 0,
      difficulty: "normal",
      keyboardPreference: "onscreen",
      createdAt: 1000,
    } as RemotePlayerProfile),
    getCurrentPlayerProfile: vi.fn().mockResolvedValue(null),
    cachePlayerScore: vi.fn(),
    queueVictoryEvent: vi.fn(),
    syncVictoryEvents: vi.fn().mockResolvedValue(null),
    adoptRecoveredIdentity: vi.fn(),
    ...overrides,
  }) as unknown as ApiContextType["scoreClient"];

const createMockWordDictionaryClient = (
  loadWords: ApiContextType["wordDictionaryClient"]["loadWords"],
  overrides: Partial<ApiContextType["wordDictionaryClient"]> = {},
) =>
  ({
    loadWords,
    fetchRemoteChecksum: vi.fn().mockResolvedValue(null),
    refreshRemoteChecksum: vi
      .fn()
      .mockResolvedValue({ checksum: 0, updatedAt: 0 }),
    getStoredChecksum: vi.fn().mockReturnValue(null),
    clearCache: vi.fn(),
    getCachedWords: vi.fn().mockReturnValue([]),
    ...overrides,
  }) as unknown as ApiContextType["wordDictionaryClient"];

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
