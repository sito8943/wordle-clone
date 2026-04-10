import { useContext } from "react";
import { SoundContext } from "./SoundContext";
import type { SoundContextType } from "./types";

const fallbackSoundContextValue: SoundContextType = {
  soundEnabled: true,
  setSoundEnabled: () => undefined,
  volume: 100,
  setVolume: () => undefined,
  muted: false,
  setMuted: () => undefined,
  playSound: () => undefined,
};

const useSound = (): SoundContextType => {
  const context = useContext(SoundContext);

  if (context === undefined) {
    return fallbackSoundContextValue;
  }

  return context;
};

export { useSound };
