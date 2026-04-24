import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WORDLE_MODE_IDS } from "@domain/wordle";
import SettingsDrawer from "./SettingsDrawer";

const featureFlagsMock = vi.hoisted(() => ({
  wordListButtonEnabled: true,
  settingsDrawerEnabled: true,
}));

const playViewMock = vi.hoisted(() => ({
  controller: {
    activeModeId: WORDLE_MODE_IDS.CLASSIC,
    showSettingsPanel: true,
    openSettingsPanel: vi.fn(),
    closeSettingsPanel: vi.fn(),
    changeDifficulty: vi.fn(),
    changeManualTileSelection: vi.fn(),
  },
  player: {
    difficulty: "normal",
    manualTileSelection: false,
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

describe("SettingsDrawer", () => {
  beforeEach(() => {
    featureFlagsMock.settingsDrawerEnabled = true;
    playViewMock.controller.activeModeId = WORDLE_MODE_IDS.CLASSIC;
    playViewMock.controller.showSettingsPanel = true;
    playViewMock.controller.closeSettingsPanel.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("closes from the header close action", () => {
    render(<SettingsDrawer />);

    fireEvent.click(screen.getByRole("button", { name: "common.close" }));

    expect(playViewMock.controller.closeSettingsPanel).toHaveBeenCalledTimes(1);
  });

  it("hides difficulty settings when active mode is daily", () => {
    playViewMock.controller.activeModeId = WORDLE_MODE_IDS.DAILY;

    render(<SettingsDrawer />);

    expect(screen.queryByLabelText("profile.labels.difficulty")).toBeNull();
  });
});
