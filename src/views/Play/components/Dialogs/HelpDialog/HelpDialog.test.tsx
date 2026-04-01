import {
  cleanup,
  fireEvent,
  render,
  screen,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HelpDialog from "./HelpDialog";

afterEach(cleanup);

const renderHelpDialog = (
  visible = true,
  onClose: () => void = () => undefined,
) =>
  render(
    <MemoryRouter>
      <HelpDialog visible={visible} onClose={onClose} />
    </MemoryRouter>,
  );

describe("HelpDialog", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders the dialog when visible", () => {
    renderHelpDialog();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("does not render when visible is false", () => {
    renderHelpDialog(false);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders the title 'How to play'", () => {
    renderHelpDialog();
    expect(screen.getByText("How to play")).toBeTruthy();
  });

  it("renders the description", () => {
    renderHelpDialog();
    expect(
      screen.getByText("Guess the hidden 5-letter word in up to 6 attempts."),
    ).toBeTruthy();
  });

  it("renders the Rules section", () => {
    renderHelpDialog();
    expect(screen.getByText("Rules")).toBeTruthy();
  });

  it("renders the Scoring section", () => {
    renderHelpDialog();
    expect(screen.getByText("Scoring")).toBeTruthy();
  });

  it("renders the insane time bonus rule", () => {
    renderHelpDialog();
    expect(
      screen.getByText(
        "Insane: x9 difficulty multiplier and +1 extra point per 2 seconds left.",
      ),
    ).toBeTruthy();
  });

  it("renders the hard difficulty multiplier rule", () => {
    renderHelpDialog();
    expect(screen.getByText("Hard: x5 difficulty multiplier.")).toBeTruthy();
  });

  it("renders the streak multiplier formula", () => {
    renderHelpDialog();
    expect(
      screen.getByText(
        "Streak scales your score with x(1 + 0.3 x sqrt(streak)).",
      ),
    ).toBeTruthy();
  });

  it("renders a link to change difficulty settings", () => {
    renderHelpDialog();

    const difficultyLink = screen.getByRole("link", {
      name: "difficulty settings",
    });
    expect(difficultyLink.getAttribute("href")).toBe("/settings#difficulty");
  });

  it("renders the Close button", () => {
    renderHelpDialog();
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });

  it("calls onClose after clicking Close and transition completes", () => {
    const onClose = vi.fn();
    renderHelpDialog(true, onClose);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    act(() => vi.runAllTimers());

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
