import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import { faRotateRight, faShieldHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "@i18n";
import {
  Alert,
  Button,
  ErrorBoundary,
  ErrorFallback,
  FireStreak,
} from "@components";
import { SCOREBOARD_MODE_IDS } from "@domain/wordle";
import type { ScoreboardModeId } from "@domain/wordle";
import { useAnimatedPresence, useAnimationsPreference } from "@hooks";
import {
  ALERT_EXIT_MS,
  SCOREBOARD_DATE_DROPDOWN_EXIT_MS,
  SCOREBOARD_DATE_DROPDOWN_MIN_HEIGHT_PX,
} from "./constants";
import { useScoreboardController } from "./hooks";
import type { DropdownPlacement } from "./types";

const Scoreboard = (): JSX.Element => {
  const { t } = useTranslation();
  const [selectedModeId, setSelectedModeId] = useState<ScoreboardModeId>(
    SCOREBOARD_MODE_IDS.CLASSIC,
  );
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [expandedEntryPlacement, setExpandedEntryPlacement] =
    useState<DropdownPlacement>("below");
  const [closingEntryId, setClosingEntryId] = useState<string | null>(null);
  const [closingEntryPlacement, setClosingEntryPlacement] =
    useState<DropdownPlacement>("below");
  const [pendingEntryId, setPendingEntryId] = useState<string | null>(null);
  const [pendingEntryPlacement, setPendingEntryPlacement] =
    useState<DropdownPlacement>("below");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const dropdownExitTimeoutRef = useRef<number | null>(null);
  const dropdownSwitchTimeoutRef = useRef<number | null>(null);
  const {
    convexEnabled,
    source,
    loading,
    error,
    scores,
    currentClientRank,
    currentClientOutsideTop,
    refresh,
  } = useScoreboardController(selectedModeId);
  const { animationsDisabled } = useAnimationsPreference();

  const convexAlert = useAnimatedPresence(!convexEnabled, ALERT_EXIT_MS);
  const offlineAlert = useAnimatedPresence(
    convexEnabled && source === "local",
    ALERT_EXIT_MS,
  );
  const errorAlert = useAnimatedPresence(!!error, ALERT_EXIT_MS);
  const rankAlert = useAnimatedPresence(
    currentClientOutsideTop && currentClientRank !== null,
    ALERT_EXIT_MS,
  );
  const dropdownAnimationsEnabled =
    !animationsDisabled && !prefersReducedMotion;
  const dropdownExitDurationMs = dropdownAnimationsEnabled
    ? SCOREBOARD_DATE_DROPDOWN_EXIT_MS
    : 0;

  const clearDropdownSwitchTimeout = useCallback(() => {
    if (dropdownSwitchTimeoutRef.current !== null) {
      window.clearTimeout(dropdownSwitchTimeoutRef.current);
      dropdownSwitchTimeoutRef.current = null;
    }
  }, []);
  const clearDropdownExitTimeout = useCallback(() => {
    if (dropdownExitTimeoutRef.current !== null) {
      window.clearTimeout(dropdownExitTimeoutRef.current);
      dropdownExitTimeoutRef.current = null;
    }
  }, []);

  const openDropdownForEntry = useCallback(
    (entryId: string, placement: DropdownPlacement) => {
      setExpandedEntryPlacement(placement);
      setExpandedEntryId(entryId);
    },
    [],
  );

  const startDropdownCloseAnimation = useCallback(
    (entryId: string, placement: DropdownPlacement) => {
      if (dropdownExitDurationMs <= 0) {
        clearDropdownExitTimeout();
        setClosingEntryId(null);
        return;
      }

      clearDropdownExitTimeout();
      setClosingEntryId(entryId);
      setClosingEntryPlacement(placement);
      dropdownExitTimeoutRef.current = window.setTimeout(() => {
        dropdownExitTimeoutRef.current = null;
        setClosingEntryId((current) => (current === entryId ? null : current));
      }, dropdownExitDurationMs);
    },
    [clearDropdownExitTimeout, dropdownExitDurationMs],
  );
  const getDropdownPlacementForEntry = useCallback(
    (entryId: string): DropdownPlacement => {
      if (typeof window === "undefined") {
        return "below";
      }

      const row = rowRefs.current[entryId];
      if (!row) {
        return "below";
      }

      const rowRect = row.getBoundingClientRect();
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
      const spaceAbove = rowRect.top;
      const spaceBelow = viewportHeight - rowRect.bottom;

      if (
        spaceBelow >= SCOREBOARD_DATE_DROPDOWN_MIN_HEIGHT_PX ||
        spaceBelow >= spaceAbove
      ) {
        return "below";
      }

      return "above";
    },
    [],
  );
  const toggleEntryDateDropdown = useCallback(
    (entryId: string) => {
      clearDropdownSwitchTimeout();
      setPendingEntryId(null);

      if (expandedEntryId === entryId) {
        startDropdownCloseAnimation(entryId, expandedEntryPlacement);
        setExpandedEntryId(null);
        return;
      }

      const nextPlacement = getDropdownPlacementForEntry(entryId);

      if (expandedEntryId !== null) {
        startDropdownCloseAnimation(expandedEntryId, expandedEntryPlacement);
        setExpandedEntryId(null);

        if (dropdownAnimationsEnabled) {
          setPendingEntryId(entryId);
          setPendingEntryPlacement(nextPlacement);
          dropdownSwitchTimeoutRef.current = window.setTimeout(() => {
            dropdownSwitchTimeoutRef.current = null;
            setPendingEntryId(null);
            openDropdownForEntry(entryId, nextPlacement);
          }, dropdownExitDurationMs);
          return;
        }
      }

      openDropdownForEntry(entryId, nextPlacement);
    },
    [
      clearDropdownSwitchTimeout,
      dropdownAnimationsEnabled,
      dropdownExitDurationMs,
      expandedEntryId,
      expandedEntryPlacement,
      getDropdownPlacementForEntry,
      openDropdownForEntry,
      startDropdownCloseAnimation,
    ],
  );

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMediaQueryChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    handleMediaQueryChange();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleMediaQueryChange);
    } else {
      mediaQuery.addListener(handleMediaQueryChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handleMediaQueryChange);
      } else {
        mediaQuery.removeListener(handleMediaQueryChange);
      }
    };
  }, []);

  useEffect(() => {
    clearDropdownExitTimeout();
    clearDropdownSwitchTimeout();
    setExpandedEntryId(null);
    setClosingEntryId(null);
    setPendingEntryId(null);
  }, [clearDropdownExitTimeout, clearDropdownSwitchTimeout, selectedModeId]);

  useEffect(() => {
    if (!expandedEntryId) {
      return;
    }

    if (loading) {
      clearDropdownExitTimeout();
      clearDropdownSwitchTimeout();
      setClosingEntryId(null);
      setExpandedEntryId(null);
      setPendingEntryId(null);
      return;
    }

    const expandedEntryStillVisible = scores.some(
      (entry) => entry.id === expandedEntryId,
    );

    if (!expandedEntryStillVisible) {
      clearDropdownExitTimeout();
      clearDropdownSwitchTimeout();
      setClosingEntryId(null);
      setExpandedEntryId(null);
      setPendingEntryId(null);
    }
  }, [
    clearDropdownExitTimeout,
    clearDropdownSwitchTimeout,
    expandedEntryId,
    loading,
    scores,
  ]);

  useEffect(() => {
    if (dropdownAnimationsEnabled) {
      return;
    }

    clearDropdownExitTimeout();
    clearDropdownSwitchTimeout();
    setClosingEntryId(null);

    if (pendingEntryId !== null) {
      openDropdownForEntry(pendingEntryId, pendingEntryPlacement);
      setPendingEntryId(null);
    }
  }, [
    clearDropdownExitTimeout,
    clearDropdownSwitchTimeout,
    dropdownAnimationsEnabled,
    openDropdownForEntry,
    pendingEntryId,
    pendingEntryPlacement,
  ]);

  useEffect(
    () => () => {
      clearDropdownExitTimeout();
      clearDropdownSwitchTimeout();
    },
    [clearDropdownExitTimeout, clearDropdownSwitchTimeout],
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 py-8">
      <div
        className="settings-entrance my-0!"
        style={{ animationDelay: "0ms" }}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="page-title">{t("scoreboard.title")}</h2>
          <Button
            onClick={() => void refresh()}
            aria-label={t("scoreboard.refreshAriaLabel")}
            icon={faRotateRight}
            variant="ghost"
            iconClassName="text-lg"
            className="mobile-compact-button"
            hideLabelOnMobile
          >
            {t("common.refresh")}
          </Button>
        </div>
        <div
          className="mt-3 inline-flex rounded border border-neutral-300 bg-neutral-50 p-1 dark:border-neutral-700 dark:bg-neutral-900/50"
          role="group"
          aria-label={t("scoreboard.modeSelectorAriaLabel")}
        >
          <Button
            variant={
              selectedModeId === SCOREBOARD_MODE_IDS.CLASSIC ? "solid" : "ghost"
            }
            color={
              selectedModeId === SCOREBOARD_MODE_IDS.CLASSIC
                ? "primary"
                : "neutral"
            }
            className="px-3 py-1.5 text-xs"
            onClick={() => setSelectedModeId(SCOREBOARD_MODE_IDS.CLASSIC)}
            aria-pressed={selectedModeId === SCOREBOARD_MODE_IDS.CLASSIC}
          >
            {t("gameModes.modes.classic.name")}
          </Button>
          <Button
            variant={
              selectedModeId === SCOREBOARD_MODE_IDS.LIGHTNING
                ? "solid"
                : "ghost"
            }
            color={
              selectedModeId === SCOREBOARD_MODE_IDS.LIGHTNING
                ? "primary"
                : "neutral"
            }
            className="px-3 py-1.5 text-xs"
            onClick={() => setSelectedModeId(SCOREBOARD_MODE_IDS.LIGHTNING)}
            aria-pressed={selectedModeId === SCOREBOARD_MODE_IDS.LIGHTNING}
          >
            {t("gameModes.modes.lightning.name")}
          </Button>
          <Button
            variant={
              selectedModeId === SCOREBOARD_MODE_IDS.DAILY ? "solid" : "ghost"
            }
            color={
              selectedModeId === SCOREBOARD_MODE_IDS.DAILY
                ? "primary"
                : "neutral"
            }
            className="px-3 py-1.5 text-xs"
            onClick={() => setSelectedModeId(SCOREBOARD_MODE_IDS.DAILY)}
            aria-pressed={selectedModeId === SCOREBOARD_MODE_IDS.DAILY}
          >
            {t("gameModes.modes.daily.name")}
          </Button>
        </div>
      </div>

      {convexAlert.shouldRender && (
        <div className={convexAlert.isExiting ? "alert-exit" : "alert-enter"}>
          <Alert
            message={t("scoreboard.convexNotConfigured")}
            color="warning"
          />
        </div>
      )}

      {offlineAlert.shouldRender && (
        <div className={offlineAlert.isExiting ? "alert-exit" : "alert-enter"}>
          <Alert message={t("scoreboard.offlineFallback")} color="info" />
        </div>
      )}

      {errorAlert.shouldRender && (
        <div className={errorAlert.isExiting ? "alert-exit" : "alert-enter"}>
          <Alert message={error} color="danger" />
        </div>
      )}

      {rankAlert.shouldRender && (
        <div className={rankAlert.isExiting ? "alert-exit" : "alert-enter"}>
          <Alert
            message={t("scoreboard.currentPosition", {
              shownRank: scores.length,
              realRank: currentClientRank,
            })}
            color="success"
          />
        </div>
      )}

      <div
        className="settings-entrance my-0!"
        style={{ animationDelay: "160ms" }}
      >
        <ErrorBoundary
          name="scoreboard-table"
          resetKeys={[scores.length, loading, source, currentClientRank]}
          fallback={() => (
            <ErrorFallback
              title={t("errors.scoreboard.title")}
              description={t("errors.scoreboard.description")}
              actionLabel={t("errors.scoreboard.action")}
            />
          )}
        >
          <section className="w-full overflow-hidden rounded border border-neutral-300 bg-white text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-100 dark:bg-neutral-700/80">
                <tr>
                  <th className="scoreboard-header-cell">
                    {t("scoreboard.headers.rank")}
                  </th>
                  <th className="scoreboard-header-cell">
                    {t("scoreboard.headers.nick")}
                  </th>
                  <th className="scoreboard-header-cell">
                    {t("scoreboard.headers.score")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className="scoreboard-placeholder-cell" colSpan={3}>
                      {t("scoreboard.loading")}
                    </td>
                  </tr>
                )}

                {!loading && scores.length === 0 && (
                  <tr>
                    <td className="scoreboard-placeholder-cell" colSpan={3}>
                      {t("scoreboard.empty")}
                    </td>
                  </tr>
                )}

                {!loading &&
                  scores.map((entry, index) => {
                    const rowKey = `${entry.id}-${entry.isPinnedCurrentClient ? "pinned" : "top"}`;
                    const isExpanded = expandedEntryId === entry.id;
                    const showWinnerShield = entry.hasWonDailyToday === true;

                    const isClosing =
                      closingEntryId === entry.id && !isExpanded;
                    const shouldRenderDropdown = isExpanded || isClosing;
                    const dropdownPlacement = isExpanded
                      ? expandedEntryPlacement
                      : closingEntryPlacement;
                    const dropdownAnimationClass = isClosing
                      ? "scoreboard-date-dropdown-exit"
                      : "scoreboard-date-dropdown-enter";

                    const dropdownRow = shouldRenderDropdown ? (
                      <tr
                        key={`${rowKey}-dropdown`}
                        className="border-t border-neutral-200/70 bg-neutral-50/90 dark:border-neutral-700/70 dark:bg-neutral-900/40"
                      >
                        <td className="scoreboard-cell py-2" colSpan={3}>
                          <div
                            id={`scoreboard-date-dropdown-${entry.id}`}
                            className={`${dropdownAnimationClass} inline-flex max-w-full items-center gap-2 rounded border border-neutral-300/0 bg-white/0 px-3 py-1.5 text-xs text-neutral-700 shadow-sm dark:border-neutral-600/0 dark:bg-neutral-800/0 dark:text-neutral-200`}
                            aria-hidden={isClosing}
                          >
                            <span className="font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                              {t("scoreboard.headers.date")}
                            </span>
                            <span className="truncate">
                              {entry.formattedDate}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : null;

                    const scoreRow = (
                      <tr
                        key={rowKey}
                        ref={(node) => {
                          rowRefs.current[entry.id] = node;
                        }}
                        onClick={() => toggleEntryDateDropdown(entry.id)}
                        className={`scoreboard-row-entrance cursor-pointer border-t border-neutral-200 transition-colors duration-200 dark:border-neutral-700 ${
                          entry.isCurrentClient
                            ? "scoreboard-current-player-row hover:bg-emerald-50/70 dark:hover:bg-emerald-950/20"
                            : ""
                        } ${
                          entry.isCurrentClient
                            ? ""
                            : "hover:bg-neutral-100/80 dark:hover:bg-neutral-700/30"
                        }`}
                        style={{ animationDelay: `${240 + index * 50}ms` }}
                      >
                        <td className="scoreboard-cell font-semibold text-xs">
                          <div className="flex flex-col">
                            <span>#{entry.realRank ?? entry.displayRank}</span>
                          </div>
                        </td>
                        <td className="scoreboard-cell">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleEntryDateDropdown(entry.id);
                            }}
                            aria-expanded={isExpanded}
                            aria-controls={`scoreboard-date-dropdown-${entry.id}`}
                            className="w-full cursor-pointer rounded-sm text-left outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                          >
                            <span className="inline-flex items-center gap-1.5">
                              <span>{entry.nick}</span>
                              {showWinnerShield && (
                                <FontAwesomeIcon
                                  icon={faShieldHeart}
                                  aria-hidden="true"
                                  className="text-xs text-sky-500 dark:text-sky-300 boost-animation-infinite"
                                />
                              )}
                            </span>
                          </button>
                        </td>
                        <td className="scoreboard-cell">
                          <div className="flex items-center gap-2">
                            <span>{entry.score}</span>
                            {entry.streak >= 2 && (
                              <FireStreak
                                streak={entry.streak}
                                size="sm"
                                noLabel
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );

                    if (dropdownRow && dropdownPlacement === "above") {
                      return [dropdownRow, scoreRow];
                    }

                    return [scoreRow, dropdownRow];
                  })}
              </tbody>
            </table>
          </section>
        </ErrorBoundary>
      </div>
    </main>
  );
};

export default Scoreboard;
