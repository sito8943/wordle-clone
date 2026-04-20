import html2canvas from "html2canvas";
import {
  resolveBoardRoundConfig,
  WORDLE_MODE_IDS,
  type WordleModeId,
} from "@domain/wordle";
import { PLAY_BOARD_SHARE_CAPTURE_ID } from "@views/Play/constants";
import {
  END_OF_GAME_DIALOG_SEEN_SESSION_STORAGE_KEY,
  HARD_MODE_CLOCK_BOOST_SCALES,
  HARD_MODE_CLOCK_BOOST_THRESHOLDS,
  HARD_MODE_FINAL_STRETCH_SECONDS,
  HARD_MODE_TIMER_STORAGE_KEY,
  HARD_MODE_TOTAL_SECONDS,
  TUTORIAL_PROMPT_SEEN_MODES_STORAGE_KEY,
  VICTORY_BOARD_SHARE_FILE_NAME,
} from "./constants";
import type {
  HardModeTimerSnapshot,
  VictoryBoardShareCaptureSnapshot,
} from "./types";

const resolveHardModeTimerStorageKey = (modeId: WordleModeId): string =>
  modeId === WORDLE_MODE_IDS.CLASSIC
    ? HARD_MODE_TIMER_STORAGE_KEY
    : `${HARD_MODE_TIMER_STORAGE_KEY}:${modeId}`;

const isHardModeTimerSnapshot = (
  value: unknown,
): value is HardModeTimerSnapshot => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybe = value as Partial<HardModeTimerSnapshot>;
  return (
    typeof maybe.sessionId === "string" &&
    typeof maybe.secondsLeft === "number" &&
    typeof maybe.timerStarted === "boolean"
  );
};

const readHardModeTimerSnapshot = (
  modeId: WordleModeId,
): HardModeTimerSnapshot | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(resolveHardModeTimerStorageKey(modeId));
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return isHardModeTimerSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const getTileStatusSoundEvent = (
  status: unknown,
): "tile_correct" | "tile_present" | "tile_absent" | null => {
  if (status === "correct") {
    return "tile_correct";
  }

  if (status === "present") {
    return "tile_present";
  }

  if (status === "absent") {
    return "tile_absent";
  }

  return null;
};

export const getGuessWords = (guesses: unknown[]): string[] =>
  guesses.reduce<string[]>((words, guess) => {
    if (typeof guess === "string") {
      words.push(guess);
      return words;
    }

    if (!guess || typeof guess !== "object") {
      return words;
    }

    const maybeWord = (guess as { word?: unknown }).word;

    if (typeof maybeWord === "string") {
      words.push(maybeWord);
    }

    return words;
  }, []);

export const getHardModeClockBoostScale = (secondsLeft: number): number => {
  if (secondsLeft <= HARD_MODE_FINAL_STRETCH_SECONDS) {
    return HARD_MODE_CLOCK_BOOST_SCALES[0];
  }

  if (secondsLeft <= HARD_MODE_CLOCK_BOOST_THRESHOLDS[0]) {
    return HARD_MODE_CLOCK_BOOST_SCALES[1];
  }

  if (secondsLeft <= HARD_MODE_CLOCK_BOOST_THRESHOLDS[1]) {
    return HARD_MODE_CLOCK_BOOST_SCALES[2];
  }

  return HARD_MODE_CLOCK_BOOST_SCALES[3];
};

export const getHardModeFinalStretchProgressPercent = (
  secondsLeft: number,
): number =>
  Math.max(
    0,
    Math.min(100, (secondsLeft / HARD_MODE_FINAL_STRETCH_SECONDS) * 100),
  );

export const isWithinHardModeFinalStretch = (secondsLeft: number): boolean =>
  secondsLeft <= HARD_MODE_FINAL_STRETCH_SECONDS &&
  secondsLeft <= HARD_MODE_TOTAL_SECONDS;

export const getDefaultHardModeTimerSnapshot = (
  sessionId: string,
): HardModeTimerSnapshot => ({
  sessionId,
  secondsLeft: HARD_MODE_TOTAL_SECONDS,
  timerStarted: false,
});

export const getInitialHardModeTimerSnapshot = (
  sessionId: string,
  hardModeEnabled: boolean,
  hasActiveGame: boolean,
  modeId: WordleModeId,
): HardModeTimerSnapshot => {
  if (hardModeEnabled && hasActiveGame) {
    const persisted = readHardModeTimerSnapshot(modeId);
    if (persisted) {
      return { ...persisted, sessionId };
    }
  }

  return getDefaultHardModeTimerSnapshot(sessionId);
};

export const clearHardModeTimerSnapshot = (modeId: WordleModeId): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(resolveHardModeTimerStorageKey(modeId));
  } catch {
    // Ignore storage remove errors.
  }
};

export const setHardModeTimerSnapshot = (
  snapshot: HardModeTimerSnapshot,
  modeId: WordleModeId,
): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      resolveHardModeTimerStorageKey(modeId),
      JSON.stringify(snapshot),
    );
  } catch {
    // Ignore storage write errors.
  }
};

export const hasSeenEndOfGameDialogInSession = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.sessionStorage.getItem(
      END_OF_GAME_DIALOG_SEEN_SESSION_STORAGE_KEY,
    ) === "seen"
  );
};

export const markEndOfGameDialogAsSeenInSession = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    END_OF_GAME_DIALOG_SEEN_SESSION_STORAGE_KEY,
    "seen",
  );
};

type TutorialPromptSeenModes = Partial<Record<WordleModeId, boolean>>;

const toTutorialPromptSeenModes = (
  value: unknown,
): TutorialPromptSeenModes | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const maybeModes = value as Partial<Record<WordleModeId, unknown>>;
  const modes: TutorialPromptSeenModes = {};

  (Object.values(WORDLE_MODE_IDS) as WordleModeId[]).forEach((modeId) => {
    if (maybeModes[modeId] === true) {
      modes[modeId] = true;
    }
  });

  return modes;
};

const readTutorialPromptSeenModes = (): TutorialPromptSeenModes => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(
      TUTORIAL_PROMPT_SEEN_MODES_STORAGE_KEY,
    );
    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);
    return toTutorialPromptSeenModes(parsed) ?? {};
  } catch {
    return {};
  }
};

export const hasSeenTutorialPromptForMode = (
  modeId: WordleModeId,
  legacyDeclinedTutorial?: boolean,
): boolean => {
  const seenModes = readTutorialPromptSeenModes();

  if (seenModes[modeId] === true) {
    return true;
  }

  // Backward compatibility: old versions tracked a single global tutorial flag.
  return (
    modeId === WORDLE_MODE_IDS.CLASSIC &&
    typeof legacyDeclinedTutorial === "boolean"
  );
};

export const markTutorialPromptAsSeenForMode = (modeId: WordleModeId): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const seenModes = readTutorialPromptSeenModes();
    if (seenModes[modeId] === true) {
      return;
    }

    window.localStorage.setItem(
      TUTORIAL_PROMPT_SEEN_MODES_STORAGE_KEY,
      JSON.stringify({ ...seenModes, [modeId]: true }),
    );
  } catch {
    // Ignore storage write errors.
  }
};

const canvasToPngBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Unable to generate board image blob."));
        return;
      }

      resolve(blob);
    }, "image/png");
  });

const VICTORY_BOARD_SHARE_TILE_SIZE_PX = 56;
const VICTORY_BOARD_SHARE_TILE_GAP_PX = 8;
const VICTORY_BOARD_SHARE_PADDING_PX = 16;
const VICTORY_BOARD_SHARE_TILE_BORDER_WIDTH_PX = 2;
const VICTORY_BOARD_SHARE_TILE_RADIUS_PX = 10;

const VICTORY_BOARD_SHARE_TILE_COLORS = {
  correct: {
    fill: "#22c55e",
    border: "#16a34a",
    text: "#f8fafc",
  },
  present: {
    fill: "#eab308",
    border: "#ca8a04",
    text: "#172554",
  },
  absent: {
    fill: "#737373",
    border: "#525252",
    text: "#f8fafc",
  },
  empty: {
    fill: "#f5f5f5",
    border: "#a3a3a3",
    text: "#171717",
  },
} as const;

const createVictoryBoardImageFile = (blob: Blob): File =>
  new File([blob], VICTORY_BOARD_SHARE_FILE_NAME, {
    type: "image/png",
  });

const getVictoryBoardSnapshotTileStatus = (
  snapshot: VictoryBoardShareCaptureSnapshot,
  rowIndex: number,
  columnIndex: number,
): keyof typeof VICTORY_BOARD_SHARE_TILE_COLORS => {
  const guess = snapshot.guesses[rowIndex];

  if (!guess) {
    return "empty";
  }

  const status = guess.statuses[columnIndex];

  if (status === "correct" || status === "present" || status === "absent") {
    return status;
  }

  return "empty";
};

const getVictoryBoardSnapshotTileLetter = (
  snapshot: VictoryBoardShareCaptureSnapshot,
  rowIndex: number,
  columnIndex: number,
): string => {
  const guess = snapshot.guesses[rowIndex];

  if (!guess) {
    return "";
  }

  const letter = guess.word[columnIndex];
  return typeof letter === "string" ? letter.toUpperCase() : "";
};

const drawRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void => {
  context.beginPath();

  if (typeof context.roundRect === "function") {
    context.roundRect(x, y, width, height, radius);
  } else {
    context.rect(x, y, width, height);
  }

  context.closePath();
};

const renderVictoryBoardFallbackCanvas = (
  snapshot: VictoryBoardShareCaptureSnapshot,
): HTMLCanvasElement => {
  if (typeof document === "undefined") {
    throw new Error("Document is not available.");
  }

  const canvas = document.createElement("canvas");
  const { lettersPerRow, maxGuesses } = resolveBoardRoundConfig(
    snapshot.roundConfig,
  );
  const boardWidth =
    lettersPerRow * VICTORY_BOARD_SHARE_TILE_SIZE_PX +
    (lettersPerRow - 1) * VICTORY_BOARD_SHARE_TILE_GAP_PX +
    VICTORY_BOARD_SHARE_PADDING_PX * 2;
  const boardHeight =
    maxGuesses * VICTORY_BOARD_SHARE_TILE_SIZE_PX +
    (maxGuesses - 1) * VICTORY_BOARD_SHARE_TILE_GAP_PX +
    VICTORY_BOARD_SHARE_PADDING_PX * 2;

  canvas.width = boardWidth;
  canvas.height = boardHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to get board image drawing context.");
  }

  context.clearRect(0, 0, boardWidth, boardHeight);
  context.lineWidth = VICTORY_BOARD_SHARE_TILE_BORDER_WIDTH_PX;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = '700 28px "Roboto Slab Variable", "Roboto", sans-serif';

  for (let rowIndex = 0; rowIndex < maxGuesses; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < lettersPerRow; columnIndex += 1) {
      const x =
        VICTORY_BOARD_SHARE_PADDING_PX +
        columnIndex *
          (VICTORY_BOARD_SHARE_TILE_SIZE_PX + VICTORY_BOARD_SHARE_TILE_GAP_PX);
      const y =
        VICTORY_BOARD_SHARE_PADDING_PX +
        rowIndex *
          (VICTORY_BOARD_SHARE_TILE_SIZE_PX + VICTORY_BOARD_SHARE_TILE_GAP_PX);
      const status = getVictoryBoardSnapshotTileStatus(
        snapshot,
        rowIndex,
        columnIndex,
      );
      const colors = VICTORY_BOARD_SHARE_TILE_COLORS[status];

      drawRoundedRect(
        context,
        x,
        y,
        VICTORY_BOARD_SHARE_TILE_SIZE_PX,
        VICTORY_BOARD_SHARE_TILE_SIZE_PX,
        VICTORY_BOARD_SHARE_TILE_RADIUS_PX,
      );
      context.fillStyle = colors.fill;
      context.fill();
      context.strokeStyle = colors.border;
      context.stroke();

      const letter = getVictoryBoardSnapshotTileLetter(
        snapshot,
        rowIndex,
        columnIndex,
      );

      if (!letter) {
        continue;
      }

      context.fillStyle = colors.text;
      context.fillText(
        letter,
        x + VICTORY_BOARD_SHARE_TILE_SIZE_PX / 2,
        y + VICTORY_BOARD_SHARE_TILE_SIZE_PX / 2 + 1,
      );
    }
  }

  return canvas;
};

const captureVictoryBoardImageFileFromSnapshot = async (
  snapshot: VictoryBoardShareCaptureSnapshot,
): Promise<File> => {
  const canvas = renderVictoryBoardFallbackCanvas(snapshot);
  const blob = await canvasToPngBlob(canvas);

  return createVictoryBoardImageFile(blob);
};

export const isVictoryBoardShareSupported = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";

export const getVictoryBoardShareCaptureElement = (): HTMLElement | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const playBoardSection = document.getElementById("board");

  if (playBoardSection) {
    return playBoardSection;
  }

  return document.getElementById(PLAY_BOARD_SHARE_CAPTURE_ID);
};

export const captureVictoryBoardImageFile = async (
  boardElement: HTMLElement,
  snapshot: VictoryBoardShareCaptureSnapshot,
): Promise<File> => {
  const devicePixelRatio =
    typeof window === "undefined" ? 1 : window.devicePixelRatio;
  const scale = Math.max(2, Math.min(3, devicePixelRatio || 1));

  try {
    const canvas = await html2canvas(boardElement, {
      backgroundColor: null,
      logging: false,
      scale,
      useCORS: true,
    });
    const blob = await canvasToPngBlob(canvas);

    return createVictoryBoardImageFile(blob);
  } catch {
    return captureVictoryBoardImageFileFromSnapshot(snapshot);
  }
};

export const canShareVictoryBoardFile = (file: File): boolean => {
  if (typeof navigator === "undefined") {
    return false;
  }

  if (typeof navigator.canShare !== "function") {
    return true;
  }

  return navigator.canShare({ files: [file] });
};
