import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WORDLE_MODE_IDS } from "@domain/wordle";
import Toolbar from "./Toolbar";

const featureFlagsMock = vi.hoisted(() => ({
  hintsEnabled: false,
  soundEnabled: false,
}));

const playViewMock = vi.hoisted(() => ({
  controller: {
    activeModeId: "daily",
    currentWinStreak: 0,
    dictionaryLoading: false,
    dictionaryWords: [],
    openWordsDialog: vi.fn(),
    openDailyMeaningDialog: vi.fn(),
    hintsEnabledForDifficulty: false,
    useHint: vi.fn(),
    hintButtonDisabled: true,
    hintsRemaining: 0,
    canReopenEndOfGameDialog: false,
    reopenEndOfGameDialog: vi.fn(),
    showGameplayTourDialog: false,
    openGameplayTour: vi.fn(),
    openDeveloperConsoleDialog: vi.fn(),
    showRefreshAttention: false,
    refreshAttentionPulse: 0,
    refreshAttentionScale: 0,
    refreshBoard: vi.fn(),
    dictionaryError: null as string | null,
    challengeCompletionMessage: null as string | null,
    showHardModeTimer: false,
    hardModeSecondsLeft: 0,
    hardModeTickPulse: 0,
    hardModeClockBoostScale: 1,
  },
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

vi.mock("@providers/Sound", () => ({
  useSound: () => ({
    channels: [
      {
        id: "master",
        label: "Master",
        kind: "master",
        enabled: true,
        volume: 1,
        muted: false,
      },
    ],
  }),
}));

vi.mock("@views/Play/providers", () => ({
  usePlayView: () => playViewMock,
}));

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("Toolbar", () => {
  beforeEach(() => {
    playViewMock.controller.activeModeId = WORDLE_MODE_IDS.CLASSIC;
    playViewMock.controller.showHardModeTimer = false;
    playViewMock.controller.hardModeSecondsLeft = 0;
    playViewMock.controller.hardModeTickPulse = 0;
    playViewMock.controller.hardModeClockBoostScale = 1;
  });

  afterEach(() => {
    cleanup();
  });

  it("shows refresh button outside daily mode", () => {
    render(<Toolbar />);

    expect(
      screen.getByRole("button", { name: "play.toolbar.refreshAriaLabel" }),
    ).toBeTruthy();
  });

  it("hides refresh button in daily mode", () => {
    playViewMock.controller.activeModeId = WORDLE_MODE_IDS.DAILY;

    render(<Toolbar />);

    expect(
      screen.queryByRole("button", { name: "play.toolbar.refreshAriaLabel" }),
    ).toBeNull();
  });

  it("keeps hard mode timer icon mounted across ticks", async () => {
    playViewMock.controller.showHardModeTimer = true;
    playViewMock.controller.hardModeSecondsLeft = 60;
    playViewMock.controller.hardModeTickPulse = 0;
    playViewMock.controller.hardModeClockBoostScale = 1.08;

    const { rerender } = render(<Toolbar />);

    const firstTimerIcon = screen.getByTestId("toolbar-hard-mode-timer-icon");

    playViewMock.controller.hardModeSecondsLeft = 59;
    playViewMock.controller.hardModeTickPulse = 1;
    rerender(<Toolbar />);

    await waitFor(() => {
      const secondTimerIcon = screen.getByTestId("toolbar-hard-mode-timer-icon");
      expect(secondTimerIcon).toBe(firstTimerIcon);
      expect(secondTimerIcon.parentElement?.className).toContain(
        "boost-animation",
      );
    });
  });
});
