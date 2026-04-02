import html2canvas from "html2canvas";
import { PLAY_BOARD_SHARE_CAPTURE_ID } from "@views/Play/constants";
import {
  END_OF_GAME_DIALOG_SEEN_SESSION_STORAGE_KEY,
  HARD_MODE_FINAL_STRETCH_SECONDS,
  HARD_MODE_TOTAL_SECONDS,
  VICTORY_BOARD_SHARE_FILE_NAME,
} from "./constants";
import type { HardModeTimerSnapshot } from "./types";

let hardModeTimerSnapshot: HardModeTimerSnapshot | null = null;

export const getHardModeClockBoostScale = (secondsLeft: number): number => {
  if (secondsLeft <= HARD_MODE_FINAL_STRETCH_SECONDS) {
    return 0.28;
  }

  if (secondsLeft <= 30) {
    return 0.2;
  }

  if (secondsLeft <= 45) {
    return 0.14;
  }

  return 0.1;
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
): HardModeTimerSnapshot => {
  if (
    hardModeEnabled &&
    hasActiveGame &&
    hardModeTimerSnapshot &&
    hardModeTimerSnapshot.sessionId === sessionId
  ) {
    return hardModeTimerSnapshot;
  }

  return getDefaultHardModeTimerSnapshot(sessionId);
};

export const clearHardModeTimerSnapshot = (): void => {
  hardModeTimerSnapshot = null;
};

export const setHardModeTimerSnapshot = (
  snapshot: HardModeTimerSnapshot,
): void => {
  hardModeTimerSnapshot = snapshot;
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

export const isVictoryBoardShareSupported = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";

export const getVictoryBoardShareCaptureElement = (): HTMLElement | null => {
  if (typeof document === "undefined") {
    return null;
  }

  return document.getElementById(PLAY_BOARD_SHARE_CAPTURE_ID);
};

export const captureVictoryBoardImageFile = async (
  boardElement: HTMLElement,
): Promise<File> => {
  const devicePixelRatio =
    typeof window === "undefined" ? 1 : window.devicePixelRatio;
  const scale = Math.max(1, Math.min(2, devicePixelRatio || 1));
  const canvas = await html2canvas(boardElement, {
    backgroundColor: null,
    logging: false,
    scale,
    useCORS: true,
  });
  const blob = await canvasToPngBlob(canvas);

  return new File([blob], VICTORY_BOARD_SHARE_FILE_NAME, {
    type: "image/png",
  });
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
