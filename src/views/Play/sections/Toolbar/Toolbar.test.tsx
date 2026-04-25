import { cleanup, render, screen } from "@testing-library/react";
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
    volume: 1,
    muted: false,
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

vi.mock("./HardModeTimerIndicator", () => ({
  HardModeTimerIndicator: () => null,
}));

describe("Toolbar", () => {
  beforeEach(() => {
    playViewMock.controller.activeModeId = WORDLE_MODE_IDS.CLASSIC;
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
});
