import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { Dialog } from "@components";
import {
  SIMPLE_CHALLENGE_POINTS,
  COMPLEX_CHALLENGE_POINTS,
} from "@domain/challenges";
import { useTranslation } from "@i18n";
import { DAILY_CHALLENGES_DIALOG_TITLE_ID } from "./constants";
import type { ChallengesDialogProps } from "./types";
import { ChallengeRow } from "./ChallengeRow";
import { formatCountdown } from "./utils";

const ChallengesDialog = ({
  visible,
  challenges,
  progress,
  millisUntilEndOfDay,
  onClose,
}: ChallengesDialogProps) => {
  const { t } = useTranslation();
  const [remainingMs, setRemainingMs] = useState(millisUntilEndOfDay);
  const [isCountdownTickAnimating, setIsCountdownTickAnimating] =
    useState(false);

  const completed = new Set(
    progress.filter((p) => p.completed).map((p) => p.challengeId),
  );

  const simpleCompleted = completed.has(challenges.simple.id);
  const complexCompleted = completed.has(challenges.complex.id);
  const countdown = useMemo(() => formatCountdown(remainingMs), [remainingMs]);

  useEffect(() => {
    setRemainingMs(millisUntilEndOfDay);
  }, [millisUntilEndOfDay]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (millisUntilEndOfDay <= 0) {
      setRemainingMs(0);
      return;
    }

    const startedAt = Date.now();
    const initialRemainingMs = millisUntilEndOfDay;
    const interval = window.setInterval(() => {
      const elapsedMs = Date.now() - startedAt;
      const nextRemainingMs = Math.max(0, initialRemainingMs - elapsedMs);
      setRemainingMs(nextRemainingMs);
      setIsCountdownTickAnimating(true);

      if (nextRemainingMs === 0) {
        window.clearInterval(interval);
      }
    }, 1_000);

    return () => window.clearInterval(interval);
  }, [millisUntilEndOfDay, visible]);

  useEffect(() => {
    if (!isCountdownTickAnimating) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsCountdownTickAnimating(false);
    }, 320);

    return () => window.clearTimeout(timeout);
  }, [isCountdownTickAnimating]);

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      titleId={DAILY_CHALLENGES_DIALOG_TITLE_ID}
      title={t("challenges.title")}
      panelClassName="max-w-md"
    >
      <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {t("challenges.dailySectionTitle")}
      </h3>
      <div className="mt-2 space-y-3">
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
        <span
          aria-live="polite"
          className={`inline-block font-mono tabular-nums transition-all duration-300 ease-out`}
        >
          {t("challenges.dailyResetsIn")}
        </span>
        <span
          aria-live="polite"
          className={`inline-block font-mono tabular-nums transition-all duration-300 ease-out ${
            isCountdownTickAnimating
              ? "scale-105 opacity-85"
              : "scale-100 opacity-100"
          }`}
        >
          {countdown}
          <FontAwesomeIcon className="ml-2" icon={faClock} />
        </span>
      </div>
    </Dialog>
  );
};

export default ChallengesDialog;
