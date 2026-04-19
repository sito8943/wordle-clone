import { useEffect, useState, type SyntheticEvent } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { Dialog } from "@components";
import { useTranslation } from "@i18n";
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
  const [selectedModeId, setSelectedModeId] = useState<GameModeId | null>(null);

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
                <Link
                  to={mode.to}
                  className="group flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-300 bg-white/80 px-4 py-6 text-center transition-all hover:-translate-y-0.5 hover:border-primary dark:border-neutral-700 dark:bg-neutral-800/60 dark:hover:border-primary"
                >
                  <FontAwesomeIcon
                    icon={mode.icon}
                    aria-hidden="true"
                    className={`text-3xl transition-[scale] group-hover:scale-110 ${mode.iconClassName}`}
                  />
                  <span className="slab text-xl text-neutral-800 dark:text-neutral-100">
                    {modeName}
                  </span>
                </Link>

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
