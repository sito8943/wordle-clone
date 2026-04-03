import html2canvas from "html2canvas";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GuessResult } from "@domain/wordle";
import { captureVictoryBoardImageFile } from "./utils";

vi.mock("html2canvas", () => ({
  default: vi.fn(),
}));

describe("captureVictoryBoardImageFile", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back to drawing the board from guess data when html2canvas fails", async () => {
    vi.mocked(html2canvas).mockRejectedValue(
      new Error("Unsupported CSS color function."),
    );

    const fillText = vi.fn();
    const fakeContext = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      rect: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText,
      lineWidth: 0,
      textAlign: "left",
      textBaseline: "alphabetic",
      font: "",
      fillStyle: "",
      strokeStyle: "",
    } as unknown as CanvasRenderingContext2D;
    const fakeCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(fakeContext),
      toBlob: vi.fn((callback: BlobCallback | null) => {
        callback?.(new Blob(["fallback"], { type: "image/png" }));
      }),
    } as unknown as HTMLCanvasElement;
    const originalCreateElement = document.createElement.bind(document);

    vi.spyOn(document, "createElement").mockImplementation(((
      tagName: string,
      options?: ElementCreationOptions,
    ) => {
      if (tagName.toLowerCase() === "canvas") {
        return fakeCanvas as unknown as HTMLElement;
      }

      return originalCreateElement(tagName, options);
    }) as typeof document.createElement);

    const file = await captureVictoryBoardImageFile(
      document.createElement("div"),
      {
        answer: "APPLE",
        guesses: [
          {
            word: "CRANE",
            statuses: [
              "absent",
              "absent",
              "present",
              "absent",
              "absent",
            ] satisfies GuessResult["statuses"],
          },
          {
            word: "APPLE",
            statuses: [
              "correct",
              "correct",
              "correct",
              "correct",
              "correct",
            ] satisfies GuessResult["statuses"],
          },
        ],
      },
    );

    expect(file.name).toBe("wordle-board.png");
    expect(file.type).toBe("image/png");
    expect(vi.mocked(html2canvas)).toHaveBeenCalledTimes(1);
    expect(fillText).toHaveBeenCalledWith(
      "C",
      expect.any(Number),
      expect.any(Number),
    );
    expect(fillText).toHaveBeenCalledWith(
      "A",
      expect.any(Number),
      expect.any(Number),
    );
  });
});
