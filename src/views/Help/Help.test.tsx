import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  CLASSIC_ROUND_CONFIG,
  MAX_STREAK_FOR_SCORE_MULTIPLIER,
  NORMAL_DICTIONARY_ROW_BONUS,
} from "@domain/wordle";
import { ROUTES } from "@config/routes";
import { i18n, initI18n } from "@i18n";
import type { FeatureFlags } from "@providers/FeatureFlags/types";
import { NORMAL_MODE_HINT_LIMIT } from "@views/Play/hooks/useHintController/constants";
import { HARD_MODE_TOTAL_SECONDS } from "@views/Play/hooks/usePlayController/constants";
import Help from "./Help";

const featureFlagsMock: FeatureFlags = {
  wordListButtonEnabled: true,
  wordReportButtonEnabled: true,
  paypalDonationButtonEnabled: true,
  shareButtonEnabled: true,
  devConsoleEnabled: true,
  soundEnabled: true,
  masterAndMusicChannelsEnabled: false,
  hintsEnabled: true,
  helpButtonEnabled: true,
  challengesEnabled: true,
  settingsDrawerEnabled: true,
  lightningModeEnabled: true,
  lightningStartCueAndAutoTimerEnabled: false,
  timerAutoPauseEnabled: true,
  difficultyEasyEnabled: true,
  difficultyNormalEnabled: true,
  difficultyHardEnabled: true,
  difficultyInsaneEnabled: true,
};

vi.mock("@providers/FeatureFlags", () => ({
  useFeatureFlags: () => featureFlagsMock,
}));

afterEach(cleanup);

beforeAll(async () => {
  await initI18n();
});

beforeEach(async () => {
  await i18n.changeLanguage("en");
  featureFlagsMock.difficultyEasyEnabled = true;
  featureFlagsMock.difficultyNormalEnabled = true;
  featureFlagsMock.difficultyHardEnabled = true;
  featureFlagsMock.difficultyInsaneEnabled = true;
});

const renderHelp = (entry: string = ROUTES.HELP) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Help />
    </MemoryRouter>,
  );

describe("Help", () => {
  it("renders the page title and description", () => {
    renderHelp();

    expect(
      screen.getByRole("heading", {
        name: i18n.t("play.helpDialog.title"),
        level: 2,
      }),
    ).toBeTruthy();
    expect(
      screen.getByText(i18n.t("play.helpDialog.description")),
    ).toBeTruthy();
  });

  it("renders rules and scoring sections", () => {
    renderHelp();

    expect(
      screen.getByRole("heading", {
        name: i18n.t("play.helpDialog.rulesTitle"),
        level: 3,
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", {
        name: i18n.t("play.helpDialog.scoringTitle"),
        level: 3,
      }),
    ).toBeTruthy();
  });

  it("renders scoring rules including normal dictionary-row bonus", () => {
    renderHelp();

    const normalBonusText = i18n.t("play.helpDialog.scoring.normal", {
      bonus: NORMAL_DICTIONARY_ROW_BONUS,
    });

    expect(
      screen.getByText(i18n.t("play.helpDialog.scoring.hard")),
    ).toBeTruthy();
    expect(
      screen.getByText(i18n.t("play.helpDialog.scoring.insane")),
    ).toBeTruthy();
    expect(screen.getByText(normalBonusText)).toBeTruthy();
    expect(
      screen.getByText(
        i18n.t("play.helpDialog.scoring.streakBonus", {
          maxStreak: MAX_STREAK_FOR_SCORE_MULTIPLIER,
        }),
      ),
    ).toBeTruthy();
  });

  it("renders the difficulty settings link", () => {
    renderHelp();

    const difficultyLink = screen.getByRole("link", {
      name: i18n.t("play.helpDialog.changeDifficultyLink"),
    });

    expect(difficultyLink.getAttribute("href")).toBe(
      `${ROUTES.SETTINGS}#difficulty`,
    );
  });

  it("renders mode-specific rules when mode query is provided", () => {
    renderHelp(`${ROUTES.HELP}?mode=lightning`);

    const modeName = i18n.t("gameModes.modes.lightning.name");
    expect(
      screen.getByRole("heading", {
        name: i18n.t("play.helpDialog.modeTitle", { mode: modeName }),
        level: 3,
      }),
    ).toBeTruthy();

    expect(
      screen.getByText(
        i18n.t("gameModes.modes.lightning.details.baseRules", {
          rows: CLASSIC_ROUND_CONFIG.maxGuesses,
          letters: CLASSIC_ROUND_CONFIG.lettersPerRow,
        }),
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        i18n.t("gameModes.modes.lightning.details.timer", {
          seconds: HARD_MODE_TOTAL_SECONDS,
        }),
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        i18n.t("gameModes.modes.lightning.details.hintsChoice", {
          hintCount: NORMAL_MODE_HINT_LIMIT,
        }),
      ),
    ).toBeTruthy();
  });

  it("hides easy and insane scoring descriptions when those difficulties are disabled", () => {
    featureFlagsMock.difficultyEasyEnabled = false;
    featureFlagsMock.difficultyInsaneEnabled = false;
    renderHelp();

    expect(
      screen.queryByText(i18n.t("play.helpDialog.scoring.easy")),
    ).toBeNull();
    expect(
      screen.queryByText(i18n.t("play.helpDialog.scoring.insane")),
    ).toBeNull();
    expect(
      screen.getByText(i18n.t("play.helpDialog.scoring.hard")),
    ).toBeTruthy();
    expect(
      screen.getByText(
        i18n.t("play.helpDialog.scoring.finalNoInsane", {
          maxStreak: MAX_STREAK_FOR_SCORE_MULTIPLIER,
        }),
      ),
    ).toBeTruthy();
  });
});
