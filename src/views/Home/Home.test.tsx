import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { env } from "@config";
import { ROUTES } from "@config/routes";
import {
  CURRENT_WORDLE_MODE_STORAGE_KEY,
  WORDLE_MODE_IDS,
} from "@domain/wordle";
import Home from "./Home";
import {
  HOME_ENTRY_ANIMATION_SESSION_KEY,
  HOME_NAV_ITEMS_ENTRY_INITIAL_DELAY_MS,
  HOME_NAV_ITEMS_ENTRY_STAGGER_DELAY_MS,
} from "./constants";

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dictionary: Record<string, string> = {
        "app.title": "Wordle",
        "nav.play": "Play",
        "profile.settingsTitle": "Settings",
        "nav.scoreboard": "Scoreboard",
        "home.donate": "Donate",
        "home.donationThankYouAlert":
          "Thanks for supporting Wordle with your donation.",
      };

      return dictionary[key] ?? key;
    },
  }),
}));

const defaultLightningModeEnabled = env.lightningModeEnabled;

afterEach(() => {
  env.paypalDonationButtonEnabled = true;
  env.lightningModeEnabled = defaultLightningModeEnabled;
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

const renderHome = (initialEntry = "/") => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Home />
    </MemoryRouter>,
  );
};

describe("Home entry animation", () => {
  it("shows a donation thank-you banner when the hash is #donated", () => {
    renderHome("/#donated");

    expect(
      screen.getByText("Thanks for supporting Wordle with your donation."),
    ).toBeTruthy();
  });

  it("plays title/menu intro once and stores the session flag", async () => {
    renderHome();

    const heading = screen.getByRole("heading", { name: "WORDLE" });
    const firstNavigationItem = screen
      .getByRole("link", { name: "Play" })
      .closest("li");
    if (!firstNavigationItem) {
      throw new Error("Expected play navigation item.");
    }

    expect(sessionStorage.getItem(HOME_ENTRY_ANIMATION_SESSION_KEY)).toBe(
      "seen",
    );

    await waitFor(() => {
      expect(heading.className).toContain("opacity-100");
      expect(heading.className).toContain("scale-100");
      expect(firstNavigationItem.className).toContain("translate-y-0");
      expect(firstNavigationItem.className).toContain("scale-100");
    });
  });

  it("applies staggered entry delays to home navigation items", () => {
    renderHome();

    const nav = screen.getByRole("navigation");
    const navItems = Array.from(nav.querySelectorAll("li"));

    navItems.forEach((item, index) => {
      expect(item.className).toContain("transition-[scale,translate]");
      expect((item as HTMLLIElement).style.transitionDelay).toBe(
        `${
          HOME_NAV_ITEMS_ENTRY_INITIAL_DELAY_MS +
          index * HOME_NAV_ITEMS_ENTRY_STAGGER_DELAY_MS
        }ms`,
      );
    });
  });

  it("does not replay the intro when the session flag already exists", () => {
    sessionStorage.setItem(HOME_ENTRY_ANIMATION_SESSION_KEY, "seen");
    const requestAnimationFrameSpy = vi.spyOn(window, "requestAnimationFrame");

    renderHome();

    const heading = screen.getByRole("heading", { name: "WORDLE" });
    const firstNavigationItem = screen
      .getByRole("link", { name: "Play" })
      .closest("li");
    if (!firstNavigationItem) {
      throw new Error("Expected play navigation item.");
    }

    expect(requestAnimationFrameSpy).not.toHaveBeenCalled();
    expect(heading.className).toContain("opacity-100");
    expect(heading.className).toContain("scale-100");
    expect(firstNavigationItem.className).toContain("translate-y-0");
    expect(firstNavigationItem.className).toContain("scale-100");
  });

  it("hides the donate button when paypal feature flag is disabled", () => {
    env.paypalDonationButtonEnabled = false;

    renderHome();

    expect(screen.queryByRole("link", { name: "Donate" })).toBeNull();
  });

  it("links Play to classic mode when no current mode is stored", () => {
    renderHome();

    expect(
      screen.getByRole("link", { name: "Play" }).getAttribute("href"),
    ).toBe(ROUTES.CLASSIC);
  });

  it("links Play to the stored current mode route", () => {
    localStorage.setItem(
      CURRENT_WORDLE_MODE_STORAGE_KEY,
      WORDLE_MODE_IDS.LIGHTNING,
    );

    renderHome();

    expect(
      screen.getByRole("link", { name: "Play" }).getAttribute("href"),
    ).toBe(ROUTES.LIGHTING);
  });

  it("falls back Play link to classic when lightning mode flag is disabled", () => {
    localStorage.setItem(
      CURRENT_WORDLE_MODE_STORAGE_KEY,
      WORDLE_MODE_IDS.LIGHTNING,
    );
    env.lightningModeEnabled = false;

    renderHome();

    expect(
      screen.getByRole("link", { name: "Play" }).getAttribute("href"),
    ).toBe(ROUTES.CLASSIC);
  });
});
