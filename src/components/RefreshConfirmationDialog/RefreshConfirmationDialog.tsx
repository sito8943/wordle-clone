import { ConfirmationDialog } from "../ConfirmationDialog";
import {
  REFRESH_CONFIRMATION_DIALOG_CANCEL_ACTION_LABEL,
  REFRESH_CONFIRMATION_DIALOG_CONFIRM_ACTION_LABEL,
  REFRESH_CONFIRMATION_DIALOG_DESCRIPTION,
  REFRESH_CONFIRMATION_DIALOG_TITLE,
  REFRESH_CONFIRMATION_DIALOG_TITLE_ID,
} from "./constant";
import type { RefreshConfirmationDialogProps } from "./types";

const RefreshConfirmationDialog = ({
  onConfirm,
  onCancel,
}: RefreshConfirmationDialogProps) => (
  <ConfirmationDialog
    title={REFRESH_CONFIRMATION_DIALOG_TITLE}
    description={REFRESH_CONFIRMATION_DIALOG_DESCRIPTION}
    confirmActionLabel={REFRESH_CONFIRMATION_DIALOG_CONFIRM_ACTION_LABEL}
    cancelActionLabel={REFRESH_CONFIRMATION_DIALOG_CANCEL_ACTION_LABEL}
    dialogTitleId={REFRESH_CONFIRMATION_DIALOG_TITLE_ID}
    onConfirm={onConfirm}
    onCancel={onCancel}
  />
);

export default RefreshConfirmationDialog;
