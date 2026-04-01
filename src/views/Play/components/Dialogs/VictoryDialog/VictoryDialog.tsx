import { useEffect } from "react";
import { Button, FireStreak } from "@components";
import { Dialog, useDialogCloseTransition } from "@components/Dialogs";
import { NORMAL_DICTIONARY_ROW_BONUS } from "@domain/wordle";
import { useTranslation } from "@i18n";
import { DIALOG_CLOSE_DURATION_MS } from "@components/Dialogs/ConfirmationDialog/constants";
import { getDialogTransitionClasses } from "@components/Dialogs/ConfirmationDialog/utils";
import { VICTORY_DIALOG_TITLE_ID } from "./constants";
import type { VictoryDialogProps } from "./types";
import SettingsHint from "../SettingsHint";
import { EndOfGameWordSection } from "../EndOfGameWordSection";

const formatScoreSummaryValue = (key: string, value: number): string => {
  if (key === "difficulty" || key === "streak") {
    return `x${Number.isInteger(value) ? value : value.toFixed(2)}`;
  }

  return `+${Number.isInteger(value) ? value : value.toFixed(1)}`;
};

const VictoryDialog = ({
  visible,
  answer,
  currentStreak,
  scoreSummary,
  showSettingsHint = false,
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
      title={t("play.victoryDialog.title")}
      description={t("play.victoryDialog.description")}
      panelClassName="max-w-lg"
      backdropAnimationClassName={backdropAnimationClassName}
      panelAnimationClassName={panelAnimationClassName}
    >
      <div className="mt-5 space-y-5">
        <EndOfGameWordSection
          answer={answer}
          sectionClassName="rounded-2xl bg-emerald-200 px-4 py-3 text-emerald-950 dark:bg-emerald-950/90 dark:text-emerald-400"
        />

        <section>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            {t("play.victoryDialog.scoreSummaryTitle")}
          </h3>
          <div className="mt-3 space-y-2 text-sm text-neutral-700 dark:text-neutral-200">
            {scoreSummary.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span>
                  {t(`play.victoryDialog.scoreItems.${item.key}`, {
                    bonus: NORMAL_DICTIONARY_ROW_BONUS,
                  })}
                </span>
                <span className="font-semibold">
                  {formatScoreSummaryValue(item.key, item.value)}
                </span>
              </div>
            ))}
            <div className="border-t border-neutral-200 pt-3 font-semibold text-neutral-950 dark:border-neutral-700 dark:text-neutral-50">
              <div className="flex items-center justify-between">
                <span>{t("play.victoryDialog.scoreItems.total")}</span>
                <span>+{scoreSummary.total}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="text-sm text-neutral-700 dark:text-neutral-200">
          <FireStreak
            streak={currentStreak}
            className="text-neutral-700 dark:text-neutral-200"
          />
        </div>

        {showSettingsHint ? <SettingsHint /> : null}

        <div className="flex justify-end">
          <Button
            onClick={() => closeWithAction(onPlayAgain)}
            disabled={isClosing}
          >
            {t("play.endOfGame.playAgain")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default VictoryDialog;
