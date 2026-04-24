import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WORDLE_MODE_IDS } from "@domain/wordle";
import type { ReactElement } from "react";
import Daily from "./Daily";
import Lightning from "./Lightning";
import Zen from "./Zen";

const createReadyDailyRequirementsState = () => ({
  status: "ready" as const,
  isLoading: false,
  isReady: true,
  isUnavailable: false,
  dailyWord: "APPLE",
  dailyMeaning: "A fruit.",
  reload: vi.fn(),
});

const mockUseDailyModePrerequisites = vi
  .fn()
  .mockReturnValue(createReadyDailyRequirementsState());

vi.mock("@hooks/useDailyModePrerequisites", () => ({
  useDailyModePrerequisites: () => mockUseDailyModePrerequisites(),
}));

vi.mock("@views/Play", () => ({
  default: ({ modeId }: { modeId?: string }) => (
    <div data-testid="play-route" data-mode-id={modeId ?? ""} />
  ),
}));

const getRenderedModeId = () =>
  screen.getByTestId("play-route").getAttribute("data-mode-id");
const renderRoute = (ui: ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

afterEach(cleanup);
beforeEach(() => {
  mockUseDailyModePrerequisites.mockReturnValue(
    createReadyDailyRequirementsState(),
  );
});

describe("non-classic mode routes", () => {
  it("routes zen to Play with zen mode id", () => {
    renderRoute(<Zen />);

    expect(getRenderedModeId()).toBe(WORDLE_MODE_IDS.ZEN);
  });

  it("routes lightning to Play with lightning mode id", () => {
    renderRoute(<Lightning />);

    expect(getRenderedModeId()).toBe(WORDLE_MODE_IDS.LIGHTNING);
  });

  it("routes daily to Play with daily mode id", () => {
    renderRoute(<Daily />);

    expect(getRenderedModeId()).toBe(WORDLE_MODE_IDS.DAILY);
  });

  it("blocks daily route when required daily data is unavailable", () => {
    mockUseDailyModePrerequisites.mockReturnValue({
      status: "unavailable",
      isLoading: false,
      isReady: false,
      isUnavailable: true,
      dailyWord: null,
      dailyMeaning: null,
      reload: vi.fn(),
    });

    renderRoute(<Daily />);

    expect(screen.queryByTestId("play-route")).toBeNull();
    expect(screen.getByTestId("play-mode-gate-placeholder")).toBeTruthy();
  });
});
