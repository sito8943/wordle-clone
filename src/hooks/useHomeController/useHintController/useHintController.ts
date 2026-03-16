import { useCallback, useEffect, useRef, useState } from "react";
import { WORD_LENGTH } from "../../../domain/wordle";
import { HINT_USAGE_STORAGE_KEY } from "./constants";
import type { UseHintControllerParams, UseHintControllerResult } from "./types";
import {
  clearHintUsageSnapshot,
  getHintsUsedForAnswer,
  getHintStatusByDifficulty,
  getHintsLimitByDifficulty,
  setHintUsageSnapshot,
} from "./utils";

export const useHintController = ({
  answer,
  difficulty,
  hasInProgressGameAtMount,
  showResumeDialog,
  gameOver,
  currentLength,
  revealHint,
}: UseHintControllerParams): UseHintControllerResult => {
  const hintsLimit = getHintsLimitByDifficulty(difficulty);
  const initialAnswerRef = useRef(answer);
  const hasInProgressGameAtMountRef = useRef(hasInProgressGameAtMount);
  const [hintsUsed, setHintsUsed] = useState(0);

  const hintsRemaining = Math.max(0, hintsLimit - hintsUsed);
  const hintsEnabledForDifficulty = hintsLimit > 0;
  const hintButtonDisabled =
    hintsRemaining <= 0 ||
    showResumeDialog ||
    gameOver ||
    currentLength >= WORD_LENGTH;

  useEffect(() => {
    if (!hasInProgressGameAtMountRef.current) {
      return;
    }

    const persistedHintsUsed = getHintsUsedForAnswer(initialAnswerRef.current);
    if (persistedHintsUsed <= 0) {
      return;
    }
    console.log("render", persistedHintsUsed);
    setHintsUsed(persistedHintsUsed);
  }, []);

  console.log(hintsRemaining, hintsLimit, hintsUsed);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== HINT_USAGE_STORAGE_KEY) {
        return;
      }
      console.log("event", getHintsUsedForAnswer(answer));
      setHintsUsed(getHintsUsedForAnswer(answer));
    };

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, [answer]);

  const resetHints = useCallback(() => {
    console.log("reset");
    setHintsUsed(0);
    clearHintUsageSnapshot();
  }, []);

  const useHint = useCallback(() => {
    if (hintButtonDisabled) {
      return;
    }

    const hintStatus = getHintStatusByDifficulty(difficulty);
    if (!hintStatus) {
      return;
    }

    const revealed = revealHint(hintStatus);
    if (!revealed) {
      return;
    }

    setHintsUsed((previous) => {
      const next = previous + 1;
      setHintUsageSnapshot({
        answer,
        hintsUsed: next,
      });

      return next;
    });
  }, [answer, difficulty, hintButtonDisabled, revealHint]);

  return {
    hintsRemaining,
    hintsEnabledForDifficulty,
    hintButtonDisabled,
    useHint,
    resetHints,
  };
};
