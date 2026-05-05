import type { JSX } from "react";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@components";
import { useTranslation } from "@i18n";
import { usePlayView } from "@views/Play/providers";
import {
  TOOLBAR_COMPACT_BUTTON_CLASS_NAME,
  TOOLBAR_ICON_CLASS_NAME,
} from "./constants";

const ToolbarGameplayTourButton = (): JSX.Element => {
  const { t } = useTranslation();
  const {
    controller: { openGameplayTour, showGameplayTourDialog },
  } = usePlayView();

  return (
    <Button
      onClick={openGameplayTour}
      aria-label={t("play.toolbar.tourAriaLabel")}
      variant="ghost"
      icon={faCircleQuestion}
      iconClassName={TOOLBAR_ICON_CLASS_NAME}
      className={`${TOOLBAR_COMPACT_BUTTON_CLASS_NAME} hidden!`}
      hideLabelOnMobile
      disabled={showGameplayTourDialog}
    >
      {t("play.toolbar.tourButton")}
    </Button>
  );
};

export default ToolbarGameplayTourButton;
