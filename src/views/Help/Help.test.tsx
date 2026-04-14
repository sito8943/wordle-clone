import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { NORMAL_DICTIONARY_ROW_BONUS } from "@domain/wordle";
import { ROUTES } from "@config/routes";
import { i18n, initI18n } from "@i18n";
import Help from "./Help";

afterEach(cleanup);

beforeAll(async () => {
  await initI18n();
});

beforeEach(async () => {
  await i18n.changeLanguage("en");
});

const renderHelp = () =>
  render(
    <MemoryRouter>
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
    expect(screen.getByText(i18n.t("play.helpDialog.description"))).toBeTruthy();
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

    expect(screen.getByText(i18n.t("play.helpDialog.scoring.hard"))).toBeTruthy();
    expect(
      screen.getByText(i18n.t("play.helpDialog.scoring.insane")),
    ).toBeTruthy();
    expect(screen.getByText(normalBonusText)).toBeTruthy();
    expect(
      screen.getByText(i18n.t("play.helpDialog.scoring.streakBonus")),
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
});
