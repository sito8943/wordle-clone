import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "./index";
import {
  DIALOG_BACKDROP_EXIT_ANIMATION_CLASS,
  DIALOG_PANEL_EXIT_ANIMATION_CLASS,
} from "../ConfirmationDialog/constants";

describe("Dialog", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("renders title, description and body content", () => {
    render(
      <Dialog
        visible
        onClose={() => undefined}
        titleId="test-dialog-title"
        title="Test dialog"
        description="Dialog description"
      >
        <p>Dialog body</p>
      </Dialog>,
    );

    expect(screen.getByRole("dialog", { name: "Test dialog" })).toBeTruthy();
    expect(screen.getByText("Dialog description")).toBeTruthy();
    expect(screen.getByText("Dialog body")).toBeTruthy();
  });

  it("renders optional header action", () => {
    render(
      <Dialog
        visible
        onClose={() => undefined}
        titleId="test-dialog-title"
        title="Test dialog"
        headerAction={<button type="button">Close</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });

  it("does not render when visible is false", () => {
    render(
      <Dialog
        visible={false}
        onClose={() => undefined}
        titleId="test-dialog-title"
        title="Test dialog"
      />,
    );

    expect(screen.queryByRole("dialog", { name: "Test dialog" })).toBeNull();
  });

  it("calls onClose when clicking backdrop", () => {
    const onClose = vi.fn();
    render(
      <Dialog
        visible
        onClose={onClose}
        titleId="test-dialog-title"
        title="Test dialog"
      />,
    );

    fireEvent.click(
      screen.getByRole("dialog", { name: "Test dialog" }).parentElement!,
    );

    act(() => vi.runAllTimers());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders exit animation classes when closing is controlled externally", () => {
    render(
      <Dialog
        visible
        isClosing
        onClose={() => undefined}
        titleId="test-dialog-title"
        title="Test dialog"
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "Test dialog" });
    const backdrop = dialog.parentElement;

    expect(backdrop).not.toBeNull();
    for (const className of DIALOG_BACKDROP_EXIT_ANIMATION_CLASS.split(" ")) {
      expect(backdrop?.classList.contains(className)).toBe(true);
    }
    expect(
      dialog.classList.contains(DIALOG_PANEL_EXIT_ANIMATION_CLASS),
    ).toBe(true);
  });
});
