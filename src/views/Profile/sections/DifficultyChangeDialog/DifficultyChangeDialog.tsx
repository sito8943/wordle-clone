import { ConfirmationDialog } from "@components";
import { useTranslation } from "@i18n";
import { DIFFICULTY_CHANGE_DIALOG_TITLE_ID } from "@views/Profile/constants";
import { useProfileView } from "@views/Profile/providers";

const DifficultyChangeDialog = () => {
  const { t } = useTranslation();
  const {
    controller: {
      pendingDifficulty,
      isDifficultyChangeConfirmationOpen,
      cancelDifficultyChange,
      confirmDifficultyChange,
    },
  } = useProfileView();

  if (!isDifficultyChangeConfirmationOpen) {
    return null;
  }
  const nextDifficultyLabel = t(`profile.difficultyOptions.${pendingDifficulty}`);
  const description = `${t("profile.difficultyChange.description")} ${t(
    "profile.difficultyChange.nextDifficulty",
    { difficulty: nextDifficultyLabel },
  )}`;

  return (
    <ConfirmationDialog
      visible={isDifficultyChangeConfirmationOpen}
      onClose={cancelDifficultyChange}
      title={t("profile.difficultyChange.title")}
      description={description}
      confirmActionLabel={t("profile.difficultyChange.confirm")}
      cancelActionLabel={t("profile.difficultyChange.cancel")}
      dialogTitleId={DIFFICULTY_CHANGE_DIALOG_TITLE_ID}
      onConfirm={confirmDifficultyChange}
    />
  );
};

export default DifficultyChangeDialog;
