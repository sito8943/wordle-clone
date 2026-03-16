import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Dialog } from "./index";

describe("Dialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders title, description and body content", () => {
    render(
      <Dialog
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
        titleId="test-dialog-title"
        title="Test dialog"
        headerAction={<button type="button">Close</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });
});
