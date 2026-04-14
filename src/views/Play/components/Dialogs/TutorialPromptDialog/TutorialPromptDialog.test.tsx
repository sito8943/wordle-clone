import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TutorialPromptDialog from "./TutorialPromptDialog";

afterEach(cleanup);

describe("TutorialPromptDialog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the tutorial confirmation copy", () => {
    render(
      <TutorialPromptDialog
        visible
        onClose={() => undefined}
        onConfirm={() => undefined}
        gameMode="Classic"
      />,
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Welcome to Classic")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Yes, open Help" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "No, skip tutorial" }),
    ).toBeTruthy();
  });

  it("calls onConfirm when accepting", () => {
    const onConfirm = vi.fn();
    render(
      <TutorialPromptDialog
        visible
        onClose={() => undefined}
        onConfirm={onConfirm}
        gameMode="Classic"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Yes, open Help" }));
    act(() => {
      vi.runAllTimers();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when declining", () => {
    const onClose = vi.fn();
    render(
      <TutorialPromptDialog
        visible
        onClose={onClose}
        onConfirm={() => undefined}
        gameMode="Classic"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "No, skip tutorial" }));
    act(() => {
      vi.runAllTimers();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
