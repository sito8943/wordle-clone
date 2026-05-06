import type { SoundChannelState } from "@providers/Sound";

export type VolumeDialogProps = {
  visible: boolean;
  onClose: () => void;
};

export type VolumeDialogChannel = SoundChannelState;

export type VolumeDialogTranslate = (
  key: string,
  options?: Record<string, unknown>,
) => string;
