import { useContext } from "react";
import { SoundContext } from "./SoundContext";
import type { SoundContextType } from "./types";

const fallbackSoundContextValue: SoundContextType = {
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
