import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { env } from "@config";
import Play from "./Play";

const defaultPlayOfflineStateEnabled = env.playOfflineStateEnabled;

vi.mock("./providers", () => ({
  PlayViewProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="play-provider">{children}</div>
  ),
}));

vi.mock("./sections/Offline", () => ({
  PlayOfflineState: () => <div>Offline Stub</div>,
}));

vi.mock("./sections/PlayContent", () => ({
  PlayContent: () => <div>PlayContent Stub</div>,
}));

const renderPlay = () =>
  render(
    <MemoryRouter>
      <Play />
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
});
