import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { WORDLE_MODE_IDS } from "@domain/wordle";

const mockUsePlayController = vi.fn();
const mockUsePlayer = vi.fn();
const mockUseFeatureFlags = vi.fn();
const mockUseChallenges = vi.fn();

vi.mock("../hooks", () => ({
  usePlayController: (...args: unknown[]) => mockUsePlayController(...args),
}));

vi.mock("@providers", () => ({
  usePlayer: () => mockUsePlayer(),
}));

vi.mock("@providers/FeatureFlags", () => ({
  useFeatureFlags: () => mockUseFeatureFlags(),
}));

vi.mock("@hooks/useChallenges", () => ({
  useChallenges: (...args: unknown[]) => mockUseChallenges(...args),
}));

const { PlayViewProvider } = await import("./PlayViewProvider");
const { usePlayView } = await import("./usePlayView");

const TestConsumer = () => {
  const { challengesEnabled } = usePlayView();

  return (
    <div data-testid="play-view-consumer" data-challenges={challengesEnabled} />
  );
};

const renderProvider = (
  children: ReactNode,
  modeId?: "classic" | "lightning" | "daily",
) => render(<PlayViewProvider modeId={modeId}>{children}</PlayViewProvider>);

describe("PlayViewProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUsePlayController.mockReturnValue({
      activeModeId: WORDLE_MODE_IDS.CLASSIC,
      startAnimationsEnabled: true,
      startAnimationSeed: 1,
      wordListEnabledForDifficulty: true,
    });

    mockUsePlayer.mockReturnValue({
      player: {
        keyboardPreference: "onscreen",
      },
    });

    mockUseFeatureFlags.mockReturnValue({
      wordListButtonEnabled: true,
      devConsoleEnabled: false,
      challengesEnabled: true,
    });

    mockUseChallenges.mockReturnValue({
      challenges: null,
      progress: [],
      loading: false,
      showDialog: false,
      millisUntilEndOfDay: 0,
      openDialog: vi.fn(),
      closeDialog: vi.fn(),
      refreshProgress: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("enables challenges in classic mode", () => {
    mockUsePlayController.mockReturnValue({
      activeModeId: WORDLE_MODE_IDS.CLASSIC,
      startAnimationsEnabled: true,
      startAnimationSeed: 1,
      wordListEnabledForDifficulty: true,
    });

    renderProvider(<TestConsumer />, WORDLE_MODE_IDS.CLASSIC);

    expect(mockUseChallenges).toHaveBeenCalledWith(true);
    expect(screen.getByTestId("play-view-consumer").dataset.challenges).toBe(
      "true",
    );
  });

  it("disables challenges in lightning mode", () => {
    mockUsePlayController.mockReturnValue({
      activeModeId: WORDLE_MODE_IDS.LIGHTNING,
      startAnimationsEnabled: true,
      startAnimationSeed: 1,
      wordListEnabledForDifficulty: true,
    });

    renderProvider(<TestConsumer />, WORDLE_MODE_IDS.LIGHTNING);

    expect(mockUseChallenges).toHaveBeenCalledWith(false);
    expect(screen.getByTestId("play-view-consumer").dataset.challenges).toBe(
      "false",
    );
  });

  it("disables challenges in daily mode", () => {
    mockUsePlayController.mockReturnValue({
      activeModeId: WORDLE_MODE_IDS.DAILY,
      startAnimationsEnabled: true,
      startAnimationSeed: 1,
      wordListEnabledForDifficulty: true,
    });

    renderProvider(<TestConsumer />, WORDLE_MODE_IDS.DAILY);

    expect(mockUseChallenges).toHaveBeenCalledWith(false);
    expect(screen.getByTestId("play-view-consumer").dataset.challenges).toBe(
      "false",
    );
  });
});
