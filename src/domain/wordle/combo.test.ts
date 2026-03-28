import { describe, expect, it } from "vitest";
import { getGuessCombo } from "./combo";

describe("getGuessCombo", () => {
  it("returns null when there is no guess", () => {
    expect(getGuessCombo(undefined)).toBeNull();
  });

  it("returns null when the guess has no yellow or green tiles", () => {
    expect(
      getGuessCombo({
        word: "SLATE",
        statuses: ["absent", "absent", "absent", "absent", "absent"],
      }),
    ).toBeNull();
  });

  it("returns a yellow combo when only present statuses exist", () => {
    expect(
      getGuessCombo({
        word: "SLATE",
        statuses: ["present", "absent", "present", "absent", "absent"],
      }),
    ).toEqual({
      count: 2,
      tone: "present",
    });
  });

  it("returns a green combo when at least one correct status exists", () => {
    expect(
      getGuessCombo({
        word: "APPLE",
        statuses: ["correct", "present", "absent", "correct", "absent"],
      }),
    ).toEqual({
      count: 3,
      tone: "correct",
    });
  });
});
