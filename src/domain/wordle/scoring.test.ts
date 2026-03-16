import { describe, expect, it } from "vitest";
import { getPointsForWin, getTotalPointsForWin } from "./scoring";

describe("getPointsForWin", () => {
  it("returns points based on attempts used with minimum 1 on valid wins", () => {
    expect(getPointsForWin(1)).toBe(6);
    expect(getPointsForWin(3)).toBe(4);
    expect(getPointsForWin(6)).toBe(1);
  });

  it("never returns negative points", () => {
    expect(getPointsForWin(7)).toBe(0);
  });
});

describe("getTotalPointsForWin", () => {
  it("adds difficulty and streak bonuses to base points", () => {
    expect(getTotalPointsForWin(1, 2, 1)).toBe(9);
    expect(getTotalPointsForWin(4, 3, 5)).toBe(11);
  });

  it("normalizes invalid multipliers and streak bonus values", () => {
    expect(getTotalPointsForWin(1, 0, -4)).toBe(7);
    expect(getTotalPointsForWin(1, Number.NaN, Number.NaN)).toBe(7);
  });
});
