import { useEffect } from "react";
import { faShareNodes } from "@fortawesome/free-solid-svg-icons";
import { Button, FireStreak } from "@components";
import { Dialog, useDialogCloseTransition } from "@components/Dialogs";
import { NORMAL_DICTIONARY_ROW_BONUS } from "@domain/wordle";
import { useTranslation } from "@i18n";
import { DIALOG_CLOSE_DURATION_MS } from "@components/Dialogs/ConfirmationDialog/constants";
import { getDialogTransitionClasses } from "@components/Dialogs/ConfirmationDialog/utils";
import { VICTORY_DIALOG_TITLE_ID } from "./constants";
import type { VictoryDialogProps } from "./types";
import { formatScoreSummaryValue } from "./utils";
import SettingsHint from "../SettingsHint";
import { EndOfGameWordSection } from "../EndOfGameWordSection";

const VictoryDialog = ({
  visible,
  answer,
  currentStreak,
  scoreSummary,
  challengeBonusPoints = 0,
  showSettingsHint = false,
  shareEnabled = false,
  isSharing = false,
  shareErrorMessage = null,
  showPlayAgainAction = true,
  onClose,
  onPlayAgain,
  onShare,
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
      if (!showPlayAgainAction) {
        return;
      }

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
  }, [closeWithAction, onPlayAgain, showPlayAgainAction, visible]);

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
                <span
                  className={`${item.key === "dictionary" ? "text-xs text-gray-400" : ""} `}
                >
                  {t(`play.victoryDialog.scoreItems.${item.key}`, {
                    bonus: NORMAL_DICTIONARY_ROW_BONUS,
                  })}
                </span>

                <span
                  className={`font-semibold ${item.key === "dictionary" ? "text-xs text-gray-400" : ""}`}
                >
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
            {challengeBonusPoints > 0 ? (
              <div className="border-t border-neutral-200 pt-3 text-neutral-950 dark:border-neutral-700 dark:text-neutral-50">
                <div className="flex items-center justify-between font-semibold">
                  <span>{t("play.victoryDialog.challengeBonus")}</span>
                  <span>+{challengeBonusPoints}</span>
                </div>
                <div className="mt-2 flex items-center justify-between font-semibold">
                  <span>{t("play.victoryDialog.totalWithChallenges")}</span>
                  <span>+{scoreSummary.total + challengeBonusPoints}</span>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <div className="text-sm text-neutral-700 dark:text-neutral-200">
          <FireStreak
            streak={currentStreak}
            className="text-neutral-700 dark:text-neutral-200"
          />
        </div>

        {showSettingsHint ? <SettingsHint /> : null}

        {isSharing ? (
          <p className="sr-only" role="status" aria-live="polite">
            {t("play.victoryDialog.shareInProgress")}
          </p>
        ) : null}

        {shareErrorMessage ? (
          <p
            className="text-sm text-red-600 dark:text-red-400"
            role="alert"
            aria-live="assertive"
          >
            {shareErrorMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3">
          {shareEnabled && onShare ? (
            <Button
              onClick={onShare}
              variant="outline"
              color="neutral"
              disabled={isClosing || isSharing}
              aria-label={t("play.victoryDialog.shareAction")}
              aria-busy={isSharing}
              icon={faShareNodes}
            >
              {isSharing
                ? t("play.victoryDialog.shareInProgress")
                : t("play.victoryDialog.shareAction")}
            </Button>
          ) : null}
          {showPlayAgainAction ? (
            <Button
              onClick={() => closeWithAction(onPlayAgain)}
              disabled={isClosing}
            >
              {t("play.endOfGame.playAgain")}
            </Button>
          ) : null}
        </div>
      </div>
    </Dialog>
  );
};

export default VictoryDialog;
