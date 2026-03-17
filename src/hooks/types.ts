export type { GuessResult } from "@domain/wordle";

export type DialogCloseAction = () => void;

export type UseDialogCloseTransitionResult = {
  isClosing: boolean;
  closeWithAction: (action: DialogCloseAction) => void;
};
