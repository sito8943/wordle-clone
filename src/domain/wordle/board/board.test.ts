import { describe, expect, it } from "vitest";
import { buildBoardRows } from "./board";
import { BOARD_COLUMNS, BOARD_ROWS } from "./constants";
import type { GuessResult } from "../types";

const makeGuess = (
  word: string,
  statuses?: GuessResult["statuses"],
): GuessResult => ({
  word,
  statuses:
    statuses ??
    (Array(BOARD_COLUMNS).fill("absent") as GuessResult["statuses"]),
});

describe("buildBoardRows", () => {
  it("supports custom round dimensions", () => {
    const rows = buildBoardRows([], "", false, {
      maxGuesses: 2,
      lettersPerRow: 3,
    });

    expect(rows).toHaveLength(2);
    expect(rows[0].letters).toEqual(["", "", ""]);
    expect(rows[1].statuses).toEqual(["empty", "empty", "empty"]);
  });

  it("returns exactly BOARD_ROWS rows", () => {
    const rows = buildBoardRows([], "", false);
    expect(rows).toHaveLength(BOARD_ROWS);
  });

  it("fills past guesses correctly", () => {
    const guess = makeGuess("CRANE", [
      "correct",
      "absent",
      "present",
      "absent",
      "correct",
    ]);
    const rows = buildBoardRows([guess], "", false);

    expect(rows[0].letters).toEqual(["C", "R", "A", "N", "E"]);
    expect(rows[0].statuses).toEqual([
      "correct",
      "absent",
      "present",
      "absent",
      "correct",
    ]);
  });

  it("fills current input row with tbd/empty statuses", () => {
    const rows = buildBoardRows([], "CRA", false);

    expect(rows[0].letters).toEqual(["C", "R", "A", "", ""]);
    expect(rows[0].statuses[0]).toBe("tbd");
    expect(rows[0].statuses[1]).toBe("tbd");
    expect(rows[0].statuses[2]).toBe("tbd");
    expect(rows[0].statuses[3]).toBe("empty");
    expect(rows[0].statuses[4]).toBe("empty");
  });

  it("clips current input to the configured letters per row", () => {
    const rows = buildBoardRows([], "ABCD", false, {
      maxGuesses: 3,
      lettersPerRow: 3,
    });

    expect(rows[0].letters).toEqual(["A", "B", "C"]);
    expect(rows[0].statuses).toEqual(["tbd", "tbd", "tbd"]);
  });

  it("current row is the row after the last guess", () => {
    const guess = makeGuess("CRANE");
    const rows = buildBoardRows([guess], "AB", false);

    // Row 0 is the past guess
    expect(rows[0].letters).toEqual(["C", "R", "A", "N", "E"]);
    // Row 1 is current input
    expect(rows[1].letters[0]).toBe("A");
    expect(rows[1].letters[1]).toBe("B");
  });

  it("does not show current input row when gameOver is true", () => {
    const rows = buildBoardRows([], "CRANE", true);

    // Row 0 should be empty (no active row when game is over)
    expect(rows[0].letters).toEqual(["", "", "", "", ""]);
    expect(rows[0].statuses).toEqual([
      "empty",
      "empty",
      "empty",
      "empty",
      "empty",
    ]);
  });

  it("fills remaining rows with empty letters and statuses", () => {
    const guess = makeGuess("CRANE");
    const rows = buildBoardRows([guess], "", false);

    // Rows 2–5 should be empty
    for (let i = 2; i < BOARD_ROWS; i++) {
      expect(rows[i].letters).toEqual(["", "", "", "", ""]);
      expect(rows[i].statuses).toEqual([
        "empty",
        "empty",
        "empty",
        "empty",
        "empty",
      ]);
    }
  });

  it("handles a full board with 6 guesses and gameOver", () => {
    const guesses = Array.from({ length: BOARD_ROWS }, (_, i) =>
      makeGuess(`WORD${i}`.slice(0, 5)),
    );
    const rows = buildBoardRows(guesses, "", true);

    expect(rows).toHaveLength(BOARD_ROWS);
    rows.forEach((row, i) => {
      expect(row.letters).toEqual(guesses[i].word.split(""));
    });
  });
});
