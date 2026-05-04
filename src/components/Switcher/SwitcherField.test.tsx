import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SwitcherField from "./SwitcherField";

afterEach(cleanup);

describe("SwitcherField", () => {
  it("renders label and description", () => {
    render(
      <SwitcherField
        id="switcher-field-test"
        checked={false}
        onChange={vi.fn()}
        label="Manual tile selection"
        description="Enable manual selection of board tiles."
      />,
    );

    expect(screen.getByText("Manual tile selection")).toBeTruthy();
    expect(
      screen.getByText("Enable manual selection of board tiles."),
    ).toBeTruthy();
  });

  it("toggles from label click", () => {
    const onChange = vi.fn();
    render(
      <SwitcherField
        id="switcher-field-toggle"
        checked={false}
        onChange={onChange}
        label="Sound"
      />,
    );

    fireEvent.click(screen.getByText("Sound"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
