import { ConfirmationDialog } from "@components";
import {
  DIFFICULTY_CHANGE_CANCEL_ACTION_LABEL,
  DIFFICULTY_CHANGE_CONFIRM_ACTION_LABEL,
  DIFFICULTY_CHANGE_CONFIRMATION_DESCRIPTION,
  DIFFICULTY_CHANGE_CONFIRMATION_TITLE,
  DIFFICULTY_CHANGE_DIALOG_TITLE_ID,
  DIFFICULTY_CHANGE_NEW_DIFFICULTY_PREFIX,
} from "../../constants";
import type { DifficultyChangeDialogProps } from "./types";

const DifficultyChangeDialog = ({
  visible,
  pendingDifficultyLabel,
  onClose,
  onConfirm,
}: DifficultyChangeDialogProps) => {
  if (!visible) {
    return null;
  }

  return (
    <ConfirmationDialog
      visible={visible}
      onClose={onClose}
      title={DIFFICULTY_CHANGE_CONFIRMATION_TITLE}
      description={`${DIFFICULTY_CHANGE_CONFIRMATION_DESCRIPTION} ${DIFFICULTY_CHANGE_NEW_DIFFICULTY_PREFIX} ${pendingDifficultyLabel}.`}
      confirmActionLabel={DIFFICULTY_CHANGE_CONFIRM_ACTION_LABEL}
      cancelActionLabel={DIFFICULTY_CHANGE_CANCEL_ACTION_LABEL}
      dialogTitleId={DIFFICULTY_CHANGE_DIALOG_TITLE_ID}
      onConfirm={onConfirm}
    />
  );
};

export default DifficultyChangeDialog;
