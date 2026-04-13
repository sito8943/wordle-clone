import type { RemoteChallenge } from "@api/challenges";
import { useTranslation } from "react-i18next";

export const ChallengeRow = ({
  challenge,
  completed,
  points,
}: {
  challenge: RemoteChallenge;
  completed: boolean;
  points: number;
}) => {
  const { t } = useTranslation();
  const nameKey = `challenges.names.${challenge.conditionKey}` as const;
  const descKey = `challenges.descriptions.${challenge.conditionKey}` as const;
  const typeLabel =
    challenge.type === "simple"
      ? t("challenges.simple")
      : challenge.type === "complex"
        ? t("challenges.complex")
        : t("challenges.weekly");
  const typeClassName =
    challenge.type === "simple"
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
      : challenge.type === "complex"
        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
        completed
          ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30"
          : "border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-semibold ${completed ? "text-green-700 line-through dark:text-green-400" : "text-neutral-900 dark:text-neutral-100"}`}
          >
            {t(nameKey)}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${typeClassName}`}
          >
            {typeLabel}
          </span>
          <span
            className={`ml-auto text-xs font-bold ${completed ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}
          >
            {t("challenges.points", { points })}
          </span>
        </div>
        <p
          className={`mt-1 text-xs ${completed ? "text-green-600/70 line-through dark:text-green-400/70" : "text-neutral-600 dark:text-neutral-400"}`}
        >
          {t(descKey)}
        </p>
      </div>
    </div>
  );
};
