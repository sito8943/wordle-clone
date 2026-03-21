import {
  cleanup,
  fireEvent,
  render,
  screen,
  act,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HelpDialog from "./HelpDialog";

afterEach(cleanup);

describe("HelpDialog", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders the dialog when visible", () => {
    render(<HelpDialog visible onClose={() => undefined} />);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("does not render when visible is false", () => {
    render(<HelpDialog visible={false} onClose={() => undefined} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders the title 'How to play'", () => {
    render(<HelpDialog visible onClose={() => undefined} />);
    expect(screen.getByText("How to play")).toBeTruthy();
  });

  it("renders the description", () => {
    render(<HelpDialog visible onClose={() => undefined} />);
    expect(
      screen.getByText("Guess the hidden 5-letter word in up to 6 attempts."),
    ).toBeTruthy();
  });

  it("renders the Rules section", () => {
    render(<HelpDialog visible onClose={() => undefined} />);
    expect(screen.getByText("Rules")).toBeTruthy();
  });

  it("renders the Scoring section", () => {
    render(<HelpDialog visible onClose={() => undefined} />);
    expect(screen.getByText("Scoring")).toBeTruthy();
  });

  it("renders the insane time bonus rule", () => {
    render(<HelpDialog visible onClose={() => undefined} />);
    expect(
      screen.getByText(
        "Insane: x4 difficulty multiplier and +1 extra point per 2 seconds left.",
      ),
    ).toBeTruthy();
  });

  it("renders the streak multiplier formula", () => {
    render(<HelpDialog visible onClose={() => undefined} />);
    expect(
      screen.getByText("Streak scales your score with x(1 + 0.3 x sqrt(streak))."),
    ).toBeTruthy();
  });

  it("renders the Close button", () => {
    render(<HelpDialog visible onClose={() => undefined} />);
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });

  it("calls onClose after clicking Close and transition completes", () => {
    const onClose = vi.fn();
    render(<HelpDialog visible onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    act(() => vi.runAllTimers());

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
