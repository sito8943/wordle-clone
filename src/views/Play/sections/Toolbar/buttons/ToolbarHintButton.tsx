import type { JSX } from "react";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@components";
import { useTranslation } from "@i18n";
import { useFeatureFlags } from "@providers/FeatureFlags";
import { usePlayView } from "@views/Play/providers";
import {
  TOOLBAR_COMPACT_BUTTON_CLASS_NAME,
  TOOLBAR_ICON_CLASS_NAME,
} from "./constants";

const ToolbarHintButton = (): JSX.Element | null => {
  const { t } = useTranslation();
  const { hintsEnabled } = useFeatureFlags();
  const { controller } = usePlayView();
  const {
    hintsEnabledForDifficulty,
    useHint,
    hintButtonDisabled,
    hintsRemaining,
  } = controller;

  if (!hintsEnabled || !hintsEnabledForDifficulty) {
    return null;
  }

  return (
    <Button
      onClick={useHint}
      aria-label={t("play.toolbar.hintAriaLabel")}
      data-tour="hint-button"
      variant="ghost"
      color={!hintButtonDisabled ? "primary" : "secondary"}
      icon={faLightbulb}
      iconClassName={TOOLBAR_ICON_CLASS_NAME}
      className={TOOLBAR_COMPACT_BUTTON_CLASS_NAME}
      hideLabelOnMobile
      disabled={hintButtonDisabled}
    >
      {t("play.toolbar.hintButton", { count: hintsRemaining })}
    </Button>
  );
};

export default ToolbarHintButton;
