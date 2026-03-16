import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HARD_MODE_FINAL_STRETCH_SECONDS } from "./constants";
import type { UseHardModeTimerParams, UseHardModeTimerResult } from "./types";
import {
  clearHardModeTimerSnapshot,
  getDefaultHardModeTimerSnapshot,
  getHardModeClockBoostScale,
  getHardModeFinalStretchProgressPercent,
  getInitialHardModeTimerSnapshot,
  isWithinHardModeFinalStretch,
  setHardModeTimerSnapshot,
} from "./utils";

export const useHardModeTimer = ({
  sessionId,
  hardModeEnabled,
  hasInProgressGameAtMount,
  boardVersion,
  showResumeDialog,
  gameOver,
  guessesLength,
  currentLength,
  forceLoss,
}: UseHardModeTimerParams): UseHardModeTimerResult => {
  const initialHardModeTimerSnapshot = getInitialHardModeTimerSnapshot(
    sessionId,
    hardModeEnabled,
    hasInProgressGameAtMount,
  );
  const skipInitialHardModeReset = useRef(true);
  const hardModeEnabledRef = useRef(hardModeEnabled);
  const hardModeTimerStateRef = useRef(initialHardModeTimerSnapshot);
  const [hardModeSecondsLeft, setHardModeSecondsLeft] = useState(
    initialHardModeTimerSnapshot.secondsLeft,
  );
  const [hardModeTimerStarted, setHardModeTimerStarted] = useState(
    initialHardModeTimerSnapshot.timerStarted,
  );
  const [hardModeTickPulse, setHardModeTickPulse] = useState(0);
  const [boardShakePulse, setBoardShakePulse] = useState(0);

  const showHardModeTimer = hardModeEnabled && !showResumeDialog && !gameOver;
  const hardModeTimerRunning = showHardModeTimer && hardModeTimerStarted;
  const showHardModeFinalStretchBar =
    showHardModeTimer && hardModeSecondsLeft <= HARD_MODE_FINAL_STRETCH_SECONDS;
  const hardModeFinalStretchProgressPercent =
    getHardModeFinalStretchProgressPercent(hardModeSecondsLeft);
  const hardModeClockBoostScale = useMemo(
    () => getHardModeClockBoostScale(hardModeSecondsLeft),
    [hardModeSecondsLeft],
  );
  const effectiveBoardShakePulse =
    hardModeTimerRunning && isWithinHardModeFinalStretch(hardModeSecondsLeft)
      ? boardShakePulse
      : 0;

  const resetHardModeTimer = useCallback(() => {
    const defaultHardModeTimerSnapshot =
      getDefaultHardModeTimerSnapshot(sessionId);

    setHardModeSecondsLeft(defaultHardModeTimerSnapshot.secondsLeft);
    setHardModeTimerStarted(defaultHardModeTimerSnapshot.timerStarted);
    setHardModeTickPulse(0);
    setBoardShakePulse(0);
    hardModeTimerStateRef.current = defaultHardModeTimerSnapshot;

    if (hardModeEnabled) {
      setHardModeTimerSnapshot(defaultHardModeTimerSnapshot);
    }
  }, [hardModeEnabled, sessionId]);

  useEffect(() => {
    hardModeTimerStateRef.current = {
      sessionId,
      secondsLeft: hardModeSecondsLeft,
      timerStarted: hardModeTimerStarted,
    };
  }, [hardModeSecondsLeft, hardModeTimerStarted, sessionId]);

  useEffect(() => {
    hardModeEnabledRef.current = hardModeEnabled;

    if (!hardModeEnabled) {
      clearHardModeTimerSnapshot();
    }
  }, [hardModeEnabled]);

  useEffect(() => {
    return () => {
      if (!hardModeEnabledRef.current) {
        return;
      }

      setHardModeTimerSnapshot({ ...hardModeTimerStateRef.current });
    };
  }, []);

  useEffect(() => {
    if (skipInitialHardModeReset.current) {
      skipInitialHardModeReset.current = false;
      return;
    }

    resetHardModeTimer();
  }, [boardVersion, hardModeEnabled, resetHardModeTimer]);

  useEffect(() => {
    if (
      hardModeTimerStarted ||
      !showHardModeTimer ||
      (guessesLength === 0 && currentLength === 0)
    ) {
      return;
    }

    setHardModeTimerStarted(true);
  }, [currentLength, guessesLength, hardModeTimerStarted, showHardModeTimer]);

  useEffect(() => {
    if (!hardModeTimerRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setHardModeSecondsLeft((previous) => {
        if (previous <= 0) {
          return 0;
        }

        const next = previous - 1;
        setHardModeTickPulse((pulse) => pulse + 1);

        if (next <= HARD_MODE_FINAL_STRETCH_SECONDS && next > 0) {
          setBoardShakePulse((pulse) => pulse + 1);
        }

        return next;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hardModeTimerRunning]);

  useEffect(() => {
    if (!hardModeTimerRunning || hardModeSecondsLeft > 0) {
      return;
    }

    forceLoss();
  }, [forceLoss, hardModeSecondsLeft, hardModeTimerRunning]);

  return {
    showHardModeTimer,
    showHardModeFinalStretchBar,
    hardModeSecondsLeft,
    hardModeTimerStarted,
    hardModeTickPulse,
    hardModeClockBoostScale,
    hardModeFinalStretchProgressPercent,
    boardShakePulse: effectiveBoardShakePulse,
    resetHardModeTimer,
  };
};
