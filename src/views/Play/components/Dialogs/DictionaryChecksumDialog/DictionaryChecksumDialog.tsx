import { Button } from "@components/Button";
import { Dialog } from "@components/Dialogs";
import { useTranslation } from "@i18n";
import { DICTIONARY_CHECKSUM_DIALOG_TITLE_ID } from "./constants";
import type { DictionaryChecksumDialogProps } from "./types";

const DictionaryChecksumDialog = ({
  visible,
  onAccept,
}: DictionaryChecksumDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog
      visible={visible}
      onClose={onAccept}
      titleId={DICTIONARY_CHECKSUM_DIALOG_TITLE_ID}
      title={t("play.dictionaryChecksumDialog.title")}
      description={t("play.dictionaryChecksumDialog.description")}
      headerAction={<span aria-hidden="true" />}
    >
      <div className="mt-5 flex justify-end">
        <Button onClick={onAccept}>
          {t("play.dictionaryChecksumDialog.accept")}
        </Button>
      </div>
    </Dialog>
  );
};

export default DictionaryChecksumDialog;
