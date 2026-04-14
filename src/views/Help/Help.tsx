import type { JSX } from "react";
import { Link } from "react-router";
import { ROUTES } from "@config/routes";
import { NORMAL_DICTIONARY_ROW_BONUS } from "@domain/wordle";
import { useTranslation } from "@i18n";

const Help = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 py-8 pb-16">
      <section
        className="settings-entrance my-0!"
        style={{ animationDelay: "0ms" }}
      >
        <h2 className="page-title">{t("play.helpDialog.title")}</h2>
        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
          {t("play.helpDialog.description")}
        </p>
      </section>

      <section
        className="settings-entrance my-0!"
        style={{ animationDelay: "80ms" }}
      >
        <h3 className="text-base font-semibold">
          {t("play.helpDialog.rulesTitle")}
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-800 dark:text-neutral-200">
          <li>{t("play.helpDialog.rules.guessLength")}</li>
          <li>{t("play.helpDialog.rules.pressEnter")}</li>
          <li>{t("play.helpDialog.rules.nonDictionary")}</li>
          <li>{t("play.helpDialog.rules.insaneDictionary")}</li>
          <li>{t("play.helpDialog.rules.green")}</li>
          <li>{t("play.helpDialog.rules.yellow")}</li>
          <li>{t("play.helpDialog.rules.gray")}</li>
        </ul>
      </section>

      <section
        className="settings-entrance my-0!"
        style={{ animationDelay: "160ms" }}
      >
        <h3 className="text-base font-semibold">
          {t("play.helpDialog.scoringTitle")}
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-800 dark:text-neutral-200">
          <li>{t("play.helpDialog.scoring.basePoints")}</li>
          <li>{t("play.helpDialog.scoring.streakBonus")}</li>
          <li>{t("play.helpDialog.scoring.easy")}</li>
          <li>
            {t("play.helpDialog.scoring.normal", {
              bonus: NORMAL_DICTIONARY_ROW_BONUS,
            })}
          </li>
          <li>{t("play.helpDialog.scoring.hard")}</li>
          <li>{t("play.helpDialog.scoring.insane")}</li>
          <li>{t("play.helpDialog.scoring.final")}</li>
        </ul>
        <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-300">
          {t("play.helpDialog.changeDifficultyPrefix")}{" "}
          <Link
            to={`${ROUTES.SETTINGS}#difficulty`}
            className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:text-primary/80"
          >
            {t("play.helpDialog.changeDifficultyLink")}
          </Link>
          .
        </p>
      </section>
    </main>
  );
};

export default Help;
