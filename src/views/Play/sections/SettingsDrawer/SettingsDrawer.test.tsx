import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ROUTE_SEARCH_PARAMS, ROUTE_SEARCH_PARAM_VALUES } from "@config/routes";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import { WORDLE_MODE_IDS } from "@domain/wordle";
import { MemoryRouter } from "react-router";
import SettingsDrawer from "./SettingsDrawer";

const featureFlagsMock = vi.hoisted(() => ({
  wordListButtonEnabled: true,
  settingsDrawerEnabled: true,
}));

const playViewMock = vi.hoisted(() => ({
  controller: {
    activeModeId: "classic",
    showSettingsPanel: true,
    openSettingsPanel: vi.fn(),
    closeSettingsPanel: vi.fn(),
    changeDifficulty: vi.fn(),
    changeManualTileSelection: vi.fn(),
    resetTutorialTour: vi.fn(),
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
  const renderSettingsDrawer = (initialEntry = "/play") =>
    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <SettingsDrawer />
      </MemoryRouter>,
    );

  beforeEach(() => {
    featureFlagsMock.settingsDrawerEnabled = true;
    playViewMock.controller.activeModeId = WORDLE_MODE_IDS.CLASSIC;
    playViewMock.controller.showSettingsPanel = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (playViewMock.controller.closeSettingsPanel as Mock<any>).mockClear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (playViewMock.controller.resetTutorialTour as Mock<any>).mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("closes from the header close action", () => {
    renderSettingsDrawer();

    fireEvent.click(screen.getByRole("button", { name: "common.close" }));

    expect(playViewMock.controller.closeSettingsPanel).toHaveBeenCalledTimes(1);
  });

  it("hides difficulty settings when active mode is daily", () => {
    playViewMock.controller.activeModeId = WORDLE_MODE_IDS.DAILY;

    renderSettingsDrawer();

    expect(screen.queryByLabelText("profile.labels.difficulty")).toBeNull();
  });

  it("hides difficulty settings when active mode is zen", () => {
    playViewMock.controller.activeModeId = WORDLE_MODE_IDS.ZEN;

    renderSettingsDrawer();

    expect(screen.queryByLabelText("profile.labels.difficulty")).toBeNull();
  });

  it("hides the side settings activator when zen focus mode is active", () => {
    playViewMock.controller.activeModeId = WORDLE_MODE_IDS.ZEN;
    playViewMock.controller.showSettingsPanel = false;

    renderSettingsDrawer(
      `/zen?${ROUTE_SEARCH_PARAMS.FOCUS}=${ROUTE_SEARCH_PARAM_VALUES.FOCUS_ON}`,
    );

    expect(
      screen.queryByRole("button", { name: "play.toolbar.settingsAriaLabel" }),
    ).toBeNull();
  });

  it("resets tutorial state from quick settings", () => {
    renderSettingsDrawer();

    fireEvent.click(screen.getByText("profile.resetTutorialTourAction"));

    expect(playViewMock.controller.resetTutorialTour).toHaveBeenCalledTimes(1);
  });
});
