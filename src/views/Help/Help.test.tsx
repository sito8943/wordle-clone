import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { NORMAL_DICTIONARY_ROW_BONUS } from "@domain/wordle";
import { ROUTES } from "@config/routes";
import Help from "./Help";

afterEach(cleanup);

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
      screen.getByRole("heading", { name: "How to play", level: 2 }),
    ).toBeTruthy();
    expect(
      screen.getByText("Guess the hidden 5-letter word in up to 6 attempts."),
    ).toBeTruthy();
  });

  it("renders rules and scoring sections", () => {
    renderHelp();

    expect(
      screen.getByRole("heading", { name: "Rules", level: 3 }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Scoring", level: 3 }),
    ).toBeTruthy();
  });

  it("renders scoring rules including normal dictionary-row bonus", () => {
    renderHelp();

    const normalBonusText = `Normal: x2 difficulty multiplier. Each incorrect dictionary-word row adds +${NORMAL_DICTIONARY_ROW_BONUS} to the difficulty multiplier (○ marker).`;

    expect(screen.getByText("Hard: x5 difficulty multiplier.")).toBeTruthy();
    expect(
      screen.getByText(
        "Insane: x9 difficulty multiplier and +1 extra point per 2 seconds left.",
      ),
    ).toBeTruthy();
    expect(screen.getByText(normalBonusText)).toBeTruthy();
    expect(
      screen.getByText(
        "Streak scales your score with x(1 + 0.3 x sqrt(streak)).",
      ),
    ).toBeTruthy();
  });

  it("renders the difficulty settings link", () => {
    renderHelp();

    const difficultyLink = screen.getByRole("link", {
      name: "difficulty settings",
    });

    expect(difficultyLink.getAttribute("href")).toBe(
      `${ROUTES.SETTINGS}#difficulty`,
    );
  });
});
