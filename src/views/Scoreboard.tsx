import type { JSX } from "react";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "../components";
import { useScoreboardController } from "../hooks";

const Scoreboard = (): JSX.Element => {
  const { convexEnabled, source, loading, error, scores, refresh } =
    useScoreboardController();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Scoreboard</h2>
        <IconButton
          onClick={() => void refresh()}
          ariaLabel="Refresh scores"
          label="Refresh"
          icon={faRotateRight}
          className="max-sm:px-2"
          hideLabelOnMobile
        />
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

      <section className="overflow-hidden rounded border border-neutral-300 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Nick</th>
              <th className="px-4 py-2">Score</th>
              <th className="px-4 py-2">Date</th>
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
              scores.map((entry, index) => (
                <tr key={entry.id} className="border-t border-neutral-200">
                  <td className="px-4 py-2 font-semibold">{index + 1}</td>
                  <td className="px-4 py-2">{entry.nick}</td>
                  <td className="px-4 py-2">{entry.score}</td>
                  <td className="px-4 py-2 text-neutral-600">
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
