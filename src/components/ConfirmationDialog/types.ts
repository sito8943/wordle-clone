export type ConfirmationDialogProps = {
  title: string;
  description: string;
  confirmActionLabel: string;
  cancelActionLabel: string;
  dialogTitleId: string;
  onConfirm: () => void;
  onCancel: () => void;
};
