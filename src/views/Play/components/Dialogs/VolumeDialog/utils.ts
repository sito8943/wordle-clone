import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faVolumeHigh,
  faVolumeLow,
  faVolumeOff,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";

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
