import { ConfirmationDialog } from "@components";

import {
  DIFFICULTY_CHANGE_CANCEL_ACTION_LABEL,
  DIFFICULTY_CHANGE_CONFIRM_ACTION_LABEL,
  DIFFICULTY_CHANGE_CONFIRMATION_DESCRIPTION,
  DIFFICULTY_CHANGE_CONFIRMATION_TITLE,
  DIFFICULTY_CHANGE_DIALOG_TITLE_ID,
  DIFFICULTY_CHANGE_NEW_DIFFICULTY_PREFIX,
} from "@views/Profile/constants";
import { useProfileView } from "@views/Profile/providers";

const DifficultyChangeDialog = () => {
  const {
    controller: {
      pendingDifficulty,
      isDifficultyChangeConfirmationOpen,
      cancelDifficultyChange,
      confirmDifficultyChange,
      pendingDifficultyLabel,
    },
  } = useProfileView();

  if (!isDifficultyChangeConfirmationOpen) {
    return null;
  }

  const nextDifficultyLabel = pendingDifficultyLabel(pendingDifficulty);

  return (
    <ConfirmationDialog
      visible={isDifficultyChangeConfirmationOpen}
      onClose={cancelDifficultyChange}
      title={DIFFICULTY_CHANGE_CONFIRMATION_TITLE}
      description={`${DIFFICULTY_CHANGE_CONFIRMATION_DESCRIPTION} ${DIFFICULTY_CHANGE_NEW_DIFFICULTY_PREFIX} ${nextDifficultyLabel}.`}
      confirmActionLabel={DIFFICULTY_CHANGE_CONFIRM_ACTION_LABEL}
      cancelActionLabel={DIFFICULTY_CHANGE_CANCEL_ACTION_LABEL}
      dialogTitleId={DIFFICULTY_CHANGE_DIALOG_TITLE_ID}
      onConfirm={confirmDifficultyChange}
    />
  );
};

export default DifficultyChangeDialog;
