import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DialogQueueProvider } from "@providers";
import DialogsSection from "./DialogsSection";

const featureFlagsMock = vi.hoisted(() => ({
  shareButtonEnabled: true,
  settingsDrawerEnabled: true,
}));

const controllerMock = vi.hoisted(() => ({
  activeModeId: "classic",
  message: "",
  showLightningModeStartCue: false,
  showResumeDialog: false,
  showDictionaryChecksumDialog: false,
  showRefreshDialog: false,
  showTutorialPromptDialog: false,
  showGameplayTourDialog: false,
  gameplayTourSteps: [] as Array<{
    id: string;
    selector: string | null;
    titleKey: string;
    descriptionKey: string;
  }>,
  gameplayTourStepIndex: 0,
  canGoToPreviousGameplayTourStep: false,
  closeGameplayTour: vi.fn(),
  goToNextGameplayTourStep: vi.fn(),
  goToPreviousGameplayTourStep: vi.fn(),
  openModeHelpFromGameplayTour: vi.fn(),
  showWordsDialog: false,
  showDailyMeaningDialog: false,
  isLoadingDailyMeaning: false,
  dailyMeaning: null as string | null,
  dailyMeaningError: null as string | null,
  showDeveloperConsoleDialog: false,
  showDeveloperChallengesSection: true,
  showDeveloperDailySection: false,
  isDifficultyChangeConfirmationOpen: false,
  showVictoryDialog: false,
  showDefeatDialog: false,
  showDailyCompletedDialog: false,
  answer: "",
  victoryBoardShareSupported: false,
  isSharingVictoryBoard: false,
  victoryBoardShareError: null as string | null,
  shareVictoryBoard: vi.fn(),
  showEndOfGameSettingsHint: false,
  endOfGameAnswer: "",
  victoryScoreSummary: null,
  endOfGameChallengeBonusPoints: 0,
  endOfGameCurrentStreak: 0,
  endOfGameBestStreak: 0,
  continuePreviousBoard: vi.fn(),
  startNewBoard: vi.fn(),
  closeEndOfGameDialog: vi.fn(),
  goToPlayRoute: vi.fn(),
  openSettingsPanel: vi.fn(),
  cancelRefreshBoard: vi.fn(),
  acceptTutorialPrompt: vi.fn(),
  declineTutorialPrompt: vi.fn(),
  confirmDictionaryChecksumRefresh: vi.fn(),
  confirmRefreshBoard: vi.fn(),
  dictionaryWords: [] as string[],
  currentLanguage: "es",
  closeWordsDialog: vi.fn(),
  closeDailyMeaningDialog: vi.fn(),
  retryDailyMeaningFetch: vi.fn(),
  closeDeveloperConsoleDialog: vi.fn(),
  submitDeveloperPlayer: vi.fn(),
  refreshRemoteDictionaryChecksum: vi.fn(),
  isRefreshingDictionaryChecksum: false,
  dictionaryChecksumMessage: null as string | null,
  dictionaryChecksumMessageKind: null as "success" | "error" | null,
  refreshDailyChallengesForDeveloper: vi.fn(),
  changeDailyChallengesForDeveloper: vi.fn(),
  isRefreshingDailyChallengesForDeveloper: false,
  isChangingDailyChallengesForDeveloper: false,
  dailyChallengesDeveloperMessage: null as string | null,
  dailyChallengesDeveloperMessageKind: null as "success" | "error" | null,
  resetDailyForCurrentPlayerForDeveloper: vi.fn(),
  resetDailyForAllPlayersForDeveloper: vi.fn(),
  dailyModeDeveloperMessage: null as string | null,
  dailyModeDeveloperMessageKind: null as "success" | "error" | null,
}));

const playViewMock = vi.hoisted(() => ({
  controller: controllerMock,
  player: { name: "Player" },
  wordListButtonEnabled: false,
  developerConsoleEnabled: false,
  challengesEnabled: false,
  challenges: {
    challenges: null,
    progress: [],
    loading: false,
    showDialog: false,
    millisUntilEndOfDay: 0,
    openDialog: vi.fn(),
    closeDialog: vi.fn(),
    refreshProgress: vi.fn(),
  },
}));

vi.mock("@providers/FeatureFlags", () => ({
  useFeatureFlags: () => featureFlagsMock,
}));

vi.mock("@views/Play/providers", () => ({
  usePlayView: () => playViewMock,
}));

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock(
  "../../components/Dialogs/SessionResumeDialog/SessionResumeDialog",
  () => ({
    default: ({ visible }: { visible: boolean }) =>
      visible ? <div>Resume Dialog</div> : null,
  }),
);

vi.mock(
  "../../components/Dialogs/RefreshConfirmationDialog/RefreshConfirmationDialog",
  () => ({
    default: ({ visible }: { visible: boolean }) =>
      visible ? <div>Refresh Dialog</div> : null,
  }),
);

vi.mock(
  "../../components/Dialogs/DailyCompletedDialog/DailyCompletedDialog",
  () => ({
    default: ({ visible }: { visible: boolean }) =>
      visible ? <div>Daily Completed Dialog</div> : null,
  }),
);

describe("DialogsSection", () => {
  beforeEach(() => {
    controllerMock.showResumeDialog = false;
    controllerMock.showRefreshDialog = false;
    controllerMock.showDailyCompletedDialog = false;
  });

  afterEach(() => {
    cleanup();
  });

  it("renders one dialog at a time and shows the queued next dialog", async () => {
    controllerMock.showResumeDialog = true;
    controllerMock.showRefreshDialog = true;

    const { rerender } = render(
      <DialogQueueProvider>
        <DialogsSection key="resume-open" />
      </DialogQueueProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Resume Dialog")).toBeTruthy();
    });
    expect(screen.queryByText("Refresh Dialog")).toBeNull();

    controllerMock.showResumeDialog = false;
    rerender(
      <DialogQueueProvider>
        <DialogsSection key="resume-closed" />
      </DialogQueueProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Refresh Dialog")).toBeTruthy();
    });
  });

  it("renders the daily-completed dialog when enabled", async () => {
    controllerMock.showDailyCompletedDialog = true;

    render(
      <DialogQueueProvider>
        <DialogsSection />
      </DialogQueueProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Daily Completed Dialog")).toBeTruthy();
    });
  });
});
