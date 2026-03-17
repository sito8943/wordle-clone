import type { DialogProps } from "../Dialog";

export interface ConfirmationDialogProps extends Omit<DialogProps, "titleId"> {
  confirmActionLabel: string;
  cancelActionLabel: string;
  dialogTitleId: string;
  onConfirm: () => void;
}

export type DialogTransitionClasses = {
  backdropAnimationClassName: string;
  panelAnimationClassName: string;
};
