import type { JSX } from "react";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@i18n";
import {
  Alert,
  Button,
  ErrorBoundary,
  ErrorFallback,
  FireStreak,
} from "@components";
import { useScoreboardController } from "./hooks";

const Scoreboard = (): JSX.Element => {
  const { t } = useTranslation();
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

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 py-8">
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

      {!convexEnabled && (
        <Alert message={t("scoreboard.convexNotConfigured")} color="warning" />
      )}

      {convexEnabled && source === "local" && (
        <Alert message={t("scoreboard.offlineFallback")} color="info" />
      )}

      {error && <Alert message={error} color="danger" />}

      {currentClientOutsideTop && currentClientRank !== null && (
        <Alert
          message={t("scoreboard.currentPosition", {
            shownRank: scores.length,
            realRank: currentClientRank,
          })}
          color="success"
        />
      )}

      <ErrorBoundary
        name="scoreboard-table"
        resetKeys={[scores.length, loading, source, currentClientRank]}
        fallback={({ reset }) => (
          <ErrorFallback
            title={t("errors.scoreboard.title")}
            description={t("errors.scoreboard.description")}
            actionLabel={t("errors.scoreboard.action")}
            onAction={reset}
          />
        )}
      >
        <section className="overflow-hidden rounded border border-neutral-300 bg-white text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
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
                <th className="scoreboard-header-cell">
                  {t("scoreboard.headers.date")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="scoreboard-placeholder-cell" colSpan={4}>
                    {t("scoreboard.loading")}
                  </td>
                </tr>
              )}

              {!loading && scores.length === 0 && (
                <tr>
                  <td className="scoreboard-placeholder-cell" colSpan={4}>
                    {t("scoreboard.empty")}
                  </td>
                </tr>
              )}

              {!loading &&
                scores.map((entry) => (
                  <tr
                    key={`${entry.id}-${entry.isPinnedCurrentClient ? "pinned" : "top"}`}
                    className={`border-t border-neutral-200 dark:border-neutral-700 ${
                      entry.isCurrentClient
                        ? "scoreboard-current-player-row"
                        : ""
                    }`}
                  >
                    <td className="scoreboard-cell font-semibold text-xs">
                      <div className="flex flex-col">
                        <span>#{entry.realRank ?? entry.displayRank}</span>
                      </div>
                    </td>
                    <td className="scoreboard-cell">{entry.nick}</td>
                    <td className="scoreboard-cell">
                      <div className="flex items-center gap-2">
                        <span>{entry.score}</span>
                        {entry.streak >= 2 && (
                          <FireStreak streak={entry.streak} size="sm" noLabel />
                        )}
                      </div>
                    </td>
                    <td className="scoreboard-cell text-xs text-neutral-600 dark:text-neutral-400">
                      {entry.formattedDate}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      </ErrorBoundary>
    </main>
  );
};

export default Scoreboard;
