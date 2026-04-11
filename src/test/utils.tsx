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

const createMockChallengeClient = () =>
  ({
    isConfigured: false,
    getTodayChallenges: vi.fn().mockResolvedValue(null),
    generateDailyChallenges: vi.fn().mockResolvedValue(null),
    regenerateDailyChallenges: vi.fn().mockResolvedValue(null),
    getPlayerChallengeProgress: vi.fn().mockResolvedValue([]),
    completeChallenge: vi
      .fn()
      .mockResolvedValue({ pointsAwarded: 0, alreadyCompleted: false }),
    resetPlayerChallengeProgressForDate: vi
      .fn()
      .mockResolvedValue({ resetCount: 0, pointsReverted: 0 }),
    seedChallenges: vi
      .fn()
      .mockResolvedValue({ inserted: 0, total: 0, alreadySeeded: true }),
  }) as unknown as ApiContextType["challengeClient"];

const createTestApiContextValue = (
  overrides: Partial<ApiContextType> = {},
): ApiContextType => ({
  scoreClient: createMockScoreClient(async () => DEFAULT_TOP_SCORES_RESULT),
  wordDictionaryClient: createMockWordDictionaryClient(async () => []),
  challengeClient: createMockChallengeClient(),
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
          language: input.language,
          playerCode: "AB12",
          score: input.score ?? 0,
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
      language: "en",
      playerCode: "AB12",
      score: 0,
      streak: 0,
      difficulty: "normal",
      keyboardPreference: "onscreen",
      createdAt: 1000,
    } as RemotePlayerProfile),
    getCurrentPlayerProfile: vi.fn().mockResolvedValue(null),
    cachePlayerScore: vi.fn(),
    getCachedTopScores: vi.fn().mockReturnValue(DEFAULT_TOP_SCORES_RESULT),
    syncPendingScores: vi.fn().mockResolvedValue({ flushed: false }),
    queueRoundEvent: vi.fn(),
    syncRoundEvents: vi.fn().mockResolvedValue(null),
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
  createMockChallengeClient,
  createMockScoreClient,
  createMockWordDictionaryClient,
  createTestApiContextValue,
  createTestQueryClient,
  renderWithQueryClient,
};
