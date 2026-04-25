import { useEffect } from "react";
import { Button } from "@components";
import { Dialog, useDialogCloseTransition } from "@components/Dialogs";
import { useTranslation } from "@i18n";
import { DIALOG_CLOSE_DURATION_MS } from "@components/Dialogs/ConfirmationDialog/constants";
import { getDialogTransitionClasses } from "@components/Dialogs/ConfirmationDialog/utils";
import { DEFEAT_DIALOG_TITLE_ID } from "./constants";
import type { DefeatDialogProps } from "./types";
import SettingsHint from "../SettingsHint";
import { EndOfGameWordSection } from "../EndOfGameWordSection";

const DefeatDialog = ({
  visible,
  answer,
  bestStreak,
  showShieldActions = false,
  showSettingsHint = false,
  showPlayAgainAction = true,
  showChangeDifficultyAction = true,
  onClose,
  onUseShield,
  onSkipShield,
  onPlayAgain,
  onChangeDifficulty,
}: DefeatDialogProps) => {
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
      titleId={DEFEAT_DIALOG_TITLE_ID}
      title={t("play.defeatDialog.title")}
      description={t("play.defeatDialog.description")}
      panelClassName="max-w-lg"
      backdropAnimationClassName={backdropAnimationClassName}
      panelAnimationClassName={panelAnimationClassName}
    >
      <div className="mt-5 space-y-5">
        <EndOfGameWordSection
          answer={answer}
          sectionClassName="rounded-2xl bg-rose-50 px-4 py-3 text-rose-950 dark:bg-rose-950/40 dark:text-rose-100"
        />

        <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          {t("play.defeatDialog.bestStreak", { count: bestStreak })}
        </p>

        {showShieldActions ? (
          <div className="rounded-2xl border border-sky-300 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-100">
            <p className="font-semibold">
              {t("play.defeatDialog.shieldPrompt")}
            </p>
            <div className="mt-3 flex flex-wrap justify-end gap-3">
              <Button
                onClick={() => {
                  if (onUseShield) {
                    onUseShield();
                  }
                }}
                disabled={isClosing}
              >
                {t("play.defeatDialog.useShield")}
              </Button>
              <Button
                onClick={() => {
                  if (onSkipShield) {
                    onSkipShield();
                  }
                }}
                variant="outline"
                color="neutral"
                disabled={isClosing}
              >
                {t("play.defeatDialog.skipShield")}
              </Button>
            </div>
          </div>
        ) : null}

        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {t("play.defeatDialog.closingMessage")}
        </p>

        {showSettingsHint ? <SettingsHint /> : null}

        <div className="flex flex-wrap justify-end gap-3">
          {showPlayAgainAction ? (
            <Button
              onClick={() => closeWithAction(onPlayAgain)}
              disabled={isClosing}
            >
              {t("play.endOfGame.playAgain")}
            </Button>
          ) : null}
          {showChangeDifficultyAction ? (
            <Button
              onClick={() => closeWithAction(onChangeDifficulty)}
              variant="outline"
              color="neutral"
              disabled={isClosing}
            >
              {t("play.defeatDialog.changeDifficulty")}
            </Button>
          ) : null}
        </div>
      </div>
    </Dialog>
  );
};

export default DefeatDialog;
