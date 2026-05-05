import { useState, type JSX } from "react";
import { Button } from "@components";
import { useTranslation } from "@i18n";
import { useFeatureFlags } from "@providers/FeatureFlags";
import { useSound } from "@providers/Sound";
import VolumeDialog from "@views/Play/components/Dialogs/VolumeDialog/VolumeDialog";
import { getToolbarVolumeIcon } from "../utils";
import {
  TOOLBAR_COMPACT_BUTTON_CLASS_NAME,
  TOOLBAR_ICON_CLASS_NAME,
} from "./constants";

const ToolbarVolumeButton = (): JSX.Element | null => {
  const { t } = useTranslation();
  const { soundEnabled } = useFeatureFlags();
  const { volume, muted } = useSound();
  const [showVolumeDialog, setShowVolumeDialog] = useState(false);

  if (!soundEnabled) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setShowVolumeDialog(true)}
        aria-label={t("play.toolbar.volumeAriaLabel")}
        variant="ghost"
        icon={getToolbarVolumeIcon(volume, muted)}
        iconClassName={TOOLBAR_ICON_CLASS_NAME}
        className={TOOLBAR_COMPACT_BUTTON_CLASS_NAME}
        hideLabelOnMobile
      >
        {t("play.toolbar.volumeAriaLabel")}
      </Button>

      {showVolumeDialog ? (
        <VolumeDialog visible onClose={() => setShowVolumeDialog(false)} />
      ) : null}
    </>
  );
};

export default ToolbarVolumeButton;
