import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import {
  DEFAULT_RESUME_DIALOG_DESCRIPTION,
  DEFAULT_RESUME_DIALOG_PRIMARY_ACTION_LABEL,
  DEFAULT_RESUME_DIALOG_SECONDARY_ACTION_LABEL,
  DEFAULT_RESUME_DIALOG_TITLE,
  DEFAULT_RESUME_DIALOG_TITLE_ID,
} from "./constants";
import type { SessionResumeDialogProps } from "./types";

const SessionResumeDialog = ({
  visible,
  onClose,
  onStartNew,
}: SessionResumeDialogProps) => (
  <ConfirmationDialog
    visible={visible}
    onClose={onClose}
    title={DEFAULT_RESUME_DIALOG_TITLE}
    description={DEFAULT_RESUME_DIALOG_DESCRIPTION}
    confirmActionLabel={DEFAULT_RESUME_DIALOG_PRIMARY_ACTION_LABEL}
    cancelActionLabel={DEFAULT_RESUME_DIALOG_SECONDARY_ACTION_LABEL}
    dialogTitleId={DEFAULT_RESUME_DIALOG_TITLE_ID}
    onConfirm={onStartNew}
  />
);

export default SessionResumeDialog;
