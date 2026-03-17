import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DifficultyChangeDialog from "./DifficultyChangeDialog";

describe("DifficultyChangeDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not render when not visible", () => {
    render(
      <DifficultyChangeDialog
        visible={false}
        pendingDifficultyLabel="Hard"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog", { name: "Change difficulty?" })).toBe(
      null,
    );
  });

  it("renders pending difficulty and confirms change", async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <DifficultyChangeDialog
        visible
        pendingDifficultyLabel="Hard"
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    expect(
      screen.getByText("New difficulty: Hard.", { exact: false }),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Yes, change and restart" }),
    );

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
