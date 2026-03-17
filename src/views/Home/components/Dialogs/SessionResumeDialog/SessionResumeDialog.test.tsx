import { cleanup, fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SessionResumeDialog from "./SessionResumeDialog";

afterEach(cleanup);

describe("SessionResumeDialog", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders the dialog when visible", () => {
    render(
      <SessionResumeDialog
        visible
        onClose={() => undefined}
        onStartNew={() => undefined}
      />,
    );
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("does not render when visible is false", () => {
    render(
      <SessionResumeDialog
        visible={false}
        onClose={() => undefined}
        onStartNew={() => undefined}
      />,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders the title 'Resume previous game?'", () => {
    render(
      <SessionResumeDialog
        visible
        onClose={() => undefined}
        onStartNew={() => undefined}
      />,
    );
    expect(screen.getByText("Resume previous game?")).toBeTruthy();
  });

  it("renders the description", () => {
    render(
      <SessionResumeDialog
        visible
        onClose={() => undefined}
        onStartNew={() => undefined}
      />,
    );
    expect(
      screen.getByText(
        "We found an in-progress board from another browser tab session.",
      ),
    ).toBeTruthy();
  });

  it("renders 'Start new game' and 'Continue previous board' buttons", () => {
    render(
      <SessionResumeDialog
        visible
        onClose={() => undefined}
        onStartNew={() => undefined}
      />,
    );
    expect(screen.getByRole("button", { name: "Start new game" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Continue previous board" }),
    ).toBeTruthy();
  });

  it("calls onStartNew after clicking 'Start new game' and transition completes", () => {
    const onStartNew = vi.fn();
    render(
      <SessionResumeDialog
        visible
        onClose={() => undefined}
        onStartNew={onStartNew}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Start new game" }));
    act(() => vi.runAllTimers());

    expect(onStartNew).toHaveBeenCalledTimes(1);
  });

  it("calls onClose after clicking 'Continue previous board' and transition completes", () => {
    const onClose = vi.fn();
    render(
      <SessionResumeDialog
        visible
        onClose={onClose}
        onStartNew={() => undefined}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Continue previous board" }),
    );
    act(() => vi.runAllTimers());

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
