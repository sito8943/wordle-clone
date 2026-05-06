import { useCallback, useMemo, useState } from "react";
import { WORDLE_MODE_IDS } from "@domain/wordle";
import { GAMEPLAY_TOUR_STEPS_BY_MODE } from "./constants";
import type { UseTourControllerParams, UseTourControllerResult } from "./types";

const useTourController = ({
  modeId,
}: UseTourControllerParams): UseTourControllerResult => {
  const [showGameplayTourDialog, setShowGameplayTourDialog] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(
    () =>
      GAMEPLAY_TOUR_STEPS_BY_MODE[modeId] ??
      GAMEPLAY_TOUR_STEPS_BY_MODE[WORDLE_MODE_IDS.CLASSIC],
    [modeId],
  );

  const closeTour = useCallback(() => {
    setShowGameplayTourDialog(false);
    setStepIndex(0);
  }, []);

  const openTour = useCallback(() => {
    if (steps.length === 0) {
      return;
    }

    setStepIndex(0);
    setShowGameplayTourDialog(true);
  }, [steps.length]);

  const goToNextStep = useCallback(() => {
    setStepIndex((currentStepIndex) => {
      const lastStepIndex = steps.length - 1;
      if (lastStepIndex < 0 || currentStepIndex >= lastStepIndex) {
        return currentStepIndex;
      }

      return currentStepIndex + 1;
    });
  }, [steps.length]);

  const goToPreviousStep = useCallback(() => {
    setStepIndex((currentStepIndex) => Math.max(0, currentStepIndex - 1));
  }, []);

  return {
    showGameplayTourDialog,
    steps,
    stepIndex,
    canGoPrevious: stepIndex > 0,
    openTour,
    closeTour,
    goToNextStep,
    goToPreviousStep,
  };
};

export default useTourController;
