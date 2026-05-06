import { useMemo } from "react";
import type { SoundContextType } from "./types";
import { soundTemplate } from "./soundTemplate";
import { normalizeSoundContext } from "./useSoundUtils";

const useSound = (): SoundContextType => {
  const soundContext = soundTemplate.useSound();

  return useMemo(
    () => normalizeSoundContext(soundContext),
    [soundContext],
  );
};

export { useSound };
