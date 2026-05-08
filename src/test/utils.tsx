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
    listAllChallenges: vi.fn().mockResolvedValue([]),
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

const createMockDailyWordClient = (
  getDailyWord: ApiContextType["dailyWordClient"]["getDailyWord"] = vi
    .fn()
    .mockResolvedValue(null),
  getDailyMeaning: ApiContextType["dailyWordClient"]["getDailyMeaning"] = vi
    .fn()
    .mockResolvedValue(null),
  overrides: Partial<ApiContextType["dailyWordClient"]> = {},
) =>
  ({
    getDailyWord,
    getDailyReference: vi.fn().mockResolvedValue(null),
    getDailyMeaning,
    getCachedWord: vi.fn().mockReturnValue(null),
    cacheWord: vi.fn(),
    getCachedReference: vi.fn().mockReturnValue(null),
    cacheReference: vi.fn(),
    getCachedMeaning: vi.fn().mockReturnValue(null),
    cacheMeaning: vi.fn(),
    ...overrides,
  }) as unknown as ApiContextType["dailyWordClient"];

const createTestApiContextValue = (
  overrides: Partial<ApiContextType> = {},
): ApiContextType => ({
  apiManager: createMockApiManager(),
  scoreClient: createMockScoreClient(async () => DEFAULT_TOP_SCORES_RESULT),
  wordDictionaryClient: createMockWordDictionaryClient(async () => []),
  dailyWordClient: createMockDailyWordClient(),
  challengeClient: createMockChallengeClient(),
  convexEnabled: true,
  ...overrides,
});

const createMockApiManager = (
  overrides: Partial<{
    words: Partial<ApiContextType["apiManager"]["words"]>;
    players: Partial<ApiContextType["apiManager"]["players"]>;
    scores: Partial<ApiContextType["apiManager"]["scores"]>;
    challenges: Partial<ApiContextType["apiManager"]["challenges"]>;
    admin: Partial<ApiContextType["apiManager"]["admin"]>;
    identity: Partial<ApiContextType["apiManager"]["identity"]>;
    syncQueue: Partial<ApiContextType["apiManager"]["syncQueue"]>;
  }> = {},
): ApiContextType["apiManager"] =>
  ({
    isConfigured: false,
    syncQueue: {
      enqueueRoundEvent: vi.fn(),
      readRoundEvents: vi.fn().mockReturnValue([]),
      writeRoundEvents: vi.fn(),
      removeRoundEvents: vi.fn(),
      clearRoundEvents: vi.fn(),
      enqueuePendingScore: vi.fn(),
      readPendingScores: vi.fn().mockReturnValue([]),
      writePendingScores: vi.fn(),
      removePendingScore: vi.fn(),
      clearPendingScores: vi.fn(),
      ...overrides.syncQueue,
    },
    identity: {
      getClientId: vi.fn().mockReturnValue("test-client"),
      getClientRecordId: vi.fn().mockReturnValue(null),
      setClientRecordId: vi.fn(),
      clearClientRecordId: vi.fn(),
      getIdentity: vi.fn().mockReturnValue({ clientId: "test-client" }),
      requireIdentity: vi.fn().mockReturnValue({
        clientId: "test-client",
        clientRecordId: "test-record",
      }),
      adoptFromProfile: vi.fn(),
      ...overrides.identity,
    },
    words: {
      list: vi.fn().mockResolvedValue([]),
      getChecksum: vi.fn().mockResolvedValue(null),
      seed: vi.fn().mockResolvedValue(undefined),
      ensureSeeded: vi.fn().mockResolvedValue(undefined),
      refreshChecksum: vi.fn().mockResolvedValue({ checksum: 0, updatedAt: 0 }),
      ...overrides.words,
    },
    players: {
      register: vi.fn().mockResolvedValue(null),
      getMe: vi.fn().mockResolvedValue(null),
      renameNick: vi.fn().mockResolvedValue(null),
      updatePreferences: vi.fn().mockResolvedValue(null),
      markTutorialSeen: vi.fn().mockResolvedValue(null),
      getNickAvailability: vi.fn().mockResolvedValue({ available: true }),
      getByCode: vi.fn().mockResolvedValue(null),
      backfillCodes: vi.fn().mockResolvedValue({ updated: 0 }),
      ...overrides.players,
    },
    scores: {
      getTop: vi.fn().mockResolvedValue({ scores: [] }),
      record: vi.fn().mockResolvedValue({ ok: true, id: "score_test" }),
      update: vi.fn().mockResolvedValue({ ok: true, id: "score_test" }),
      syncRoundEvents: vi.fn().mockResolvedValue(null),
      consumeDailyShield: vi.fn().mockResolvedValue(null),
      ...overrides.scores,
    },
    challenges: {
      list: vi.fn().mockResolvedValue([]),
      getToday: vi.fn().mockResolvedValue(null),
      getProgress: vi.fn().mockResolvedValue([]),
      resetProgress: vi
        .fn()
        .mockResolvedValue({ resetCount: 0, pointsReverted: 0 }),
      generateDaily: vi.fn().mockResolvedValue(null),
      regenerateDaily: vi.fn().mockResolvedValue(null),
      complete: vi
        .fn()
        .mockResolvedValue({ pointsAwarded: 0, alreadyCompleted: false }),
      seed: vi
        .fn()
        .mockResolvedValue({ inserted: 0, total: 0, alreadySeeded: true }),
      ...overrides.challenges,
    },
    admin: {
      getDbStatus: vi.fn().mockResolvedValue({ empty: false, counts: {} }),
      importBackup: vi.fn().mockResolvedValue({ ok: true, imported: {} }),
      ...overrides.admin,
    },
  }) as unknown as ApiContextType["apiManager"];

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
          tutorialPromptSeenModes: input.tutorialPromptSeenModes,
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
    consumeDailyShield: vi.fn().mockResolvedValue(null),
    getCurrentClientScoreSnapshot: vi.fn().mockReturnValue({
      score: 0,
      streak: 0,
    }),
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
  createMockApiManager,
  createMockChallengeClient,
  createMockDailyWordClient,
  createMockScoreClient,
  createMockWordDictionaryClient,
  createTestApiContextValue,
  createTestQueryClient,
  renderWithQueryClient,
};
