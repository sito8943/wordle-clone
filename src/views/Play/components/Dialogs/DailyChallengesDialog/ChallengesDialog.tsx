import { useMemo } from "react";
import { CountdownBadge, Dialog } from "@components";
import {
  SIMPLE_CHALLENGE_POINTS,
  COMPLEX_CHALLENGE_POINTS,
} from "@domain/challenges";
import { useTranslation } from "@i18n";
import { DAILY_CHALLENGES_DIALOG_TITLE_ID } from "./constants";
import type { ChallengesDialogProps } from "./types";
import { ChallengeRow } from "./ChallengeRow";

const ChallengesDialog = ({
  visible,
  challenges,
  progress,
  millisUntilEndOfDay,
  onClose,
}: ChallengesDialogProps) => {
  const { t } = useTranslation();
  const completed = useMemo(
    () =>
      new Set(progress.filter((p) => p.completed).map((p) => p.challengeId)),
    [progress],
  );

  const simpleCompleted = completed.has(challenges.simple.id);
  const complexCompleted = completed.has(challenges.complex.id);

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

      <CountdownBadge
        className="mt-4"
        visible={visible}
        millisUntilTarget={millisUntilEndOfDay}
        label={t("challenges.dailyResetsIn")}
      />
    </Dialog>
  );
};

export default ChallengesDialog;
