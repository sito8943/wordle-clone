import { afterEach, describe, expect, it, vi } from "vitest";
import { WORDLE_MODE_IDS, type GuessResult } from "@domain/wordle";
import { PLAY_BOARD_SHARE_CAPTURE_ID } from "@views/Play/constants";
import { TUTORIAL_PROMPT_SEEN_MODES_STORAGE_KEY } from "./constants";
import {
  captureVictoryBoardImageFile,
  isMusicChannelEnabled,
  hasSeenTutorialPromptForMode,
  getVictoryBoardShareCaptureElement,
  markTutorialPromptAsSeenForMode,
  resolveModeMusicTrack,
} from "./utils";

const html2canvasMock = vi.hoisted(() => vi.fn());

vi.mock("html2canvas", () => ({
  default: html2canvasMock,
}));

describe("tutorial prompt visibility by mode", () => {
  afterEach(() => {
    window.localStorage.removeItem(TUTORIAL_PROMPT_SEEN_MODES_STORAGE_KEY);
  });

  it("tracks tutorial visibility independently for each mode", () => {
    expect(hasSeenTutorialPromptForMode(WORDLE_MODE_IDS.CLASSIC)).toBe(false);
    expect(hasSeenTutorialPromptForMode(WORDLE_MODE_IDS.LIGHTNING)).toBe(false);

    markTutorialPromptAsSeenForMode(WORDLE_MODE_IDS.CLASSIC);

    expect(hasSeenTutorialPromptForMode(WORDLE_MODE_IDS.CLASSIC)).toBe(true);
    expect(hasSeenTutorialPromptForMode(WORDLE_MODE_IDS.LIGHTNING)).toBe(false);

    markTutorialPromptAsSeenForMode(WORDLE_MODE_IDS.LIGHTNING);

    expect(hasSeenTutorialPromptForMode(WORDLE_MODE_IDS.CLASSIC)).toBe(true);
    expect(hasSeenTutorialPromptForMode(WORDLE_MODE_IDS.LIGHTNING)).toBe(true);
  });

  it("keeps backward compatibility with legacy global tutorial flag for classic only", () => {
    expect(hasSeenTutorialPromptForMode(WORDLE_MODE_IDS.CLASSIC, false)).toBe(
      true,
    );
    expect(hasSeenTutorialPromptForMode(WORDLE_MODE_IDS.CLASSIC, true)).toBe(
      true,
    );
    expect(hasSeenTutorialPromptForMode(WORDLE_MODE_IDS.LIGHTNING, true)).toBe(
      false,
    );
  });

  it("considers backend profile seen modes when local storage is empty", () => {
    expect(
      hasSeenTutorialPromptForMode(WORDLE_MODE_IDS.ZEN, undefined, {
        zen: true,
      }),
    ).toBe(true);
    expect(
      hasSeenTutorialPromptForMode(WORDLE_MODE_IDS.DAILY, undefined, {
        classic: true,
      }),
    ).toBe(false);
  });

  it("does not infer classic as seen from legacy flag when mode-scoped profile visibility exists", () => {
    expect(
      hasSeenTutorialPromptForMode(WORDLE_MODE_IDS.CLASSIC, false, {
        lightning: true,
        daily: true,
      }),
    ).toBe(false);
  });
});

describe("resolveModeMusicTrack", () => {
  it("returns classic for classic and daily", () => {
    expect(resolveModeMusicTrack(WORDLE_MODE_IDS.CLASSIC)).toBe("classic");
    expect(resolveModeMusicTrack(WORDLE_MODE_IDS.DAILY)).toBe("classic");
  });

  it("returns lightning for lightning mode", () => {
    expect(resolveModeMusicTrack(WORDLE_MODE_IDS.LIGHTNING)).toBe("lightning");
  });

  it("returns zen for zen mode", () => {
    expect(resolveModeMusicTrack(WORDLE_MODE_IDS.ZEN)).toBe("zen");
  });
});

describe("isMusicChannelEnabled", () => {
  it("returns true when no music channel is present", () => {
    expect(
      isMusicChannelEnabled(
        [
          {
            id: "master",
            label: "Master",
            kind: "master",
            enabled: true,
            volume: 100,
            muted: false,
          },
        ],
        "music",
      ),
    ).toBe(true);
  });

  it("uses channel id match first", () => {
    expect(
      isMusicChannelEnabled(
        [
          {
            id: "music",
            label: "Music",
            kind: "custom",
            enabled: false,
            volume: 100,
            muted: false,
          },
        ],
        "music",
      ),
    ).toBe(false);
  });

  it("falls back to kind match when id differs", () => {
    expect(
      isMusicChannelEnabled(
        [
          {
            id: "background-track",
            label: "Background",
            kind: "music",
            enabled: false,
            volume: 100,
            muted: false,
          },
        ],
        "music",
      ),
    ).toBe(false);
  });
});

describe("captureVictoryBoardImageFile", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    html2canvasMock.mockReset();
    document.body.innerHTML = "";
  });

  it("falls back to drawing the board from guess data when html2canvas fails", async () => {
    html2canvasMock.mockRejectedValue(
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
    expect(html2canvasMock).toHaveBeenCalledTimes(1);
    expect(html2canvasMock).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.objectContaining({
        scale: 2,
      }),
    );
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

  it("uses the configured board dimensions in the fallback canvas", async () => {
    html2canvasMock.mockRejectedValue(new Error("capture failed"));

    const fakeContext = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      rect: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
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

    await captureVictoryBoardImageFile(document.createElement("div"), {
      answer: "PLAY",
      roundConfig: { lettersPerRow: 4, maxGuesses: 2 },
      guesses: [
        {
          word: "PLAN",
          statuses: [
            "correct",
            "absent",
            "present",
            "absent",
          ] satisfies GuessResult["statuses"],
        },
      ],
    });

    expect(fakeCanvas.width).toBe(280);
    expect(fakeCanvas.height).toBe(152);
  });
});

describe("getVictoryBoardShareCaptureElement", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("prefers the play section with id board", () => {
    const boardSection = document.createElement("section");
    boardSection.id = "board";
    const boardGrid = document.createElement("div");
    boardGrid.id = PLAY_BOARD_SHARE_CAPTURE_ID;
    document.body.append(boardSection, boardGrid);

    expect(getVictoryBoardShareCaptureElement()).toBe(boardSection);
  });

  it("falls back to the board grid capture id when section board is missing", () => {
    const boardGrid = document.createElement("div");
    boardGrid.id = PLAY_BOARD_SHARE_CAPTURE_ID;
    document.body.append(boardGrid);

    expect(getVictoryBoardShareCaptureElement()).toBe(boardGrid);
  });
});
