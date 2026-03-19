import { useEffect } from "react";
import { Button } from "@components";
import { Dialog, useDialogCloseTransition } from "@components/Dialogs";
import { useTranslation } from "@i18n";
import { DIALOG_CLOSE_DURATION_MS } from "@components/Dialogs/ConfirmationDialog/constants";
import { getDialogTransitionClasses } from "@components/Dialogs/ConfirmationDialog/utils";
import { VICTORY_DIALOG_TITLE_ID } from "./constants";
import type { VictoryDialogProps } from "./types";

const VictoryDialog = ({
  visible,
  answer,
  currentStreak,
  scoreSummary,
  onClose,
  onPlayAgain,
}: VictoryDialogProps) => {
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
      closeWithAction(onPlayAgain);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeWithAction, onPlayAgain, visible]);

  return (
    <Dialog
      visible={visible}
      onClose={() => closeWithAction(onClose)}
      isClosing={isClosing}
      titleId={VICTORY_DIALOG_TITLE_ID}
      title={t("home.victoryDialog.title")}
      description={t("home.victoryDialog.description")}
      panelClassName="max-w-lg"
      backdropAnimationClassName={backdropAnimationClassName}
      panelAnimationClassName={panelAnimationClassName}
    >
      <div className="mt-5 space-y-5">
        <section className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100">
          <p className="text-xs font-semibold uppercase tracking-[0.24em]">
            {t("home.endOfGame.wordLabel")}
          </p>
          <p className="mt-2 text-3xl font-black tracking-[0.18em] slab">
            {answer}
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            {t("home.victoryDialog.scoreSummaryTitle")}
          </h3>
          <div className="mt-3 space-y-2 text-sm text-neutral-700 dark:text-neutral-200">
            {scoreSummary.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span>{t(`home.victoryDialog.scoreItems.${item.key}`)}</span>
                <span className="font-semibold">+{item.value}</span>
              </div>
            ))}
            <div className="border-t border-neutral-200 pt-3 font-semibold text-neutral-950 dark:border-neutral-700 dark:text-neutral-50">
              <div className="flex items-center justify-between">
                <span>{t("home.victoryDialog.scoreItems.total")}</span>
                <span>+{scoreSummary.total}</span>
              </div>
            </div>
          </div>
        </section>

        <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          {t("common.streakLabel", { count: currentStreak })}
        </p>

        <div className="flex justify-end">
          <Button onClick={() => closeWithAction(onPlayAgain)} disabled={isClosing}>
            {t("home.endOfGame.playAgain")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default VictoryDialog;
