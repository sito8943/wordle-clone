import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "./index";

describe("Dialog", () => {
  afterEach(() => {
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

    fireEvent.click(screen.getByRole("dialog", { name: "Test dialog" }).parentElement!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
