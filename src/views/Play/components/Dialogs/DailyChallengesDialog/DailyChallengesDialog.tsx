import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClock } from "@fortawesome/free-solid-svg-icons";
import { Dialog } from "@components";
import {
  SIMPLE_CHALLENGE_POINTS,
  COMPLEX_CHALLENGE_POINTS,
} from "@domain/challenges";
import { useTranslation } from "@i18n";
import type { RemoteChallenge } from "@api/challenges";
import { DAILY_CHALLENGES_DIALOG_TITLE_ID } from "./constants";
import type { DailyChallengesDialogProps } from "./types";

const formatCountdown = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
};

const ChallengeRow = ({
  challenge,
  completed,
  points,
}: {
  challenge: RemoteChallenge;
  completed: boolean;
  points: number;
}) => {
  const { t } = useTranslation();
  const nameKey =
    `challenges.names.${challenge.conditionKey}` as const;
  const descKey =
    `challenges.descriptions.${challenge.conditionKey}` as const;

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
        completed
          ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30"
          : "border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50"
      }`}
    >
      <div
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          completed
            ? "bg-green-500 text-white"
            : "border-2 border-neutral-300 dark:border-neutral-600"
        }`}
      >
        {completed && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-semibold ${completed ? "text-green-700 line-through dark:text-green-400" : "text-neutral-900 dark:text-neutral-100"}`}
          >
            {t(nameKey)}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
              challenge.type === "simple"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
            }`}
          >
            {challenge.type === "simple"
              ? t("challenges.simple")
              : t("challenges.complex")}
          </span>
          <span
            className={`ml-auto text-xs font-bold ${completed ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}
          >
            +{points} pts
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

const DailyChallengesDialog = ({
  visible,
  challenges,
  progress,
  millisUntilEndOfDay,
  onClose,
}: DailyChallengesDialogProps) => {
  const { t } = useTranslation();

  const completedIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.challengeId),
  );

  const simpleCompleted = completedIds.has(challenges.simple.id);
  const complexCompleted = completedIds.has(challenges.complex.id);

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      titleId={DAILY_CHALLENGES_DIALOG_TITLE_ID}
      title={t("challenges.title")}
      panelClassName="max-w-md"
    >
      <div className="mt-4 space-y-3">
        <ChallengeRow
          challenge={challenges.simple}
          completed={simpleCompleted}
          points={SIMPLE_CHALLENGE_POINTS}
        />
        <ChallengeRow
          challenge={challenges.complex}
          completed={complexCompleted}
          points={COMPLEX_CHALLENGE_POINTS}
        />
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
        <FontAwesomeIcon icon={faClock} />
        <span>{formatCountdown(millisUntilEndOfDay)}</span>
      </div>
    </Dialog>
  );
};

export default DailyChallengesDialog;
