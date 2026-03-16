export type ConfirmationDialogProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmActionLabel: string;
  cancelActionLabel: string;
  dialogTitleId: string;
  onConfirm: () => void;
};

export type DialogTransitionClasses = {
  backdropAnimationClassName: string;
  panelAnimationClassName: string;
};
