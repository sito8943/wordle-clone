import { ConfirmationDialog } from "../ConfirmationDialog";
import {
  REFRESH_CONFIRMATION_DIALOG_CANCEL_ACTION_LABEL,
  REFRESH_CONFIRMATION_DIALOG_CONFIRM_ACTION_LABEL,
  REFRESH_CONFIRMATION_DIALOG_DESCRIPTION,
  REFRESH_CONFIRMATION_DIALOG_TITLE,
  REFRESH_CONFIRMATION_DIALOG_TITLE_ID,
} from "./constants";
import type { RefreshConfirmationDialogProps } from "./types";

const RefreshConfirmationDialog = ({
  visible,
  onClose,
  onConfirm,
}: RefreshConfirmationDialogProps) => (
  <ConfirmationDialog
    visible={visible}
    onClose={onClose}
    title={REFRESH_CONFIRMATION_DIALOG_TITLE}
    description={REFRESH_CONFIRMATION_DIALOG_DESCRIPTION}
    confirmActionLabel={REFRESH_CONFIRMATION_DIALOG_CONFIRM_ACTION_LABEL}
    cancelActionLabel={REFRESH_CONFIRMATION_DIALOG_CANCEL_ACTION_LABEL}
    dialogTitleId={REFRESH_CONFIRMATION_DIALOG_TITLE_ID}
    onConfirm={onConfirm}
  />
);

export default RefreshConfirmationDialog;
