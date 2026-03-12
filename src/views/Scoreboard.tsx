import { useCallback, useEffect, useState, type JSX } from "react";
import type { ScoreEntry } from "../api/score/types";
import { useApi } from "../providers";

const SCORE_LIMIT = 10;

const formatDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const Scoreboard = (): JSX.Element => {
  const { scoreClient, convexEnabled } = useApi();

  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [source, setSource] = useState<"convex" | "local">("local");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadScores = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await scoreClient.listTopScores(SCORE_LIMIT);
      setScores(result.scores);
      setSource(result.source);
    } catch (currentError) {
      const message =
        currentError instanceof Error
          ? currentError.message
          : "Failed to load scoreboard.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [scoreClient]);

  useEffect(() => {
    void loadScores();
  }, [loadScores]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Scoreboard</h2>
        <button
          onClick={() => void loadScores()}
          className="rounded bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-700"
        >
          Refresh
        </button>
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
                    {formatDate(entry.createdAt)}
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
