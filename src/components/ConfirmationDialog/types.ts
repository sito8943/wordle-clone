export type ConfirmationDialogProps = {
  title: string;
  description: string;
  confirmActionLabel: string;
  cancelActionLabel: string;
  dialogTitleId: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export type DialogTransitionClasses = {
  backdropAnimationClassName: string;
  panelAnimationClassName: string;
};
