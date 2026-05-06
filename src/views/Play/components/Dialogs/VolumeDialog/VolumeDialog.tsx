import type { ChangeEvent } from "react";
import { Dialog } from "@components/Dialogs/Dialog";
import { Button } from "@components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSound } from "@providers/Sound";
import { useTranslation } from "@i18n";
import { VOLUME_DIALOG_TITLE_ID } from "./constants";
import type { VolumeDialogProps } from "./types";
import { getChannelLabel, getChannelVolumeValue, getVolumeIcon } from "./utils";

const VolumeDialog = ({ visible, onClose }: VolumeDialogProps) => {
  const { t } = useTranslation();
  const { channels, setChannelEnabled, setChannelMuted, setChannelVolume } =
    useSound();

  const handleVolumeChange = (
    channelId: string,
    muted: boolean,
    enabled: boolean,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const newVolume = Number(event.target.value);
    setChannelVolume(channelId, newVolume);

    if (newVolume > 0 && !enabled) {
      setChannelEnabled(channelId, true);
    }

    if (muted && newVolume > 0) {
      setChannelMuted(channelId, false);
    }
  };

  const handleMuteToggle = (
    channelId: string,
    muted: boolean,
    enabled: boolean,
  ) => {
    if (!enabled) {
      setChannelEnabled(channelId, true);
      setChannelMuted(channelId, false);
      return;
    }

    setChannelMuted(channelId, !muted);
  };

  const handleEnabledChange = (
    channelId: string,
    enabled: boolean,
    muted: boolean,
    volume: number,
  ) => {
    setChannelEnabled(channelId, enabled);

    if (enabled && muted && volume > 0) {
      setChannelMuted(channelId, false);
    }
  };

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      titleId={VOLUME_DIALOG_TITLE_ID}
      title={t("play.volumeDialog.title")}
      panelClassName="max-w-md"
    >
      <div className="mt-4 space-y-3">
        {channels.map((channel) => {
          const channelLabel = getChannelLabel(channel, t);
          const renderedVolume = getChannelVolumeValue(channel);
          const silenced = !channel.enabled || channel.muted;
          const icon = getVolumeIcon(channel.volume, silenced);

          return (
            <div
              key={channel.id}
              className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  {channelLabel}
                </p>
                <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={channel.enabled}
                    onChange={(event) => {
                      handleEnabledChange(
                        channel.id,
                        event.target.checked,
                        channel.muted,
                        channel.volume,
                      );
                    }}
                    aria-label={t("play.volumeDialog.channelEnabledAriaLabel", {
                      channel: channelLabel,
                    })}
                    className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-primary dark:border-neutral-600"
                  />
                  <span>{t("play.volumeDialog.enabledLabel")}</span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() =>
                    handleMuteToggle(channel.id, channel.muted, channel.enabled)
                  }
                  variant="ghost"
                  color={silenced ? "danger" : "neutral"}
                  aria-label={
                    silenced
                      ? t("play.volumeDialog.unmuteChannelAriaLabel", {
                          channel: channelLabel,
                        })
                      : t("play.volumeDialog.muteChannelAriaLabel", {
                          channel: channelLabel,
                        })
                  }
                >
                  <FontAwesomeIcon icon={icon} className="text-lg w-5" />
                </Button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  disabled={!channel.enabled}
                  value={renderedVolume}
                  onChange={(event) =>
                    handleVolumeChange(
                      channel.id,
                      channel.muted,
                      channel.enabled,
                      event,
                    )
                  }
                  aria-label={t(
                    "play.volumeDialog.channelVolumeSliderAriaLabel",
                    { channel: channelLabel },
                  )}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-primary disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-700"
                />
                <span className="min-w-[3ch] text-right text-sm font-semibold tabular-nums text-neutral-700 dark:text-neutral-200">
                  {renderedVolume}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Dialog>
  );
};

export default VolumeDialog;
