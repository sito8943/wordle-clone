import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@i18n";
import {
  Alert,
  Button,
  ErrorBoundary,
  ErrorFallback,
  FireStreak,
} from "@components";
import { useAnimatedPresence } from "@hooks";
import { useScoreboardController } from "./hooks";

const ALERT_EXIT_MS = 200;
const SCOREBOARD_DATE_DROPDOWN_MIN_HEIGHT_PX = 56;

const Scoreboard = (): JSX.Element => {
  const { t } = useTranslation();
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [expandedEntryPlacement, setExpandedEntryPlacement] = useState<
    "above" | "below"
  >("below");
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const {
    convexEnabled,
    source,
    loading,
    error,
    scores,
    currentClientRank,
    currentClientOutsideTop,
    refresh,
  } = useScoreboardController();

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
  const getDropdownPlacementForEntry = useCallback(
    (entryId: string): "above" | "below" => {
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
      if (expandedEntryId === entryId) {
        setExpandedEntryId(null);
        return;
      }

      setExpandedEntryPlacement(getDropdownPlacementForEntry(entryId));
      setExpandedEntryId(entryId);
    },
    [expandedEntryId, getDropdownPlacementForEntry],
  );

  useEffect(() => {
    if (!expandedEntryId) {
      return;
    }

    if (loading) {
      setExpandedEntryId(null);
      return;
    }

    const expandedEntryStillVisible = scores.some(
      (entry) => entry.id === expandedEntryId,
    );

    if (!expandedEntryStillVisible) {
      setExpandedEntryId(null);
    }
  }, [expandedEntryId, loading, scores]);

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

                    const dropdownRow = isExpanded ? (
                      <tr
                        key={`${rowKey}-dropdown`}
                        className="border-t border-neutral-200/70 bg-neutral-50/90 dark:border-neutral-700/70 dark:bg-neutral-900/40"
                      >
                        <td className="scoreboard-cell py-2" colSpan={3}>
                          <div
                            id={`scoreboard-date-dropdown-${entry.id}`}
                            className="inline-flex max-w-full items-center gap-2 rounded border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-700 shadow-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                          >
                            <span className="font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                              {t("scoreboard.headers.date")}
                            </span>
                            <span className="truncate">{entry.formattedDate}</span>
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
                        className={`scoreboard-row-entrance border-t border-neutral-200 dark:border-neutral-700 ${
                          entry.isCurrentClient
                            ? "scoreboard-current-player-row"
                            : ""
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
                            onClick={() => toggleEntryDateDropdown(entry.id)}
                            aria-expanded={isExpanded}
                            aria-controls={`scoreboard-date-dropdown-${entry.id}`}
                            className="w-full cursor-pointer rounded-sm text-left outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                          >
                            {entry.nick}
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

                    if (dropdownRow && expandedEntryPlacement === "above") {
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
