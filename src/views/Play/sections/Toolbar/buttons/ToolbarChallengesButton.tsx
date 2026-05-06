import type { JSX } from "react";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@components";
import { useTranslation } from "@i18n";
import { usePlayView } from "@views/Play/providers";
import {
  TOOLBAR_COMPACT_BUTTON_CLASS_NAME,
  TOOLBAR_ICON_CLASS_NAME,
} from "./constants";

const ToolbarChallengesButton = (): JSX.Element | null => {
  const { t } = useTranslation();
  const { challengesEnabled, challenges } = usePlayView();

  if (!challengesEnabled || !challenges.challenges) {
    return null;
  }

  const completedIds = new Set(
    challenges.progress.filter((progress) => progress.completed).map((progress) => progress.challengeId),
  );
  const allChallengesCompleted =
    completedIds.has(challenges.challenges.simple.id) &&
    completedIds.has(challenges.challenges.complex.id);

  return (
    <Button
      onClick={challenges.openDialog}
      data-tour="challenges-button"
      aria-label={t("challenges.buttonAriaLabel")}
      variant="ghost"
      color={allChallengesCompleted ? "neutral" : "primary"}
      icon={faTrophy}
      iconClassName={TOOLBAR_ICON_CLASS_NAME}
      className={
        allChallengesCompleted
          ? `${TOOLBAR_COMPACT_BUTTON_CLASS_NAME} opacity-50`
          : TOOLBAR_COMPACT_BUTTON_CLASS_NAME
      }
      hideLabelOnMobile
    >
      {t("challenges.buttonLabel")}
    </Button>
  );
};

export default ToolbarChallengesButton;
