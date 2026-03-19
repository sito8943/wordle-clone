import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { i18n } from "@i18n";
import type { TileStatus } from "@utils/types";
import { Keyboard } from ".";

describe("Keyboard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the keyboard with expected keys", () => {
    render(<Keyboard guesses={[]} onKey={vi.fn()} />);

    expect(
      screen.getByRole("group", {
        name: i18n.t("home.gameplay.onScreenKeyboardAriaLabel"),
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: i18n.t("home.gameplay.keys.letter", { key: "A" }),
      }).className,
    ).toContain("active:scale-[0.97]");
    expect(
      screen.getByRole("button", {
        name: i18n.t("home.gameplay.keys.submitGuess"),
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: i18n.t("home.gameplay.keys.deleteLetter"),
      }),
    ).toBeTruthy();
    expect(screen.getAllByRole("button").length).toBe(28);
  });

  it("calls onKey with clicked values", () => {
    const onKey = vi.fn();
    render(<Keyboard guesses={[]} onKey={onKey} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: i18n.t("home.gameplay.keys.letter", { key: "A" }),
      }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: i18n.t("home.gameplay.keys.submitGuess"),
      }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: i18n.t("home.gameplay.keys.deleteLetter"),
      }),
    );

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

    const aKey = screen.getByRole("button", {
      name: i18n.t("home.gameplay.keys.letter", { key: "A" }),
    });
    expect(aKey.className).toContain("bg-green-700");
  });

  it("renders revealed keys in gray when the player loses", () => {
    const statuses: TileStatus[] = [
      "correct",
      "present",
      "absent",
      "absent",
      "absent",
    ];

    render(
      <Keyboard
        guesses={[{ word: "ALERT", statuses }]}
        onKey={vi.fn()}
        isLoss
      />,
    );

    const aKey = screen.getByRole("button", {
      name: i18n.t("home.gameplay.keys.letter", { key: "A" }),
    });
    const lKey = screen.getByRole("button", {
      name: i18n.t("home.gameplay.keys.letter", { key: "L" }),
    });

    expect(aKey.className).toContain("bg-neutral-500");
    expect(aKey.className).not.toContain("bg-green-700");
    expect(lKey.className).toContain("bg-neutral-500");
  });

  it("adds the entry animation class when enabled", () => {
    render(<Keyboard guesses={[]} onKey={vi.fn()} animateEntry />);

    expect(
      screen.getByRole("group", {
        name: i18n.t("home.gameplay.onScreenKeyboardAriaLabel"),
      }).className,
    ).toContain("keyboard-entry-animation");
  });

  it("calls onEntryAnimationEnd when keyboard entry animation ends", () => {
    const onEntryAnimationEnd = vi.fn();
    render(
      <Keyboard
        guesses={[]}
        onKey={vi.fn()}
        animateEntry
        onEntryAnimationEnd={onEntryAnimationEnd}
      />,
    );

    fireEvent.animationEnd(
      screen.getByRole("group", {
        name: i18n.t("home.gameplay.onScreenKeyboardAriaLabel"),
      }),
    );

    expect(onEntryAnimationEnd).toHaveBeenCalledTimes(1);
  });
});
