import { useMemo } from "react";
import { useFeatureFlags } from "@providers/FeatureFlags";
import type { SoundContextType } from "./types";
import { soundTemplate } from "./soundTemplate";

const useSound = (): SoundContextType => {
  const sound = soundTemplate.useSound();
  const { masterAndMusicChannelsEnabled } = useFeatureFlags();

  const visibleChannels = useMemo(() => {
    if (masterAndMusicChannelsEnabled) {
      return sound.channels;
    }

    return sound.channels.filter(
      (channel) =>
        channel.kind === "sfx" || channel.id === "sfx",
    );
  }, [masterAndMusicChannelsEnabled, sound.channels]);

  if (masterAndMusicChannelsEnabled) {
    return sound;
  }

  return {
    ...sound,
    channels: visibleChannels,
    getChannels: () => visibleChannels,
  };
};

export { useSound };
