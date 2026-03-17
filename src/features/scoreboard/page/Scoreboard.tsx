import type { JSX } from "react";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import {
  Button,
  ErrorBoundary,
  ErrorFallback,
  FireStreak,
} from "../../../components";
import { useScoreboardController } from "../../../hooks";

const Scoreboard = (): JSX.Element => {
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
        <h2 className="page-title">Scoreboard</h2>
        <Button
          onClick={() => void refresh()}
          aria-label="Refresh scores"
          icon={faRotateRight}
          className="mobile-compact-button"
          hideLabelOnMobile
        >
          Refresh
        </Button>
      </div>

      {!convexEnabled && (
        <p className="scoreboard-notice scoreboard-notice-amber">
          Convex is not configured (`VITE_CONVEX_URL`). Using local storage
          only.
        </p>
      )}

      {convexEnabled && source === "local" && (
        <p className="scoreboard-notice scoreboard-notice-sky">
          Offline fallback active. Showing cached local scores.
        </p>
      )}

      {error && (
        <p className="scoreboard-notice scoreboard-notice-red">{error}</p>
      )}

      {currentClientOutsideTop && currentClientRank !== null && (
        <p className="scoreboard-notice scoreboard-notice-emerald">
          You are shown as #{scores.length}. Real position: #{currentClientRank}
          .
        </p>
      )}

      <ErrorBoundary
        name="scoreboard-table"
        resetKeys={[scores.length, loading, source, currentClientRank]}
        fallback={({ reset }) => (
          <ErrorFallback
            title="Scoreboard table failed to render."
            description="Retry to load player rankings."
            actionLabel="Retry scoreboard"
            onAction={reset}
          />
        )}
      >
        <section className="overflow-hidden rounded border border-neutral-300 bg-white text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-100 dark:bg-neutral-700/80">
              <tr>
                <th className="scoreboard-header-cell">#</th>
                <th className="scoreboard-header-cell">Nick</th>
                <th className="scoreboard-header-cell">Score</th>
                <th className="scoreboard-header-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="scoreboard-placeholder-cell" colSpan={4}>
                    Loading scores...
                  </td>
                </tr>
              )}

              {!loading && scores.length === 0 && (
                <tr>
                  <td className="scoreboard-placeholder-cell" colSpan={4}>
                    No scores yet.
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
