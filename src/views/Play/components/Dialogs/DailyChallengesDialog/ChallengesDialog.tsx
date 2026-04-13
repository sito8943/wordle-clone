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

  const completed = new Set(
    progress.filter((p) => p.completed).map((p) => p.challengeId),
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

      <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
        <FontAwesomeIcon icon={faClock} />
        <span>
          {t("challenges.dailyResetsIn", {
            countdown: formatCountdown(millisUntilEndOfDay),
          })}
        </span>
      </div>
    </Dialog>
  );
};

export default ChallengesDialog;
