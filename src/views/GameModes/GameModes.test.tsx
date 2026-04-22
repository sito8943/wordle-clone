import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { ROUTES } from "@config/routes";
import { writeDailyModeOutcomeForDate } from "@domain/wordle";
import { i18n, initI18n } from "@i18n";
import { GAME_MODE_TRANSLATION_VALUES } from "./constants";
import GameModes from "./GameModes";

vi.mock("@providers", () => ({
  usePlayer: () => ({
    player: {
      code: "AB12",
    },
  }),
}));

const LocationProbe = () => {
  const location = useLocation();
  return <p data-testid="pathname">{location.pathname}</p>;
};

const renderGameModes = () =>
  render(
    <MemoryRouter initialEntries={[ROUTES.PLAY]}>
      <LocationProbe />
      <GameModes />
    </MemoryRouter>,
  );

afterEach(cleanup);

beforeAll(async () => {
  await initI18n();
});

beforeEach(async () => {
  await i18n.changeLanguage("en");
  localStorage.clear();
});

describe("GameModes", () => {
  it("renders all game mode links in the play menu", () => {
    renderGameModes();

    const routesByMode = [
      { id: "zen", route: ROUTES.ZEN },
      { id: "classic", route: ROUTES.CLASSIC },
      { id: "lightning", route: ROUTES.LIGHTING },
      { id: "daily", route: ROUTES.DAILY },
    ] as const;

    routesByMode.forEach((mode) => {
      const modeName = i18n.t(`gameModes.modes.${mode.id}.name`);
      const link = screen.getByRole("link", { name: modeName });

      expect(link.getAttribute("href")).toBe(mode.route);
    });
  });

  it("opens and closes the info dialog for a mode", async () => {
    renderGameModes();

    const modeName = i18n.t("gameModes.modes.classic.name");
    const infoButton = screen.getByRole("button", {
      name: i18n.t("gameModes.modeInfoButtonAriaLabel", { mode: modeName }),
    });

    fireEvent.click(infoButton);

    expect(
      screen.getByRole("heading", { name: modeName, level: 2 }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        i18n.t(
          "gameModes.modes.classic.details.baseRules",
          GAME_MODE_TRANSLATION_VALUES,
        ),
      ),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: i18n.t("common.close") }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("keeps the play route when touching the info button", () => {
    renderGameModes();

    const modeName = i18n.t("gameModes.modes.zen.name");
    const infoButton = screen.getByRole("button", {
      name: i18n.t("gameModes.modeInfoButtonAriaLabel", { mode: modeName }),
    });

    fireEvent.touchEnd(infoButton);

    expect(screen.getByTestId("pathname").textContent).toBe(ROUTES.PLAY);
    expect(
      screen.getByRole("heading", { name: modeName, level: 2 }),
    ).toBeTruthy();
  });

  it("shows completed-daily icon and reset countdown when today was won", () => {
    writeDailyModeOutcomeForDate({ outcome: "won", playerCode: "AB12" });

    renderGameModes();

    const dailyLink = screen.getByRole("link", {
      name: new RegExp(i18n.t("gameModes.modes.daily.name"), "i"),
    });
    const dailyIcon = dailyLink.querySelector(
      'svg[data-icon="calendar-check"]',
    );

    expect(dailyIcon).toBeTruthy();
    expect(screen.getByText("Daily reset in")).toBeTruthy();
  });

  it("shows failed-daily icon and reset countdown when today was lost", () => {
    writeDailyModeOutcomeForDate({ outcome: "lost", playerCode: "AB12" });

    renderGameModes();

    const dailyLink = screen.getByRole("link", {
      name: new RegExp(i18n.t("gameModes.modes.daily.name"), "i"),
    });
    const dailyIcon = dailyLink.querySelector(
      'svg[data-icon="calendar-xmark"]',
    );

    expect(dailyIcon).toBeTruthy();
    expect(screen.getByText("Daily reset in")).toBeTruthy();
  });
});
