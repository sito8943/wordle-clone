import { ConfirmationDialog } from "@components/Dialogs/ConfirmationDialog";
import { useTranslation } from "@i18n";
import { TUTORIAL_PROMPT_DIALOG_TITLE_ID } from "./constants";
import type { TutorialPromptDialogProps } from "./types";

const TutorialPromptDialog = ({
  visible,
  onClose,
  onConfirm,
  gameMode,
}: TutorialPromptDialogProps) => {
  const { t } = useTranslation();

  return (
    <ConfirmationDialog
      visible={visible}
      onClose={onClose}
      title={t("play.tutorialPromptDialog.title", { gameMode })}
      description={t("play.tutorialPromptDialog.description")}
      confirmActionLabel={t("play.tutorialPromptDialog.confirm")}
      cancelActionLabel={t("play.tutorialPromptDialog.cancel")}
      dialogTitleId={TUTORIAL_PROMPT_DIALOG_TITLE_ID}
      onConfirm={onConfirm}
    />
  );
};

export default TutorialPromptDialog;
