import type { SoundContextType } from "./types";
import { soundTemplate } from "./soundTemplate";

const useSound = (): SoundContextType => {
  return soundTemplate.useSound();
};

export { useSound };
