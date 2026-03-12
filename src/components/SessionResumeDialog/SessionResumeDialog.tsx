import { ConfirmationDialog } from "../ConfirmationDialog";
import {
  DEFAULT_RESUME_DIALOG_DESCRIPTION,
  DEFAULT_RESUME_DIALOG_PRIMARY_ACTION_LABEL,
  DEFAULT_RESUME_DIALOG_SECONDARY_ACTION_LABEL,
  DEFAULT_RESUME_DIALOG_TITLE,
  DEFAULT_RESUME_DIALOG_TITLE_ID,
} from "./constant";
import type { SessionResumeDialogProps } from "./types";

const SessionResumeDialog = ({
  onContinue,
  onStartNew,
}: SessionResumeDialogProps) => (
  <ConfirmationDialog
    title={DEFAULT_RESUME_DIALOG_TITLE}
    description={DEFAULT_RESUME_DIALOG_DESCRIPTION}
    confirmActionLabel={DEFAULT_RESUME_DIALOG_PRIMARY_ACTION_LABEL}
    cancelActionLabel={DEFAULT_RESUME_DIALOG_SECONDARY_ACTION_LABEL}
    dialogTitleId={DEFAULT_RESUME_DIALOG_TITLE_ID}
    onConfirm={onStartNew}
    onCancel={onContinue}
  />
);

export default SessionResumeDialog;
