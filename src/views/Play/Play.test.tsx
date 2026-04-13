import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { env } from "@config";
import Play from "./Play";

const defaultPlayOfflineStateEnabled = env.playOfflineStateEnabled;
const defaultWordReportPhoneNumber = env.wordReportPhoneNumber;

vi.mock("./providers", () => ({
  PlayViewProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="play-provider">{children}</div>
  ),
}));

vi.mock("./sections", () => ({
  Toolbar: () => <div>Toolbar Stub</div>,
  DialogsSection: () => <div>Dialogs Stub</div>,
  BoardSection: () => <div>Board Stub</div>,
  KeyboardSection: () => <div>Keyboard Stub</div>,
}));

vi.mock("@i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dictionary: Record<string, string> = {
        "play.offlineState.badge": "Offline mode",
        "play.offlineState.title": "Game temporarily offline",
        "play.offlineState.description":
          "The game is currently offline. We are working to bring it back soon.",
        "play.offlineState.contactAction": "Stay in touch on WhatsApp",
        "play.offlineState.settingsAction": "Open settings",
      };

      return dictionary[key] ?? key;
    },
  }),
}));

const renderPlay = () =>
  render(
    <MemoryRouter>
      <Play />
    </MemoryRouter>,
  );

afterEach(() => {
  env.playOfflineStateEnabled = defaultPlayOfflineStateEnabled;
  env.wordReportPhoneNumber = defaultWordReportPhoneNumber;
  cleanup();
});

describe("Play", () => {
  it("renders only the offline state when env flag is enabled", () => {
    env.playOfflineStateEnabled = true;
    env.wordReportPhoneNumber = "+34 612 34 56 78";

    renderPlay();

    expect(screen.getByText("Game temporarily offline")).toBeTruthy();
    expect(screen.queryByText("Toolbar Stub")).toBeNull();
    expect(screen.queryByText("Board Stub")).toBeNull();
    expect(screen.queryByText("Keyboard Stub")).toBeNull();
    expect(screen.queryByTestId("play-provider")).toBeNull();

    const contactLink = screen.getByRole("link", {
      name: "Stay in touch on WhatsApp",
    });
    expect(contactLink.getAttribute("href")).toBe("https://wa.me/34612345678");
  });

  it("renders the game content when offline env flag is disabled", () => {
    env.playOfflineStateEnabled = false;

    renderPlay();

    expect(screen.getByText("Toolbar Stub")).toBeTruthy();
    expect(screen.getByText("Board Stub")).toBeTruthy();
    expect(screen.getByText("Keyboard Stub")).toBeTruthy();
    expect(screen.getByTestId("play-provider")).toBeTruthy();
    expect(screen.queryByText("Game temporarily offline")).toBeNull();
  });
});
