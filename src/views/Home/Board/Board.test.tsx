import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { TileStatus } from "../../../utils/types";
import { Board } from "./Board";

describe("Board", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders 6 rows and 30 cells", () => {
    render(<Board guesses={[]} current="" gameOver={false} />);

    expect(screen.getAllByRole("row").length).toBe(6);
    expect(screen.getAllByRole("gridcell").length).toBe(30);
  });

  it("shows a played guess and the current typing row", () => {
    const correct: TileStatus[] = [
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ];

    render(
      <Board
        guesses={[{ word: "APPLE", statuses: correct }]}
        current="BR"
        gameOver={false}
      />,
    );

    expect(screen.getByRole("gridcell", { name: "A, correct" })).toBeTruthy();
    expect(screen.getByRole("gridcell", { name: "B, typing" })).toBeTruthy();
    expect(screen.getByRole("gridcell", { name: "R, typing" })).toBeTruthy();
  });

  it("hides typing cells when game is over", () => {
    const absent: TileStatus[] = [
      "absent",
      "absent",
      "absent",
      "absent",
      "absent",
    ];

    render(
      <Board
        guesses={[{ word: "HOUSE", statuses: absent }]}
        current="ZZ"
        gameOver={true}
      />,
    );

    expect(screen.queryByRole("gridcell", { name: "Z, typing" })).toBeNull();
  });

  it("renders revealed colors as gray when the player loses", () => {
    const mixed: TileStatus[] = [
      "correct",
      "present",
      "absent",
      "correct",
      "present",
    ];

    render(
      <Board
        guesses={[{ word: "HOUSE", statuses: mixed }]}
        current=""
        gameOver={true}
        isLoss
      />,
    );

    expect(
      screen.getByRole("gridcell", { name: "H, correct" }).className,
    ).toContain("bg-neutral-700");
    expect(
      screen.getByRole("gridcell", { name: "O, present" }).className,
    ).toContain("bg-neutral-700");
  });

  it("adds the entry animation class when enabled", () => {
    render(<Board guesses={[]} current="" gameOver={false} animateEntry />);

    expect(screen.getByRole("grid").className).toContain(
      "board-entry-animation",
    );
  });

  it("adds staggered tile entry animation when enabled", () => {
    render(<Board guesses={[]} current="" gameOver={false} animateTileEntry />);

    const cells = screen.getAllByRole("gridcell");

    expect(cells[0].className).toContain("tile-entry-animation");
    expect(cells[0].style.animationDelay).toBe("0ms");
    expect(cells[1].style.animationDelay).toBe("16ms");
  });

  it("highlights only the current active tile", () => {
    render(<Board guesses={[]} current="AB" gameOver={false} />);

    const cells = screen.getAllByRole("gridcell");

    expect(
      cells[2].querySelector(".tile-active-border-animation"),
    ).toBeTruthy();
    expect(cells[0].querySelector(".tile-active-border-animation")).toBeNull();
    expect(cells[1].querySelector(".tile-active-border-animation")).toBeNull();
  });

  it("shows animated indicator only on the current row", () => {
    const correct: TileStatus[] = [
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ];

    render(
      <Board
        guesses={[{ word: "APPLE", statuses: correct }]}
        current="AB"
        gameOver={false}
      />,
    );

    const rows = screen.getAllByRole("row");

    expect(
      rows[1].querySelector(".row-active-indicator-animation"),
    ).toBeTruthy();
    expect(rows[0].querySelector(".row-active-indicator-animation")).toBeNull();
    expect(rows[2].querySelector(".row-active-indicator-animation")).toBeNull();
  });

  it("scales past rows to 0.95 and active row to 1.05 with transition", () => {
    const correct: TileStatus[] = [
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ];

    render(
      <Board
        guesses={[{ word: "APPLE", statuses: correct }]}
        current="AB"
        gameOver={false}
      />,
    );

    const rows = screen.getAllByRole("row");

    expect(rows[0].className).toContain("scale-[0.95]");
    expect(rows[1].className).toContain("scale-[1.05]");
    expect(rows[1].className).toContain("transition-transform");
  });
});
