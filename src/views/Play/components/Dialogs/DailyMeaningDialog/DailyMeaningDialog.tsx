import { Button } from "@components/Button";
import { Dialog } from "@components/Dialogs";
import { useTranslation } from "@i18n";
import { DAILY_MEANING_DIALOG_TITLE_ID } from "./constants";
import type { DailyMeaningDialogProps } from "./types";

const DailyMeaningDialog = ({
  visible,
  meaning,
  loading,
  errorMessage,
  onClose,
  onRetry,
}: DailyMeaningDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      titleId={DAILY_MEANING_DIALOG_TITLE_ID}
      title={t("play.dailyMeaningDialog.title")}
      description={t("play.dailyMeaningDialog.description")}
      panelClassName="max-w-md"
    >
      <div className="mt-4 space-y-4">
        {loading ? (
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-neutral-600 dark:text-neutral-300"
          >
            {t("play.dailyMeaningDialog.loading")}
          </p>
        ) : meaning ? (
          <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">
            {meaning}
          </p>
        ) : (
          <div className="space-y-3">
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {errorMessage ?? t("play.dailyMeaningDialog.unavailable")}
            </p>
            <div className="flex justify-end">
              <Button onClick={onRetry} variant="outline" color="neutral">
                {t("common.retry")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default DailyMeaningDialog;
