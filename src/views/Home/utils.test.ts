import { describe, expect, it } from "vitest";
import {
  extractNativeKeyboardLetters,
  toWordleKeyFromNativeKeyboardEvent,
} from "./utils";

describe("Home native keyboard utils", () => {
  it("maps direct action keys to wordle keys", () => {
    expect(toWordleKeyFromNativeKeyboardEvent("Enter")).toBe("ENTER");
    expect(toWordleKeyFromNativeKeyboardEvent("Backspace")).toBe("BACKSPACE");
  });

  it("maps alphabetic keys to uppercase letters", () => {
    expect(toWordleKeyFromNativeKeyboardEvent("a")).toBe("A");
    expect(toWordleKeyFromNativeKeyboardEvent("Z")).toBe("Z");
  });

  it("ignores unsupported keys", () => {
    expect(toWordleKeyFromNativeKeyboardEvent("Shift")).toBeNull();
    expect(toWordleKeyFromNativeKeyboardEvent("1")).toBeNull();
    expect(toWordleKeyFromNativeKeyboardEvent(" ")).toBeNull();
  });

  it("extracts uppercase letters from mixed native input", () => {
    expect(extractNativeKeyboardLetters("ab1-cD")).toEqual([
      "A",
      "B",
      "C",
      "D",
    ]);
    expect(extractNativeKeyboardLetters("123")).toEqual([]);
  });
});
