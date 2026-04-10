import { Dialog } from "@components/Dialogs/Dialog";
import { Button } from "@components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVolumeHigh,
  faVolumeLow,
  faVolumeOff,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useSound } from "@providers/Sound";
import { useTranslation } from "@i18n";
import { VOLUME_DIALOG_TITLE_ID } from "./constants";
import type { VolumeDialogProps } from "./types";

const getVolumeIcon = (volume: number, muted: boolean) => {
  if (muted) return faVolumeXmark;
  if (volume === 0) return faVolumeOff;
  if (volume < 50) return faVolumeLow;
  return faVolumeHigh;
};

const VolumeDialog = ({ visible, onClose }: VolumeDialogProps) => {
  const { t } = useTranslation();
  const { volume, setVolume, muted, setMuted } = useSound();

  const icon = getVolumeIcon(volume, muted);

  const handleMuteToggle = () => {
    setMuted(!muted);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(event.target.value);
    setVolume(newVolume);
    if (muted && newVolume > 0) {
      setMuted(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      titleId={VOLUME_DIALOG_TITLE_ID}
      title={t("play.volumeDialog.title")}
      panelClassName="max-w-sm"
    >
      <div className="mt-4 flex items-center gap-3">
        <Button
          onClick={handleMuteToggle}
          variant="ghost"
          color={muted ? "danger" : "neutral"}
          aria-label={
            muted
              ? t("play.volumeDialog.unmuteAriaLabel")
              : t("play.volumeDialog.muteAriaLabel")
          }
        >
          <FontAwesomeIcon icon={icon} className="text-lg w-5" />
        </Button>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={muted ? 0 : volume}
          onChange={handleVolumeChange}
          aria-label={t("play.volumeDialog.volumeSliderAriaLabel")}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-primary dark:bg-neutral-700"
        />
        <span className="min-w-[3ch] text-right text-sm font-semibold tabular-nums text-neutral-700 dark:text-neutral-200">
          {muted ? 0 : volume}
        </span>
      </div>
    </Dialog>
  );
};

export default VolumeDialog;
