import {
  cleanup,
  fireEvent,
  render,
  screen,
  act,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ConfirmationDialog from "./ConfirmationDialog";

afterEach(cleanup);

const defaultProps = {
  visible: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  title: "Are you sure?",
  description: "This action cannot be undone.",
  confirmActionLabel: "Confirm",
  cancelActionLabel: "Cancel",
  dialogTitleId: "confirm-dialog-title",
};

describe("ConfirmationDialog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    defaultProps.onClose = vi.fn();
    defaultProps.onConfirm = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the dialog when visible is true", () => {
    render(<ConfirmationDialog {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("does not render the dialog when visible is false", () => {
    render(<ConfirmationDialog {...defaultProps} visible={false} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders the title", () => {
    render(<ConfirmationDialog {...defaultProps} />);
    expect(screen.getByText("Are you sure?")).toBeTruthy();
  });

  it("renders the description", () => {
    render(<ConfirmationDialog {...defaultProps} />);
    expect(screen.getByText("This action cannot be undone.")).toBeTruthy();
  });

  it("renders the confirm button with correct label", () => {
    render(<ConfirmationDialog {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Confirm" })).toBeTruthy();
  });

  it("renders the cancel button with correct label", () => {
    render(<ConfirmationDialog {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
  });

  it("calls onConfirm after clicking Confirm and transition completes", () => {
    render(<ConfirmationDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    act(() => {
      vi.runAllTimers();
    });

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onClose after clicking Cancel and transition completes", () => {
    render(<ConfirmationDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    act(() => {
      vi.runAllTimers();
    });

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("disables buttons during the closing transition", () => {
    render(<ConfirmationDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    // During transition, buttons should be disabled
    expect(screen.getByRole("button", { name: "Confirm" })).toHaveProperty(
      "disabled",
      true,
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveProperty(
      "disabled",
      true,
    );
  });
});
