import type { SoundChannelState, SoundContextType } from "./types";

const FALLBACK_MASTER_CHANNEL_ID = "master";
const FALLBACK_MASTER_CHANNEL_LABEL = "Master";
const FALLBACK_SOUND_ENABLED = true;
const FALLBACK_SOUND_VOLUME = 100;
const FALLBACK_SOUND_MUTED = false;

type LegacyOrPartialSoundContext = Partial<SoundContextType> & {
  playSound?: SoundContextType["playSound"];
  setSoundEnabled?: SoundContextType["setSoundEnabled"];
  setVolume?: SoundContextType["setVolume"];
  setMuted?: SoundContextType["setMuted"];
  soundEnabled?: boolean;
  volume?: number;
  muted?: boolean;
};

const isSoundChannelState = (value: unknown): value is SoundChannelState => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const channel = value as Partial<SoundChannelState>;
  return (
    typeof channel.id === "string" &&
    typeof channel.enabled === "boolean" &&
    typeof channel.volume === "number" &&
    typeof channel.muted === "boolean"
  );
};

const toMasterChannelFallback = (
  soundContext: LegacyOrPartialSoundContext,
): SoundChannelState => ({
  id: FALLBACK_MASTER_CHANNEL_ID,
  label: FALLBACK_MASTER_CHANNEL_LABEL,
  kind: "master",
  enabled: soundContext.soundEnabled ?? FALLBACK_SOUND_ENABLED,
  volume: soundContext.volume ?? FALLBACK_SOUND_VOLUME,
  muted: soundContext.muted ?? FALLBACK_SOUND_MUTED,
});

const resolveChannels = (
  soundContext: LegacyOrPartialSoundContext,
): SoundChannelState[] => {
  if (Array.isArray(soundContext.channels)) {
    const channels = soundContext.channels.filter(isSoundChannelState);
    if (channels.length > 0) {
      return channels;
    }
  }

  return [toMasterChannelFallback(soundContext)];
};

const noopSetChannelEnabled: SoundContextType["setChannelEnabled"] = () =>
  undefined;
const noopSetChannelVolume: SoundContextType["setChannelVolume"] = () =>
  undefined;
const noopSetChannelMuted: SoundContextType["setChannelMuted"] = () => undefined;
const noopSetSoundEnabled: SoundContextType["setSoundEnabled"] = () => undefined;
const noopSetVolume: SoundContextType["setVolume"] = () => undefined;
const noopSetMuted: SoundContextType["setMuted"] = () => undefined;
const noopPlaySound: SoundContextType["playSound"] = () => undefined;
const noopPlayMusic: SoundContextType["playMusic"] = () => undefined;
const noopPauseMusic: SoundContextType["pauseMusic"] = () => undefined;
const noopResumeMusic: SoundContextType["resumeMusic"] = () => undefined;
const noopStopMusic: SoundContextType["stopMusic"] = () => undefined;
const noopGetActiveMusicTrack: SoundContextType["getActiveMusicTrack"] = () =>
  null;

export const normalizeSoundContext = (
  input: SoundContextType | LegacyOrPartialSoundContext,
): SoundContextType => {
  const soundContext = input as LegacyOrPartialSoundContext;
  const channels = resolveChannels(soundContext);
  const masterChannel =
    channels.find((channel) => channel.id === FALLBACK_MASTER_CHANNEL_ID) ??
    channels[0] ??
    toMasterChannelFallback(soundContext);

  const baseSetChannelEnabled =
    typeof soundContext.setChannelEnabled === "function"
      ? soundContext.setChannelEnabled
      : noopSetChannelEnabled;
  const baseSetChannelVolume =
    typeof soundContext.setChannelVolume === "function"
      ? soundContext.setChannelVolume
      : noopSetChannelVolume;
  const baseSetChannelMuted =
    typeof soundContext.setChannelMuted === "function"
      ? soundContext.setChannelMuted
      : noopSetChannelMuted;

  const setSoundEnabled =
    typeof soundContext.setSoundEnabled === "function"
      ? soundContext.setSoundEnabled
      : typeof soundContext.setChannelEnabled === "function"
        ? (enabled: boolean) =>
            soundContext.setChannelEnabled?.(FALLBACK_MASTER_CHANNEL_ID, enabled)
        : noopSetSoundEnabled;
  const setVolume =
    typeof soundContext.setVolume === "function"
      ? soundContext.setVolume
      : typeof soundContext.setChannelVolume === "function"
        ? (volume: number) =>
            soundContext.setChannelVolume?.(FALLBACK_MASTER_CHANNEL_ID, volume)
        : noopSetVolume;
  const setMuted =
    typeof soundContext.setMuted === "function"
      ? soundContext.setMuted
      : typeof soundContext.setChannelMuted === "function"
        ? (muted: boolean) =>
            soundContext.setChannelMuted?.(FALLBACK_MASTER_CHANNEL_ID, muted)
        : noopSetMuted;

  const setChannelEnabled: SoundContextType["setChannelEnabled"] = (
    channelId,
    enabled,
  ) => {
    if (typeof soundContext.setChannelEnabled === "function") {
      baseSetChannelEnabled(channelId, enabled);
      return;
    }

    if (
      channelId === FALLBACK_MASTER_CHANNEL_ID &&
      typeof soundContext.setSoundEnabled === "function"
    ) {
      soundContext.setSoundEnabled(enabled);
    }
  };

  const setChannelVolume: SoundContextType["setChannelVolume"] = (
    channelId,
    volume,
  ) => {
    if (typeof soundContext.setChannelVolume === "function") {
      baseSetChannelVolume(channelId, volume);
      return;
    }

    if (
      channelId === FALLBACK_MASTER_CHANNEL_ID &&
      typeof soundContext.setVolume === "function"
    ) {
      soundContext.setVolume(volume);
    }
  };

  const setChannelMuted: SoundContextType["setChannelMuted"] = (
    channelId,
    muted,
  ) => {
    if (typeof soundContext.setChannelMuted === "function") {
      baseSetChannelMuted(channelId, muted);
      return;
    }

    if (
      channelId === FALLBACK_MASTER_CHANNEL_ID &&
      typeof soundContext.setMuted === "function"
    ) {
      soundContext.setMuted(muted);
    }
  };

  return {
    soundEnabled: soundContext.soundEnabled ?? masterChannel.enabled,
    setSoundEnabled,
    volume: soundContext.volume ?? masterChannel.volume,
    setVolume,
    muted: soundContext.muted ?? masterChannel.muted,
    setMuted,
    channels,
    getChannels:
      typeof soundContext.getChannels === "function"
        ? soundContext.getChannels
        : () => channels,
    setChannelEnabled,
    setChannelVolume,
    setChannelMuted,
    playSound:
      typeof soundContext.playSound === "function"
        ? soundContext.playSound
        : noopPlaySound,
    playMusic:
      typeof soundContext.playMusic === "function"
        ? soundContext.playMusic
        : noopPlayMusic,
    pauseMusic:
      typeof soundContext.pauseMusic === "function"
        ? soundContext.pauseMusic
        : noopPauseMusic,
    resumeMusic:
      typeof soundContext.resumeMusic === "function"
        ? soundContext.resumeMusic
        : noopResumeMusic,
    stopMusic:
      typeof soundContext.stopMusic === "function"
        ? soundContext.stopMusic
        : noopStopMusic,
    getActiveMusicTrack:
      typeof soundContext.getActiveMusicTrack === "function"
        ? soundContext.getActiveMusicTrack
        : noopGetActiveMusicTrack,
  };
};
