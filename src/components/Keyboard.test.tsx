import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TileStatus } from "../utils/checker";
import { Keyboard } from "./Keyboard";

describe("Keyboard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the keyboard with expected keys", () => {
    render(<Keyboard guesses={[]} onKey={vi.fn()} />);

    expect(
      screen.getByRole("group", { name: "On-screen keyboard" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Submit guess" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Delete letter" })).toBeTruthy();
    expect(screen.getAllByRole("button").length).toBe(28);
  });

  it("calls onKey with clicked values", () => {
    const onKey = vi.fn();
    render(<Keyboard guesses={[]} onKey={onKey} />);

    fireEvent.click(screen.getByRole("button", { name: "Letter A" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit guess" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete letter" }));

    expect(onKey).toHaveBeenNthCalledWith(1, "A");
    expect(onKey).toHaveBeenNthCalledWith(2, "ENTER");
    expect(onKey).toHaveBeenNthCalledWith(3, "BACKSPACE");
  });

  it("keeps the highest priority style for a key across guesses", () => {
    const absent: TileStatus[] = [
      "absent",
      "absent",
      "absent",
      "absent",
      "absent",
    ];
    const withCorrectA: TileStatus[] = [
      "correct",
      "absent",
      "absent",
      "absent",
      "absent",
    ];

    render(
      <Keyboard
        guesses={[
          { word: "ALERT", statuses: absent },
          { word: "APPLE", statuses: withCorrectA },
        ]}
        onKey={vi.fn()}
      />,
    );

    const aKey = screen.getByRole("button", { name: "Letter A" });
    expect(aKey.className).toContain("bg-black");
  });

  it("adds the entry animation class when enabled", () => {
    render(<Keyboard guesses={[]} onKey={vi.fn()} animateEntry />);

    expect(
      screen.getByRole("group", { name: "On-screen keyboard" }).className,
    ).toContain("keyboard-entry-animation");
  });
});
