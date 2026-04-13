import {
  faVolumeXmark,
  faVolumeOff,
  faVolumeLow,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";

export const getToolbarVolumeIcon = (volume: number, muted: boolean) => {
  if (muted) return faVolumeXmark;
  if (volume === 0) return faVolumeOff;
  if (volume < 50) return faVolumeLow;
  return faVolumeHigh;
};
