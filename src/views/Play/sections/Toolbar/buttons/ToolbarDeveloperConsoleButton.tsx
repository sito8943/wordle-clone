import type { JSX } from "react";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@components";
import { useTranslation } from "@i18n";
import { usePlayView } from "@views/Play/providers";
import {
  TOOLBAR_COMPACT_BUTTON_CLASS_NAME,
  TOOLBAR_ICON_CLASS_NAME,
} from "./constants";

const ToolbarDeveloperConsoleButton = (): JSX.Element | null => {
  const { t } = useTranslation();
  const {
    developerConsoleEnabled,
    controller: { openDeveloperConsoleDialog },
  } = usePlayView();

  if (!developerConsoleEnabled) {
    return null;
  }

  return (
    <Button
      onClick={openDeveloperConsoleDialog}
      aria-label={t("play.toolbar.developerConsoleAriaLabel")}
      variant="solid"
      color="danger"
      icon={faCode}
      iconClassName={TOOLBAR_ICON_CLASS_NAME}
      hideLabelOnMobile
      className={TOOLBAR_COMPACT_BUTTON_CLASS_NAME}
    >
      {t("play.toolbar.developerConsoleButton")}
    </Button>
  );
};

export default ToolbarDeveloperConsoleButton;
