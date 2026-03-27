import { ConfirmationDialog } from "@components";
import { useTranslation } from "@i18n";
import { DEFAULT_RESUME_DIALOG_TITLE_ID } from "./constants";
import type { SessionResumeDialogProps } from "./types";

const SessionResumeDialog = ({
  visible,
  onClose,
  onStartNew,
}: SessionResumeDialogProps) => {
  const { t } = useTranslation();

  return (
    <ConfirmationDialog
      visible={visible}
      onClose={onClose}
      title={t("play.sessionResumeDialog.title")}
      description={t("play.sessionResumeDialog.description")}
      confirmActionLabel={t("play.sessionResumeDialog.startNew")}
      cancelActionLabel={t("play.sessionResumeDialog.continuePrevious")}
      dialogTitleId={DEFAULT_RESUME_DIALOG_TITLE_ID}
      onConfirm={onStartNew}
    />
  );
};

export default SessionResumeDialog;
