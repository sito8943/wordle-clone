import { describe, expect, it } from "vitest";
import { getPointsForWin } from "./scoring";

describe("getPointsForWin", () => {
  it("returns remaining attempts before losing", () => {
    expect(getPointsForWin(1)).toBe(5);
    expect(getPointsForWin(3)).toBe(3);
    expect(getPointsForWin(6)).toBe(0);
  });

  it("never returns negative points", () => {
    expect(getPointsForWin(7)).toBe(0);
  });
});
