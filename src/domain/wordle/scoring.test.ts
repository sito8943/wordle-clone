import { describe, expect, it } from "vitest";
import {
  getInsaneTimeBonus,
  getPointsForWin,
  getTotalPointsForWin,
} from "./scoring";

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

  it("adds a time bonus when provided", () => {
    expect(getTotalPointsForWin(3, 4, 2, 5)).toBe(15);
  });

  it("normalizes invalid multipliers and streak bonus values", () => {
    expect(getTotalPointsForWin(1, 0, -4)).toBe(7);
    expect(getTotalPointsForWin(1, Number.NaN, Number.NaN)).toBe(7);
  });
});

describe("getInsaneTimeBonus", () => {
  it("grants 1 point for every 2 seconds remaining", () => {
    expect(getInsaneTimeBonus(10)).toBe(5);
    expect(getInsaneTimeBonus(11)).toBe(5);
  });

  it("returns 0 when there are 0 or 1 seconds left", () => {
    expect(getInsaneTimeBonus(0)).toBe(0);
    expect(getInsaneTimeBonus(1)).toBe(0);
  });
});
