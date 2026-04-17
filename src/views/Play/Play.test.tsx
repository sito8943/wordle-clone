import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { env } from "@config";
import Play from "./Play";

const defaultPlayOfflineStateEnabled = env.playOfflineStateEnabled;

vi.mock("./providers", () => ({
  PlayViewProvider: ({
    children,
    modeId,
  }: {
    children: ReactNode;
    modeId?: string;
  }) => (
    <div data-testid="play-provider" data-mode-id={modeId ?? ""}>
      {children}
    </div>
  ),
}));

vi.mock("./sections/Offline", () => ({
  PlayOfflineState: () => <div>Offline Stub</div>,
}));

vi.mock("./sections/PlayContent", () => ({
  PlayContent: () => <div>PlayContent Stub</div>,
}));

const renderPlay = (modeId?: "classic" | "lightning" | "zen" | "daily") =>
  render(
    <MemoryRouter>
      <Play modeId={modeId} />
    </MemoryRouter>,
  );

afterEach(() => {
  env.playOfflineStateEnabled = defaultPlayOfflineStateEnabled;
  cleanup();
});

describe("Play", () => {
  it("renders only the offline state when env flag is enabled", () => {
    env.playOfflineStateEnabled = true;

    renderPlay();

    expect(screen.getByText("Offline Stub")).toBeTruthy();
    expect(screen.queryByText("PlayContent Stub")).toBeNull();
    expect(screen.queryByTestId("play-provider")).toBeNull();
  });

  it("renders the game content when offline env flag is disabled", () => {
    env.playOfflineStateEnabled = false;

    renderPlay();

    expect(screen.getByText("PlayContent Stub")).toBeTruthy();
    expect(screen.getByTestId("play-provider")).toBeTruthy();
    expect(screen.queryByText("Offline Stub")).toBeNull();
  });

  it("passes modeId through PlayViewProvider", () => {
    env.playOfflineStateEnabled = false;

    renderPlay("classic");

    expect(
      screen.getByTestId("play-provider").getAttribute("data-mode-id"),
    ).toBe("classic");
  });
});
