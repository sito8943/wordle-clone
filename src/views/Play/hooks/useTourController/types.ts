import type { WordleModeId } from "@domain/wordle";

export type GameplayTourStep = {
  id: string;
  selector: string | null;
  titleKey: string;
  descriptionKey: string;
};

export type GameplayTourStepMap = Record<WordleModeId, GameplayTourStep[]>;

export type UseTourControllerParams = {
  modeId: WordleModeId;
};

export type UseTourControllerResult = {
  showGameplayTourDialog: boolean;
  steps: GameplayTourStep[];
  stepIndex: number;
  canGoPrevious: boolean;
  openTour: () => void;
  closeTour: () => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
};
