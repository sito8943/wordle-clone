import type { JSX } from "react";
import { Link, useSearchParams } from "react-router";
import { ROUTE_ANCHORS, ROUTE_SEARCH_PARAMS, ROUTES } from "@config/routes";
import {
  MAX_STREAK_FOR_SCORE_MULTIPLIER,
  NORMAL_DICTIONARY_ROW_BONUS,
  resolveWordleModeId,
} from "@domain/wordle";
import { useTranslation } from "@i18n";
import { useFeatureFlags } from "@providers/FeatureFlags";
import {
  HELP_MODE_DETAIL_KEYS,
  HELP_MODE_TRANSLATION_VALUES,
} from "./constants";

const Help = (): JSX.Element => {
  const { t } = useTranslation();
  const {
    difficultyEasyEnabled,
    difficultyNormalEnabled,
    difficultyHardEnabled,
    difficultyInsaneEnabled,
  } = useFeatureFlags();
  const [searchParams] = useSearchParams();
  const modeQuery = searchParams.get(ROUTE_SEARCH_PARAMS.MODE);
  const modeId = resolveWordleModeId(modeQuery);
  const showModeRules = modeQuery !== null;
  const modeName = t(`gameModes.modes.${modeId}.name`);
  const modeDetailKeys = HELP_MODE_DETAIL_KEYS[modeId];
  const nonDictionaryRuleKey = (() => {
    if (difficultyEasyEnabled && difficultyNormalEnabled) {
      return "play.helpDialog.rules.nonDictionary";
    }

    if (difficultyEasyEnabled) {
      return "play.helpDialog.rules.nonDictionaryEasyOnly";
    }

    if (difficultyNormalEnabled) {
      return "play.helpDialog.rules.nonDictionaryNormalOnly";
    }

    return null;
  })();
  const dictionaryRuleKey = (() => {
    if (difficultyHardEnabled && difficultyInsaneEnabled) {
      return "play.helpDialog.rules.insaneDictionary";
    }

    if (difficultyHardEnabled) {
      return "play.helpDialog.rules.hardDictionaryOnly";
    }

    if (difficultyInsaneEnabled) {
      return "play.helpDialog.rules.insaneDictionaryOnly";
    }

    return null;
  })();
  const finalScoringKey = difficultyInsaneEnabled
    ? "play.helpDialog.scoring.final"
    : "play.helpDialog.scoring.finalNoInsane";

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
        <ul className="w-full mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-800 dark:text-neutral-200">
          <li>{t("play.helpDialog.rules.guessLength")}</li>
          <li>{t("play.helpDialog.rules.pressEnter")}</li>
          {nonDictionaryRuleKey ? <li>{t(nonDictionaryRuleKey)}</li> : null}
          {dictionaryRuleKey ? <li>{t(dictionaryRuleKey)}</li> : null}
          <li>{t("play.helpDialog.rules.green")}</li>
          <li>{t("play.helpDialog.rules.yellow")}</li>
          <li>{t("play.helpDialog.rules.gray")}</li>
        </ul>
      </section>

      {showModeRules ? (
        <section
          className="settings-entrance my-0!"
          style={{ animationDelay: "160ms" }}
        >
          <h3 className="text-base font-semibold">
            {t("play.helpDialog.modeTitle", { mode: modeName })}
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-800 dark:text-neutral-200">
            {modeDetailKeys.map((detailKey) => (
              <li key={detailKey}>
                {t(detailKey, HELP_MODE_TRANSLATION_VALUES)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section
        className="settings-entrance my-0!"
        style={{ animationDelay: showModeRules ? "240ms" : "160ms" }}
      >
        <h3 className="text-base font-semibold">
          {t("play.helpDialog.scoringTitle")}
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-800 dark:text-neutral-200">
          <li>{t("play.helpDialog.scoring.basePoints")}</li>
          <li>
            {t("play.helpDialog.scoring.streakBonus", {
              maxStreak: MAX_STREAK_FOR_SCORE_MULTIPLIER,
            })}
          </li>
          {difficultyEasyEnabled ? (
            <li>{t("play.helpDialog.scoring.easy")}</li>
          ) : null}
          {difficultyNormalEnabled ? (
            <li>
              {t("play.helpDialog.scoring.normal", {
                bonus: NORMAL_DICTIONARY_ROW_BONUS,
              })}
            </li>
          ) : null}
          {difficultyHardEnabled ? (
            <li>{t("play.helpDialog.scoring.hard")}</li>
          ) : null}
          {difficultyInsaneEnabled ? (
            <li>{t("play.helpDialog.scoring.insane")}</li>
          ) : null}
          <li>
            {t(finalScoringKey, {
              maxStreak: MAX_STREAK_FOR_SCORE_MULTIPLIER,
            })}
          </li>
        </ul>
        <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-300">
          {t("play.helpDialog.changeDifficultyPrefix")}{" "}
          <Link
            to={`${ROUTES.SETTINGS}${ROUTE_ANCHORS.DIFFICULTY}`}
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
