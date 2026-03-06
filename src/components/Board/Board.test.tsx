import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { TileStatus } from "../../utils/checker";
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
    const absent: TileStatus[] = ["absent", "absent", "absent", "absent", "absent"];

    render(
      <Board
        guesses={[{ word: "HOUSE", statuses: absent }]}
        current="ZZ"
        gameOver={true}
      />,
    );

    expect(screen.queryByRole("gridcell", { name: "Z, typing" })).toBeNull();
  });
});
