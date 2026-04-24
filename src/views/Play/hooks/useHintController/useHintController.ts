import { useCallback, useEffect, useRef, useState } from "react";
import { resolveBoardRoundConfig } from "@domain/wordle";
import { HINT_USAGE_STORAGE_KEY } from "./constants";
import type { UseHintControllerParams, UseHintControllerResult } from "./types";
import {
  clearHintUsageSnapshot,
  getHintUsageKey,
  getHintsUsedForGame,
  getHintStatusByDifficulty,
  getHintsLimitByDifficulty,
  setHintUsageSnapshot,
} from "./utils";

export const useHintController = ({
  answer,
  gameId,
  difficulty,
  hintsLimitOverride,
  hintStatusOverride,
  roundConfig,
  hasInProgressGameAtMount,
  showResumeDialog,
  gameOver,
  current,
  revealHint,
}: UseHintControllerParams): UseHintControllerResult => {
  const { lettersPerRow } = resolveBoardRoundConfig(roundConfig);
  const hintsLimit =
    typeof hintsLimitOverride === "number" && Number.isFinite(hintsLimitOverride)
      ? Math.max(0, Math.floor(hintsLimitOverride))
      : getHintsLimitByDifficulty(difficulty);
  const hintStatus = hintStatusOverride ?? getHintStatusByDifficulty(difficulty);
  const initialGameIdRef = useRef(gameId);
  const hasInProgressGameAtMountRef = useRef(hasInProgressGameAtMount);
  const [hintsUsed, setHintsUsed] = useState(0);

  const hintsRemaining = Math.max(0, hintsLimit - hintsUsed);
  const hintsEnabledForDifficulty = hintsLimit > 0;
  const currentRowComplete =
    current.length >= lettersPerRow && !current.includes(" ");
  const hintButtonDisabled =
    hintsRemaining <= 0 || showResumeDialog || gameOver || currentRowComplete;

  useEffect(() => {
    if (!hasInProgressGameAtMountRef.current) {
      return;
    }

    const persistedHintsUsed = getHintsUsedForGame(
      initialGameIdRef.current,
      answer,
    );
    if (persistedHintsUsed <= 0) {
      return;
    }
    setHintsUsed(persistedHintsUsed);
  }, [answer]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== HINT_USAGE_STORAGE_KEY) {
        return;
      }

      setHintsUsed(getHintsUsedForGame(gameId, answer));
    };

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, [answer, gameId]);

  const resetHints = useCallback(() => {
    setHintsUsed(0);
    clearHintUsageSnapshot();
  }, []);

  const useHint = useCallback(() => {
    if (hintButtonDisabled) {
      return false;
    }

    if (!hintStatus) {
      return false;
    }

    const revealed = revealHint(hintStatus);
    if (!revealed) {
      return false;
    }

    setHintsUsed((previous) => {
      const next = previous + 1;
      setHintUsageSnapshot({
        gameId,
        gameKey: getHintUsageKey(answer),
        hintsUsed: next,
      });

      return next;
    });
    return true;
  }, [answer, gameId, hintButtonDisabled, hintStatus, revealHint]);

  return {
    hintsRemaining,
    hintsEnabledForDifficulty,
    hintButtonDisabled,
    useHint,
    resetHints,
  };
};
