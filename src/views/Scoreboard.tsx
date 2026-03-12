import type { JSX } from "react";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { Button, FireStreak } from "../components";
import { useScoreboardController } from "../hooks";

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
        <h2 className="text-2xl font-bold">Scoreboard</h2>
        <Button
          onClick={() => void refresh()}
          aria-label="Refresh scores"
          icon={faRotateRight}
          className="max-sm:px-2"
          hideLabelOnMobile
        >
          Refresh
        </Button>
      </div>

      {!convexEnabled && (
        <p className="rounded border border-amber-300 bg-amber-100 px-3 py-2 text-sm text-amber-900">
          Convex is not configured (`VITE_CONVEX_URL`). Using local storage
          only.
        </p>
      )}

      {convexEnabled && source === "local" && (
        <p className="rounded border border-sky-300 bg-sky-100 px-3 py-2 text-sm text-sky-900">
          Offline fallback active. Showing cached local scores.
        </p>
      )}

      {error && (
        <p className="rounded border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      )}

      {currentClientOutsideTop && currentClientRank !== null && (
        <p className="rounded border border-emerald-300 bg-emerald-100 px-3 py-2 text-sm text-emerald-900">
          You are shown as #{scores.length}. Real position: #{currentClientRank}
          .
        </p>
      )}

      <section className="overflow-hidden rounded border border-neutral-300 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="px-4 py-2 text-xs">#</th>
              <th className="px-4 py-2 text-xs">Nick</th>
              <th className="px-4 py-2 text-xs">Score</th>
              <th className="px-4 py-2 text-xs">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-4 text-neutral-600" colSpan={4}>
                  Loading scores...
                </td>
              </tr>
            )}

            {!loading && scores.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-neutral-600" colSpan={4}>
                  No scores yet.
                </td>
              </tr>
            )}

            {!loading &&
              scores.map((entry) => (
                <tr
                  key={`${entry.id}-${entry.isPinnedCurrentClient ? "pinned" : "top"}`}
                  className={`border-t border-neutral-200 ${
                    entry.isCurrentClient ? "scoreboard-current-player-row" : ""
                  }`}
                >
                  <td className="px-4 py-2 font-semibold text-xs">
                    <div className="flex flex-col">
                      <span>#{entry.displayRank}</span>
                      {entry.isPinnedCurrentClient &&
                        entry.realRank !== null && (
                          <span className="text-xs font-medium text-emerald-700">
                            Real #{entry.realRank}
                          </span>
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-2">{entry.nick}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span>{entry.score}</span>
                      {entry.streak >= 2 && (
                        <FireStreak streak={entry.streak} size="sm" noLabel />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-neutral-600 text-xs">
                    {entry.formattedDate}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default Scoreboard;
