import { Dialog } from "@components";
import { useTranslation } from "@i18n";
import { HELP_DIALOG_TITLE_ID } from "./constants";
import type { HelpDialogProps } from "./types";
import { Link } from "react-router";

const HelpDialog = ({ visible, onClose }: HelpDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      titleId={HELP_DIALOG_TITLE_ID}
      title={t("home.helpDialog.title")}
      description={t("home.helpDialog.description")}
      panelClassName="max-w-2xl"
    >
      <div className="mt-4 space-y-4 text-sm text-neutral-800 dark:text-neutral-200 overflow-auto">
        <section>
          <h3 className="text-base font-semibold">
            {t("home.helpDialog.rulesTitle")}
          </h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>{t("home.helpDialog.rules.guessLength")}</li>
            <li>{t("home.helpDialog.rules.pressEnter")}</li>
            <li>{t("home.helpDialog.rules.nonDictionary")}</li>
            <li>{t("home.helpDialog.rules.insaneDictionary")}</li>
            <li>{t("home.helpDialog.rules.green")}</li>
            <li>{t("home.helpDialog.rules.yellow")}</li>
            <li>{t("home.helpDialog.rules.gray")}</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base font-semibold">
            {t("home.helpDialog.scoringTitle")}
          </h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>{t("home.helpDialog.scoring.basePoints")}</li>
            <li>{t("home.helpDialog.scoring.streakBonus")}</li>
            <li>{t("home.helpDialog.scoring.easy")}</li>
            <li>{t("home.helpDialog.scoring.normal")}</li>
            <li>{t("home.helpDialog.scoring.hard")}</li>
            <li>{t("home.helpDialog.scoring.insane")}</li>
            <li>{t("home.helpDialog.scoring.final")}</li>
          </ul>
          <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-300">
            {t("home.helpDialog.changeDifficultyPrefix")}{" "}
            <Link
              to="/settings#difficulty"
              className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:text-primary/80"
            >
              {t("home.helpDialog.changeDifficultyLink")}
            </Link>
            .
          </p>
        </section>
      </div>
    </Dialog>
  );
};

export default HelpDialog;
