import { ConfirmationDialog } from "@components/Dialogs/ConfirmationDialog";
import { useTranslation } from "@i18n";
import { REFRESH_CONFIRMATION_DIALOG_TITLE_ID } from "./constants";
import type { RefreshConfirmationDialogProps } from "./types";

const RefreshConfirmationDialog = ({
  visible,
  onClose,
  onConfirm,
}: RefreshConfirmationDialogProps) => {
  const { t } = useTranslation();

  return (
    <ConfirmationDialog
      visible={visible}
      onClose={onClose}
      title={t("home.refreshDialog.title")}
      description={t("home.refreshDialog.description")}
      confirmActionLabel={t("home.refreshDialog.confirm")}
      cancelActionLabel={t("home.refreshDialog.cancel")}
      dialogTitleId={REFRESH_CONFIRMATION_DIALOG_TITLE_ID}
      onConfirm={onConfirm}
    />
  );
};

export default RefreshConfirmationDialog;
