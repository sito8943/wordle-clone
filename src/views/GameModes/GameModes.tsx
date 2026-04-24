import { useCallback, useEffect, useState, type SyntheticEvent } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faCalendarXmark,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { CountdownBadge, Dialog } from "@components";
import { useDailyModePrerequisites } from "@hooks/useDailyModePrerequisites";
import { useTranslation } from "@i18n";
import { usePlayer } from "@providers";
import {
  getMillisUntilEndOfDayUTC,
  readDailyModeOutcomeForDate,
} from "@domain/wordle";
import {
  hasSeenEntryAnimationInSession,
  markEntryAnimationAsSeenInSession,
} from "@utils/entryAnimationSession";
import {
  GAME_MODE_CARDS,
  GAME_MODE_DETAIL_KEYS,
  GAME_MODES_ENTRY_ANIMATION_SESSION_KEY,
  GAME_MODES_NAV_ITEMS_ENTRY_INITIAL_DELAY_MS,
  GAME_MODES_NAV_ITEMS_ENTRY_STAGGER_DELAY_MS,
  GAME_MODE_TRANSLATION_VALUES,
} from "./constants";
import type { GameModeId } from "./types";

const GameModes = () => {
  const { t } = useTranslation();
  const { player } = usePlayer();
  const { status: dailyModeRequirementsStatus } = useDailyModePrerequisites();
  const readDailyModeOutcome = useCallback(
    () =>
      readDailyModeOutcomeForDate(player.code) ?? readDailyModeOutcomeForDate(),
    [player.code],
  );
  const [selectedModeId, setSelectedModeId] = useState<GameModeId | null>(null);
  const [dailyModeOutcome, setDailyModeOutcome] = useState<
    "won" | "lost" | null
  >(() => readDailyModeOutcome());
  const [millisUntilDailyReset, setMillisUntilDailyReset] = useState(
    getMillisUntilEndOfDayUTC,
  );

  const [shouldAnimateEntry] = useState(
    () =>
      !hasSeenEntryAnimationInSession(GAME_MODES_ENTRY_ANIMATION_SESSION_KEY),
  );
  const [entryAnimationReady, setEntryAnimationReady] = useState(
    () => !shouldAnimateEntry,
  );
  useEffect(() => {
    if (!shouldAnimateEntry) {
      return;
    }

    markEntryAnimationAsSeenInSession(GAME_MODES_ENTRY_ANIMATION_SESSION_KEY);
    const frameId = window.requestAnimationFrame(() => {
      setEntryAnimationReady(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [shouldAnimateEntry]);

  useEffect(() => {
    setDailyModeOutcome(readDailyModeOutcome());
    setMillisUntilDailyReset(getMillisUntilEndOfDayUTC());
  }, [readDailyModeOutcome]);

  useEffect(() => {
    if (!dailyModeOutcome) {
      return;
    }

    const interval = window.setInterval(() => {
      const nextMillisUntilReset = getMillisUntilEndOfDayUTC();
      setMillisUntilDailyReset(nextMillisUntilReset);

      if (nextMillisUntilReset === 0) {
        setDailyModeOutcome(readDailyModeOutcome());
        window.clearInterval(interval);
      }
    }, 1_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [dailyModeOutcome, readDailyModeOutcome]);

  const getItemTransitionDelay = (index: number) =>
    `${GAME_MODES_NAV_ITEMS_ENTRY_INITIAL_DELAY_MS + index * GAME_MODES_NAV_ITEMS_ENTRY_STAGGER_DELAY_MS}ms`;

  const openModeInfoDialog = (event: SyntheticEvent, modeId: GameModeId) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedModeId(modeId);
  };

  const closeModeInfoDialog = () => {
    setSelectedModeId(null);
  };

  const selectedModeName = selectedModeId
    ? t(`gameModes.modes.${selectedModeId}.name`)
    : "";
  const selectedModeDetailKeys = selectedModeId
    ? GAME_MODE_DETAIL_KEYS[selectedModeId]
    : [];

  return (
    <main className="page-centered flex-1 gap-8 px-4 py-8">
      <header className="flex max-w-xl flex-col items-center gap-2 text-center">
        <h2
          className={`page-title transition-[opacity,translate] duration-500 ease-in-out motion-reduce:transition-none ${
            entryAnimationReady
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3"
          }`}
        >
          {t("gameModes.title")}
        </h2>
        <p
          className={`text-sm text-neutral-600 dark:text-neutral-300 transition-[opacity,translate] duration-500 ease-out motion-reduce:transition-none ${
            entryAnimationReady
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3"
          }`}
        >
          {t("gameModes.description")}
        </p>
      </header>

      <nav
        className="w-full max-w-5xl"
        aria-label={t("gameModes.navigationAriaLabel")}
      >
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {GAME_MODE_CARDS.map((mode, index) => {
            const modeName = t(`gameModes.modes.${mode.id}.name`);
            const dailyModeDisabled =
              mode.id === "daily" && dailyModeRequirementsStatus !== "ready";
            const dailyModeStatusMessage = dailyModeDisabled
              ? dailyModeRequirementsStatus === "loading"
                ? t("gameModes.modes.daily.access.loading")
                : t("gameModes.modes.daily.access.unavailable")
              : null;
            const dailyOutcomeKnown =
              mode.id === "daily" && dailyModeOutcome !== null;
            const modeIcon =
              mode.id === "daily"
                ? dailyModeOutcome === "won"
                  ? faCalendarCheck
                  : dailyModeOutcome === "lost"
                    ? faCalendarXmark
                    : mode.icon
                : mode.icon;
            const modeIconClassName =
              mode.id === "daily"
                ? dailyModeOutcome === "won"
                  ? "text-emerald-600 dark:text-emerald-300"
                  : dailyModeOutcome === "lost"
                    ? "text-red-600 dark:text-red-300"
                    : mode.iconClassName
                : mode.iconClassName;
            const cardClassName = `group flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-300 bg-white/80 px-4 py-6 text-center transition-all dark:border-neutral-700 dark:bg-neutral-800/60 ${
              dailyModeDisabled
                ? "cursor-not-allowed opacity-60"
                : "hover:-translate-y-0.5 hover:border-primary dark:hover:border-primary"
            }`;

            return (
              <li
                key={mode.id}
                className={`relative transition-[scale,translate] duration-500 ease-out motion-reduce:transition-none ${
                  entryAnimationReady
                    ? "scale-100 translate-y-0"
                    : "scale-0 translate-y-1"
                }`}
                style={{ transitionDelay: getItemTransitionDelay(index) }}
              >
                {dailyModeDisabled ? (
                  <button
                    type="button"
                    disabled
                    className={cardClassName}
                    aria-label={modeName}
                  >
                    <FontAwesomeIcon
                      icon={modeIcon}
                      aria-hidden="true"
                      className={`text-3xl ${modeIconClassName}`}
                    />
                    <span className="slab text-xl text-neutral-800 dark:text-neutral-100">
                      {modeName}
                    </span>
                    {dailyModeStatusMessage ? (
                      <span className="text-xs text-neutral-600 dark:text-neutral-300">
                        {dailyModeStatusMessage}
                      </span>
                    ) : null}
                    {dailyOutcomeKnown ? (
                      <CountdownBadge
                        millisUntilTarget={millisUntilDailyReset}
                        label={t("challenges.dailyResetsIn")}
                        className="mt-1 w-full text-[11px] px-2 py-1"
                        labelClassName="text-[10px]"
                        countdownClassName="text-[11px]"
                      />
                    ) : null}
                  </button>
                ) : (
                  <Link to={mode.to} className={cardClassName}>
                    <FontAwesomeIcon
                      icon={modeIcon}
                      aria-hidden="true"
                      className={`text-3xl transition-[scale] group-hover:scale-110 ${modeIconClassName}`}
                    />
                    <span className="slab text-xl text-neutral-800 dark:text-neutral-100">
                      {modeName}
                    </span>
                    {dailyModeStatusMessage ? (
                      <span className="text-xs text-neutral-600 dark:text-neutral-300">
                        {dailyModeStatusMessage}
                      </span>
                    ) : null}
                    {dailyOutcomeKnown ? (
                      <CountdownBadge
                        millisUntilTarget={millisUntilDailyReset}
                        label={t("challenges.dailyResetsIn")}
                        className="mt-1 w-full text-[11px] px-2 py-1"
                        labelClassName="text-[10px]"
                        countdownClassName="text-[11px]"
                      />
                    ) : null}
                  </Link>
                )}

                <button
                  type="button"
                  className="absolute top-2 right-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white/90 text-neutral-600 transition-colors hover:text-primary dark:border-neutral-600 dark:bg-neutral-900/90 dark:text-neutral-200 dark:hover:text-primary"
                  aria-label={t("gameModes.modeInfoButtonAriaLabel", {
                    mode: modeName,
                  })}
                  title={t("gameModes.modeInfoTooltip")}
                  onClick={(event) => openModeInfoDialog(event, mode.id)}
                  onTouchEnd={(event) => openModeInfoDialog(event, mode.id)}
                >
                  <FontAwesomeIcon icon={faCircleInfo} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <Dialog
        visible={selectedModeId !== null}
        onClose={closeModeInfoDialog}
        titleId="game-mode-info-dialog-title"
        title={selectedModeName}
        description={t("gameModes.dialog.description")}
      >
        {selectedModeId ? (
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-700 dark:text-neutral-200">
            {selectedModeDetailKeys.map((detailKey) => (
              <li key={detailKey}>
                {t(detailKey, GAME_MODE_TRANSLATION_VALUES)}
              </li>
            ))}
          </ul>
        ) : null}
      </Dialog>
    </main>
  );
};

export default GameModes;
