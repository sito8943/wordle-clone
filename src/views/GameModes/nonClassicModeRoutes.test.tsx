import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WORDLE_MODE_IDS } from "@domain/wordle";
import Daily from "./Daily";
import Lightning from "./Lightning";
import Zen from "./Zen";

vi.mock("@views/Play", () => ({
  default: ({ modeId }: { modeId?: string }) => (
    <div data-testid="play-route" data-mode-id={modeId ?? ""} />
  ),
}));

const getRenderedModeId = () =>
  screen.getByTestId("play-route").getAttribute("data-mode-id");

afterEach(cleanup);

describe("non-classic mode routes", () => {
  it("routes zen to Play with zen mode id", () => {
    render(<Zen />);

    expect(getRenderedModeId()).toBe(WORDLE_MODE_IDS.ZEN);
  });

  it("routes lightning to Play with lightning mode id", () => {
    render(<Lightning />);

    expect(getRenderedModeId()).toBe(WORDLE_MODE_IDS.LIGHTNING);
  });

  it("routes daily to Play with daily mode id", () => {
    render(<Daily />);

    expect(getRenderedModeId()).toBe(WORDLE_MODE_IDS.DAILY);
  });
});
