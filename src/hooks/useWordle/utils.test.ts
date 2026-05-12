import { describe, expect, it } from "vitest";
import { resolveHintRevealStatus } from "./utils";

describe("resolveHintRevealStatus", () => {
  it("keeps correct hints as correct", () => {
    expect(resolveHintRevealStatus("correct", "A", "A")).toBe("correct");
    expect(resolveHintRevealStatus("correct", "B", "A")).toBe("correct");
  });

  it("upgrades a present hint to correct when the revealed letter matches the answer slot", () => {
    expect(resolveHintRevealStatus("present", "A", "A")).toBe("correct");
  });

  it("keeps a present hint as present when the revealed letter does not match the answer slot", () => {
    expect(resolveHintRevealStatus("present", "A", "B")).toBe("present");
  });
});
