import { describe, expect, it } from "vitest";
import { getPointsForWin } from "./scoring";

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
