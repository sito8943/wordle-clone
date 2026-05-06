import { useState, type JSX } from "react";
import { Button } from "@components";
import { useTranslation } from "@i18n";
import { useFeatureFlags } from "@providers/FeatureFlags";
import { useSound } from "@providers/Sound";
import { SOUND_MASTER_CHANNEL_ID } from "@providers/Sound/constants";
import VolumeDialog from "@views/Play/components/Dialogs/VolumeDialog/VolumeDialog";
import { getToolbarVolumeIcon } from "../utils";
import {
  TOOLBAR_COMPACT_BUTTON_CLASS_NAME,
  TOOLBAR_ICON_CLASS_NAME,
} from "./constants";

const ToolbarVolumeButton = (): JSX.Element | null => {
  const { t } = useTranslation();
  const { soundEnabled } = useFeatureFlags();
  const { channels } = useSound();
  const masterSoundChannel =
    channels.find((channel) => channel.kind === "master") ??
    channels.find((channel) => channel.id === SOUND_MASTER_CHANNEL_ID) ??
    channels[0];
  const volume = masterSoundChannel?.volume ?? 100;
  const muted = masterSoundChannel
    ? !masterSoundChannel.enabled || masterSoundChannel.muted
    : false;
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
