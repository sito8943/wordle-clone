import { useEffect } from "react";
import { Button } from "@components";
import { Dialog, useDialogCloseTransition } from "@components/Dialogs";
import { useTranslation } from "@i18n";
import { DIALOG_CLOSE_DURATION_MS } from "@components/Dialogs/ConfirmationDialog/constants";
import { getDialogTransitionClasses } from "@components/Dialogs/ConfirmationDialog/utils";
import { EndOfGameWordSection } from "../EndOfGameWordSection";
import { DAILY_COMPLETED_DIALOG_TITLE_ID } from "./constants";
import type { DailyCompletedDialogProps } from "./types";

const DailyCompletedDialog = ({
  visible,
  answer,
  onClose,
  onGoToGameModes,
}: DailyCompletedDialogProps) => {
  const { t } = useTranslation();
  const { isClosing, closeWithAction } = useDialogCloseTransition(
    DIALOG_CLOSE_DURATION_MS,
  );
  const { backdropAnimationClassName, panelAnimationClassName } =
    getDialogTransitionClasses(isClosing);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") {
        return;
      }

      event.preventDefault();
      closeWithAction(onGoToGameModes);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeWithAction, onGoToGameModes, visible]);

  return (
    <Dialog
      visible={visible}
      onClose={() => closeWithAction(onClose)}
      isClosing={isClosing}
      titleId={DAILY_COMPLETED_DIALOG_TITLE_ID}
      title={t("play.dailyCompletedDialog.title")}
      description={t("play.dailyCompletedDialog.description")}
      panelClassName="max-w-lg"
      backdropAnimationClassName={backdropAnimationClassName}
      panelAnimationClassName={panelAnimationClassName}
    >
      <div className="mt-5 space-y-5">
        <EndOfGameWordSection
          answer={answer}
          sectionClassName="rounded-2xl bg-sky-100 px-4 py-3 text-sky-950 dark:bg-sky-950/40 dark:text-sky-100"
        />

        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {t("play.dailyCompletedDialog.message")}
        </p>

        <div className="flex flex-wrap justify-end gap-3">
          <Button
            onClick={() => closeWithAction(onGoToGameModes)}
            disabled={isClosing}
          >
            {t("play.dailyCompletedDialog.goToGameModesAction")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default DailyCompletedDialog;
