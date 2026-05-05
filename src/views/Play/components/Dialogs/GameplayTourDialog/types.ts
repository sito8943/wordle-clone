import type { GameplayTourStep } from "@views/Play/hooks/useTourController";

export type GameplayTourDialogProps = {
  visible: boolean;
  steps: GameplayTourStep[];
  stepIndex: number;
  canGoPrevious: boolean;
  onClose: () => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onOpenHelp: () => void;
};
