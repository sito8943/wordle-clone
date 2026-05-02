import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Switcher from "./Switcher";

afterEach(cleanup);

describe("Switcher", () => {
  it("renders as checkbox and toggles through onChange", () => {
    const onChange = vi.fn();

    render(
      <>
        <label htmlFor="switcher-test">Manual tile selection</label>
        <Switcher id="switcher-test" checked={false} onChange={onChange} />
      </>,
    );

    const input = screen.getByRole("checkbox", {
      name: "Manual tile selection",
    }) as HTMLInputElement;
    expect(input.checked).toBe(false);

    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("toggles when clicking the visible switch track", () => {
    const onChange = vi.fn();
    render(
      <Switcher id="switcher-track" checked={false} onChange={onChange} />,
    );

    const input = screen.getByRole("checkbox") as HTMLInputElement;
    const track = input.nextElementSibling;
    expect(track).toBeTruthy();

    fireEvent.click(track as HTMLElement);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("forwards disabled state", () => {
    render(
      <>
        <label htmlFor="switcher-disabled">Sound enabled</label>
        <Switcher id="switcher-disabled" checked disabled />
      </>,
    );

    const input = screen.getByRole("checkbox", {
      name: "Sound enabled",
    }) as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
