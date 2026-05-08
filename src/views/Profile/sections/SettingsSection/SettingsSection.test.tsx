import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SettingsSection from "./SettingsSection";

const mockResetTutorialTour = vi.fn();

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@providers/FeatureFlags", () => ({
  useFeatureFlags: () => ({
    soundEnabled: true,
  }),
}));

vi.mock("../DifficultySection", () => ({
  DifficultySection: () => <div data-testid="difficulty-section" />,
}));

vi.mock("@views/Profile/providers", () => ({
  useProfileView: () => ({
    controller: {
      startAnimationsEnabled: true,
      toggleStartAnimations: vi.fn(),
      themePreference: "system",
      changeThemePreference: vi.fn(),
      language: "en",
      openLanguageDialog: vi.fn(),
      showEndOfGameDialogs: true,
      changeShowEndOfGameDialogs: vi.fn(),
      soundEnabled: true,
      changeSoundEnabled: vi.fn(),
      manualTileSelection: false,
      changeManualTileSelection: vi.fn(),
      resetTutorialTour: mockResetTutorialTour,
    },
  }),
}));

describe("SettingsSection", () => {
  beforeEach(() => {
    mockResetTutorialTour.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("resets the tutorial tour from profile settings", () => {
    render(<SettingsSection />);

    fireEvent.click(screen.getByText("profile.resetTutorialTourAction"));

    expect(mockResetTutorialTour).toHaveBeenCalledTimes(1);
  });
});
