import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faVolumeHigh,
  faVolumeLow,
  faVolumeOff,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { VOLUME_DIALOG_CHANNEL_LABEL_KEYS } from "./constants";
import type { VolumeDialogChannel, VolumeDialogTranslate } from "./types";

export const getVolumeIcon = (
  volume: number,
  muted: boolean,
): IconDefinition => {
  if (muted) {
    return faVolumeXmark;
  }

  if (volume === 0) {
    return faVolumeOff;
  }

  if (volume < 50) {
    return faVolumeLow;
  }

  return faVolumeHigh;
};

export const getChannelVolumeValue = (channel: VolumeDialogChannel): number => {
  if (!channel.enabled || channel.muted) {
    return 0;
  }

  return channel.volume;
};

export const getChannelLabel = (
  channel: VolumeDialogChannel,
  t: VolumeDialogTranslate,
): string => {
  if (channel.kind === "master") {
    return t(VOLUME_DIALOG_CHANNEL_LABEL_KEYS.master);
  }

  if (channel.kind === "music") {
    return t(VOLUME_DIALOG_CHANNEL_LABEL_KEYS.music);
  }

  if (channel.kind === "sfx") {
    return t(VOLUME_DIALOG_CHANNEL_LABEL_KEYS.sfx);
  }

  return channel.label;
};
