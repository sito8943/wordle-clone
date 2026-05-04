import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ROUTES } from "@config/routes";
import { i18n, initI18n } from "@i18n";
import Changelog from "./Changelog";

const renderChangelog = (entry: string) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path={ROUTES.CHANGELOG} element={<Changelog />} />
      </Routes>
    </MemoryRouter>,
  );

afterEach(cleanup);

beforeAll(async () => {
  await initI18n();
});

beforeEach(async () => {
  await i18n.changeLanguage("en");
});

describe("Changelog", () => {
  it("renders the selected version changelog", () => {
    renderChangelog("/changelog/0.0.16-beta");

    expect(
      screen.getByRole("heading", { name: "Changelog", level: 2 }),
    ).toBeTruthy();
    expect(screen.getByText("Version 0.0.16-beta")).toBeTruthy();
    expect(
      screen.getByText(
        "Added local app-version tracking to detect when a newer frontend build is available in this browser.",
      ),
    ).toBeTruthy();
  });

  it("renders not found content when version does not exist", () => {
    renderChangelog("/changelog/9.9.9");

    expect(screen.getByText("Version not found")).toBeTruthy();
    expect(
      screen.getByText("No changelog was found for this version."),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Open current version (0.0.21)" }),
    ).toBeTruthy();
  });

  it("renders localized changelog entries in spanish", async () => {
    await i18n.changeLanguage("es");
    renderChangelog("/changelog/0.0.16-beta");

    expect(screen.getByText("Versión 0.0.16-beta")).toBeTruthy();
    expect(
      screen.getByText(
        "Se añadió seguimiento de la versión de la app en local para detectar builds más nuevas del frontend en este navegador.",
      ),
    ).toBeTruthy();
  });
});
