import type { JSX } from "react";
import { faSquarePollHorizontal } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@components";
import { useTranslation } from "@i18n";
import { usePlayView } from "@views/Play/providers";
import {
  TOOLBAR_COMPACT_BUTTON_CLASS_NAME,
  TOOLBAR_ICON_CLASS_NAME,
} from "./constants";

const ToolbarResultsButton = (): JSX.Element | null => {
  const { t } = useTranslation();
  const {
    controller: { canReopenEndOfGameDialog, reopenEndOfGameDialog },
  } = usePlayView();

  if (!canReopenEndOfGameDialog) {
    return null;
  }

  return (
    <Button
      onClick={reopenEndOfGameDialog}
      aria-label={t("play.toolbar.resultsAriaLabel")}
      variant="ghost"
      icon={faSquarePollHorizontal}
      iconClassName={TOOLBAR_ICON_CLASS_NAME}
      hideLabelOnMobile
      className={TOOLBAR_COMPACT_BUTTON_CLASS_NAME}
    >
      {t("play.toolbar.resultsButton")}
    </Button>
  );
};

export default ToolbarResultsButton;
