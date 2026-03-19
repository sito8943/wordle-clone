import { Button, Dialog } from "@components";
import { useTranslation } from "@i18n";
import { DEFEAT_DIALOG_TITLE_ID } from "./constants";
import type { DefeatDialogProps } from "./types";

const DefeatDialog = ({
  visible,
  answer,
  bestStreak,
  onClose,
  onPlayAgain,
  onChangeDifficulty,
}: DefeatDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      titleId={DEFEAT_DIALOG_TITLE_ID}
      title={t("home.defeatDialog.title")}
      description={t("home.defeatDialog.description")}
      panelClassName="max-w-lg"
    >
      <div className="mt-5 space-y-5">
        <section className="rounded-2xl bg-rose-50 px-4 py-3 text-rose-950 dark:bg-rose-950/40 dark:text-rose-100">
          <p className="text-xs font-semibold uppercase tracking-[0.24em]">
            {t("home.endOfGame.wordLabel")}
          </p>
          <p className="mt-2 text-3xl font-black tracking-[0.18em]">
            {answer}
          </p>
        </section>

        <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          {t("home.defeatDialog.bestStreak", { count: bestStreak })}
        </p>

        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {t("home.defeatDialog.closingMessage")}
        </p>

        <div className="flex flex-wrap justify-end gap-3">
          <Button onClick={onPlayAgain}>{t("home.endOfGame.playAgain")}</Button>
          <Button
            onClick={onChangeDifficulty}
            variant="outline"
            color="neutral"
          >
            {t("home.defeatDialog.changeDifficulty")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default DefeatDialog;
