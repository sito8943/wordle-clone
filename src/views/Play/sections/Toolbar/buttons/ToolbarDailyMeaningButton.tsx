import type { JSX } from "react";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@components";
import { WORDLE_MODE_IDS } from "@domain/wordle";
import { useTranslation } from "@i18n";
import { usePlayView } from "@views/Play/providers";
import {
  TOOLBAR_COMPACT_BUTTON_CLASS_NAME,
  TOOLBAR_ICON_CLASS_NAME,
} from "./constants";

const ToolbarDailyMeaningButton = (): JSX.Element | null => {
  const { t } = useTranslation();
  const {
    controller: { activeModeId, openDailyMeaningDialog },
  } = usePlayView();

  if (activeModeId !== WORDLE_MODE_IDS.DAILY) {
    return null;
  }

  return (
    <Button
      onClick={openDailyMeaningDialog}
      aria-label={t("play.toolbar.dailyMeaningAriaLabel")}
      data-tour="daily-meaning-button"
      variant="ghost"
      icon={faCircleInfo}
      iconClassName={TOOLBAR_ICON_CLASS_NAME}
      className={TOOLBAR_COMPACT_BUTTON_CLASS_NAME}
      hideLabelOnMobile
    >
      {t("play.toolbar.dailyMeaningButton")}
    </Button>
  );
};

export default ToolbarDailyMeaningButton;
